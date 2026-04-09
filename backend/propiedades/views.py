from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
import random

from backend.backend.interceptors import get_client_ip
from .serializers import (
    PropiedadSerializer,
    DivisaSerializer,
    FavoritoSerializer,
    TipoPropSerializer,
    AmenidadSerializer,
    CategoriaAmenidadSerializer,
    UbicacionSerializer,
    ImagenSerializer,
    CardSerializer,
)
from .models import (
    Propiedad,
    Divisa,
    PropiedadImagen,
    Favorito,
    TipoPropiedad,
    Amenidad,
    CategoriasAmenidad,
    Ubicaciones,
    Cards,
)
from .filters import PropiedadFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
import traceback
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

from loguru import logger

# Create your views here.
method_not_allowed_response = Response(
    {"error": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED
)

not_authenticated_response = Response(
    {"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
)

not_host_response = Response(
    {"error": "User is not a host"}, status=status.HTTP_403_FORBIDDEN
)

not_admin_response = Response(
    {"error": "User is not an admin"}, status=status.HTTP_403_FORBIDDEN
)

not_authenticated_log = "Intento de consulta de propiedades por host sin autenticación"


class PropiedadViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Propiedad.objects.select_related(
            "divisa", "tipo_propiedad"
        ).prefetch_related("amenidades", "imagenes")

        if self.action == "list":
            queryset = queryset.filter(activa=True)

        return queryset

    serializer_class = PropiedadSerializer

    filter_backends = [DjangoFilterBackend, OrderingFilter]

    ordering_fields = ["precio_noche", "habitaciones", "max_huespedes"]

    filterset_class = PropiedadFilter
    serializer_class = PropiedadSerializer

    @action(detail=False, methods=["GET"])
    def cards(self, request):
        logger.info(
            f"Consulta de cards realizada por usuario "
            f"{request.user.pk if request.user.is_authenticated else 'anonimo'}"
        )
        queryset = Cards.objects.all()
        w_city = request.query_params.get("w_city")
        if w_city and w_city.lower() == "true":
            ciudad = (
                Cards.objects.values_list("ciudad", flat=True)
                .distinct()
                .order_by("?")
                .first()
            )
            if ciudad:
                queryset = queryset.filter(ciudad__iexact=ciudad)
        serializer = CardSerializer(
            queryset.order_by("?")[:7], many=True, context={"request": request}
        )
        return Response(
            {"ciudad": ciudad if w_city else None, "cards": serializer.data}
        )

    @action(detail=False, methods=["GET"])
    def landing(self, request):
        logger.info(
            f"Consulta de landing realizada por usuario "
            f"{request.user.pk if request.user.is_authenticated else 'anonimo'}"
        )
        # 6 ciudades aleatorias
        ciudades = list(Cards.objects.values_list("ciudad", flat=True).distinct())

        random.shuffle(ciudades)

        ciudades = ciudades[:6]

        # Cards por ciudad
        ciudades_data = []

        for ciudad in ciudades:

            cards = Cards.objects.filter(ciudad=ciudad).order_by("?")[:7]

            serializer = CardSerializer(cards, many=True, context={"request": request})

            ciudades_data.append({"ciudad": ciudad, "cards": serializer.data})

        # Favoritos (si está logueado)
        favoritos_data = []

        if request.user.is_authenticated:
            logger.bind(audit=True).info(
                f"Usuario {request.user.pk} consultó sus favoritos en la landing"
            )

            favoritos = Cards.objects.filter(es_favorito=True).order_by("?")[:7]

            serializer = CardSerializer(
                favoritos, many=True, context={"request": request}
            )

            favoritos_data = serializer.data

        return Response({"favoritos": favoritos_data, "ciudades": ciudades_data})

    @action(detail=False, methods=["GET"])
    def locations(self, request, pk=None):
        logger.bind(audit=True).info("Se realizó una consulta de ubicaciones")
        queryset = Ubicaciones.objects.all()
        serializer = UbicacionSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["GET"])
    def by_host(self, request):
        user = request.user

        if not request.user.is_authenticated:
            logger.warning(not_authenticated_log)
            return not_authenticated_response

        if (
            request.user.rol.nombre != "anfitrion"
            and request.user.rol.nombre != "ambos"
        ):
            logger.warning(
                f"Usuario {user.pk} intentó acceder sin rol válido: {user.rol.nombre}"
            )
            return not_host_response

        host_id = user.pk

        logger.bind(audit=True).info(f"Usuario {host_id} consultó sus propiedades")

        queryset = (
            Propiedad.objects.select_related("divisa", "tipo_propiedad")
            .prefetch_related("amenidades", "imagenes")
            .filter(anfitrion=host_id)
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        anfitrion = request.user

        ip = get_client_ip(request)

        if not request.user.is_authenticated:
            logger.warning(not_authenticated_log)
            return not_authenticated_response

        if (
            request.user.rol.nombre != "anfitrion"
            and request.user.rol.nombre != "ambos"
        ):
            logger.warning(
                f"Usuario {anfitrion.pk} intentó acceder sin rol válido: {anfitrion.rol.nombre}"
            )
            return not_host_response

        serializer = PropiedadSerializer(
            data=request.data, context={"anfitrion": anfitrion}
        )

        # serializer.is_valid(raise_exception=True)
        if not serializer.is_valid():
            logger.warning(
                f"Validación fallida al crear propiedad por usuario {anfitrion.pk}: "
                f"{serializer.errors}"
            )
            return Response(serializer.errors, status=400)

        try:
            propiedad = serializer.save()
            logger.bind(audit=True).info(
                f"Propiedad {propiedad.pk} creada por usuario {anfitrion.pk} desde IP {ip}"
            )

        except ValidationError as ve:
            logger.error(f"ValidationError en creación de propiedad: {ve.detail}")
            return Response({"errores": ve.detail}, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as ie:
            logger.error(f"IntegrityError al crear propiedad: {str(ie)}")
            if "propiedad.direccion" in str(ie):
                return Response(
                    {"direccion": ["Esa dirección ya fue registrada"]}, status=400
                )
            return Response({"error": "Error de integridad"}, status=400)

        except Exception as e:
            logger.exception(f"Error inesperado creando propiedad: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            self.get_serializer(propiedad).data, status=status.HTTP_201_CREATED
        )

    def partial_update(self, request, *args, **kwargs):
        ip = get_client_ip(request)
        if not request.user.is_authenticated:
            logger.warning(not_authenticated_log)
            return not_authenticated_response

        if (
            request.user.rol.nombre != "anfitrion"
            and request.user.rol.nombre != "ambos"
        ):
            logger.warning(
                f"Usuario {request.user.pk} intentó acceder sin rol válido: {request.user.rol.nombre}"
            )
            return not_host_response
        instance = self.get_object()
        logger.bind(audit=True).info(
            f"Usuario {request.user.pk} modificó propiedad {instance.pk} desde IP {ip}"
        )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        ip = get_client_ip(request)
        if not request.user.is_authenticated:
            logger.warning(not_authenticated_log)
            return not_authenticated_response

        if (
            request.user.rol.nombre != "anfitrion"
            and request.user.rol.nombre != "ambos"
        ):
            logger.warning(
                f"Usuario {request.user.pk} intentó acceder sin rol válido: {request.user.rol.nombre}"
            )
            return not_host_response

        instance = self.get_object()
        instance.activa = not instance.activa
        instance.save(update_fields=["activa"])

        logger.bind(audit=True).info(
            f"Usuario {request.user.pk} modificó propiedad {instance.pk} a {instance.activa} desde IP {ip}"
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class DivisaViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
):
    queryset = Divisa.objects.all().order_by("nombre")
    serializer_class = DivisaSerializer

    def create(self, request, *args, **kwargs):
        ip = get_client_ip(request)
        user = request.user
        if not user.is_authenticated:
            logger.warning(not_authenticated_log)
            return not_authenticated_response

        if user.rol.nombre != "administrador":
            return not_admin_response

        logger.bind(audit=True).info(
            f"Usuario {user.pk} creó divisa {request.data.get('nombre')} desde IP {ip}"
        )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = request.user
        ip = get_client_ip(request)
        if not user.is_authenticated:
            logger.warning(not_authenticated_log)
            return not_authenticated_response

        if user.rol.nombre != "administrador":
            return not_admin_response

        instance = self.get_object()
        logger.bind(audit=True).info(
            f"Usuario {user.pk} está actualizando la divisa {instance.pk} con datos: {request.data} desde IP {ip}"
        )
        return super().update(request, *args, **kwargs)


class FavoritoViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
):
    queryset = Favorito.objects.all()
    serializer_class = FavoritoSerializer

    def list(self, request):
        ip = get_client_ip(request)
        user = request.user

        if not user.is_authenticated:
            logger.warning(not_authenticated_log)
            return not_authenticated_response

        queryset = Cards.objects.filter(
            propiedad_id__in=Favorito.objects.filter(usuario=user).values_list(
                "propiedad_id", flat=True
            )
        )

        logger.bind(audit=True).info(
            f"Usuario {request.user.pk} consultó sus favoritos desde IP {ip}"
        )

        serializer = CardSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        ip = get_client_ip(request)
        usuario = request.user

        if not usuario.is_authenticated:
            logger.warning(not_authenticated_log)
            return not_authenticated_response

        propiedad_ = request.data.get("propiedad")

        propiedad_object = Propiedad.objects.get(pk=propiedad_)

        favorito, created = Favorito.objects.get_or_create(
            usuario=usuario, propiedad=propiedad_object
        )

        logger.bind(audit=True).info(
            f"Usuario {request.user.pk} marcó como favorito la propiedad {propiedad_} (creado: {created}) desde IP {ip}"
        )

        return Response(
            {"created": created, "id": favorito.favorito_id},
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        propiedad_ = self.get_object().propiedad_id
        ip = get_client_ip(request)
        logger.bind(audit=True).info(
            f"Usuario {request.user.pk} eliminó la propiedad {propiedad_} de sus favoritos desde IP {ip}"
        )
        return super().destroy(request, *args, **kwargs)


class AmenidadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Amenidad.objects.all().order_by("categoria")
    serializer_class = AmenidadSerializer

    @action(detail=False, methods=["GET"])
    def categorias(self, request, pk=None):
        queryset = CategoriasAmenidad.objects.all()
        serializer = CategoriaAmenidadSerializer(queryset, many=True)
        return Response(serializer.data)


class TipoPropiedadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoPropiedad.objects.all().order_by("tipo")
    serializer_class = TipoPropSerializer


class ImagenViewSet(
    mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    queryset = PropiedadImagen.objects.all()
    serializer_class = ImagenSerializer

    @action(detail=False, methods=["POST"])
    def save_many(self, request, *args, **kwargs):
        ip = get_client_ip(request)
        propiedad_id = request.data.get("propiedad")
        imagenes = request.FILES.getlist("imagenes")
        ordenes = request.data.getlist("ordenes")
        propiedad = Propiedad.objects.get(pk=propiedad_id)
        total_existentes = PropiedadImagen.objects.filter(
            propiedad_id=propiedad_id
        ).count()
        lista = []
        if total_existentes + len(imagenes) > 10:
            logger.error(
                f"Máximo 10 imágenes por propiedad. Intento de guardar más imágenes para propiedad {propiedad_id} por usuario {request.user.pk} desde IP {ip}"
            )
            return Response(
                {"error": "Máximo 10 imágenes por propiedad"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(imagenes) < 1:
            logger.error(
                f"Mínimo 1 imagen por propiedad. Intento de guardar sin imágenes para propiedad {propiedad_id} por usuario {request.user.pk} desde IP {ip}"
            )
            return Response(
                {"error": "Mínimo 1 imagen por propiedad"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(ordenes) != len(imagenes):
            logger.error(
                f"Número de órdenes no coincide con el número de imágenes para propiedad {propiedad_id} por usuario {request.user.pk} desde IP {ip}"
            )
            return Response(
                {"error": "Debe enviar un orden por cada imagen"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for i, imagen in enumerate(imagenes):
            orden = int(ordenes[i])

            if orden < 1 or orden > 10:
                logger.error(
                    f"Orden inválido para imagen de propiedad {propiedad_id} por usuario {request.user.pk}"
                )
                return Response(
                    {"error": "El orden debe estar entre 1 y10"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                try:
                    saved = PropiedadImagen.objects.create(
                        propiedad=propiedad,
                        url=imagen,
                        orden=orden,
                        updated_by=propiedad.anfitrion.pk,
                    )
                    lista.append(saved)
                    logger.info(
                        f"Imagen {saved.prop_ima_id} guardada con orden {saved.orden}"
                    )

                except Exception as e:
                    logger.exception(f"Error inesperado guardando imagenes: {str(e)}")
                    return Response(
                        {"error": f"No se pudo guardar la imagen: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        serializer = ImagenSerializer(lista, many=True)

        logger.bind(audit=True).info(
            f"Imagenes guardadas para propiedad {propiedad.pk} por usuario {request.user.pk}"
        )

        return Response(
            {
                "message": f"Imágenes para {propiedad.titulo} guardadas correctamente",
                "imagenes": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        propiedad_id = request.data.get("propiedad")
        imagen = request.FILES.get("imagen")
        orden = request.data.get("orden")

        ip = get_client_ip(request)

        if not propiedad_id or not imagen or not orden:
            logger.error(
                f"Datos incompletos para crear imagen por usuario {request.user.pk}"
            )
            return Response(
                {"error": "propiedad, imagen y orden son requeridos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            propiedad = Propiedad.objects.get(pk=propiedad_id)

            total = PropiedadImagen.objects.filter(propiedad=propiedad).count()

            if PropiedadImagen.objects.filter(
                propiedad=propiedad, orden=orden
            ).exists():

                return Response(
                    {"orden": "Ya existe una imagen con ese orden"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if total >= 10:
                return Response(
                    {"error": "Máximo 10 imágenes por propiedad"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            saved = PropiedadImagen.objects.create(
                propiedad=propiedad,
                url=imagen,
                orden=orden,
                updated_by=propiedad.anfitrion.pk,
            )

        except Exception as e:
            logger.exception(f"Error inesperado creando imagen: {str(e)}")
            return Response(
                {"error": f"No se pudo guardar la imagen: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ImagenSerializer(saved)

        logger.bind(audit=True).info(
            f"Imagen {saved.prop_ima_id} guardada para propiedad {propiedad.pk} por usuario {request.user.pk} desde IP {ip}"
        )

        return Response(
            {
                "message": f"Imágen para {propiedad.titulo} guardadas correctamente",
                "imagen": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def update(self, request, *args, **kwargs):
        imagen_id = kwargs.get("pk")
        ip = get_client_ip(request)
        logger.bind(audit=True).info(
            f"Imagen {imagen_id} actualizada por usuario {request.user.pk} desde IP {ip}"
        )
        return super().update(request, *args, **kwargs)
