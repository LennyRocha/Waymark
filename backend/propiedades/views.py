from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
import random
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
from .paginations import PropiedadPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
import traceback
from cuentas.models import Usuario
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

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

        if not request.user.is_authenticated:

            favoritos = Cards.objects.filter(es_favorito=True).order_by("?")[:7]

            serializer = CardSerializer(
                favoritos, many=True, context={"request": request}
            )

            favoritos_data = serializer.data

        return Response({"favoritos": favoritos_data, "ciudades": ciudades_data})

    @action(detail=False, methods=["GET"])
    def locations(self, request, pk=None):
        queryset = Ubicaciones.objects.all()
        serializer = UbicacionSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["GET"])
    def by_host(self, request):
        # TODO: Cuando ya esté el token usar esto
        host_id = request.user.id

        # TODO: Descomentar esto cuando ya esté el token
        # if not request.user.is_authenticated:
        # return not_authenticated_response

        # TODO: Descomentar esto cuando ya esté el token
        # if not request.user.is_host:
        # return not_host_response

        queryset = (
            Propiedad.objects.select_related("divisa", "tipo_propiedad")
            .prefetch_related("amenidades", "imagenes")
            .filter(anfitrion=1)
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        anfitrion = request.user

        # TODO: Descomentar esto cuando ya esté el token
        # if not anfitrion.is_authenticated:
        # return not_authenticated_response

        # TODO: Descomentar esto cuando ya esté el token
        # if not anfitrion.is_host:
        # return not_host_response

        # TODO: Cuando ya esté el token quitar esto
        debug_anfitrion = Usuario.objects.get(pk=1)

        serializer = PropiedadSerializer(
            data=request.data, context={"anfitrion": debug_anfitrion}
        )

        # serializer.is_valid(raise_exception=True)
        if not serializer.is_valid():
            print("Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=400)

        try:
            propiedad = serializer.save()

        except ValidationError as ve:
            return Response({"errores": ve.detail}, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as ie:
            if "propiedad.direccion" in str(ie):
                return Response(
                    {"direccion": ["Esa dirección ya fue registrada"]}, status=400
                )
            return Response({"error": "Error de integridad"}, status=400)

        except Exception as e:

            print(traceback.format_exc())
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            self.get_serializer(propiedad).data, status=status.HTTP_201_CREATED
        )

    def partial_update(self, request, *args, **kwargs):
        # TODO: Descomentar esto cuando ya esté el token
        # if not request.user.is_authenticated:
        # return not_authenticated_response

        # TODO: Descomentar esto cuando ya esté el token
        # if not request.user.is_host:
        # return not_host_response
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # TODO: Descomentar esto cuando ya esté el token
        # if not request.user.is_authenticated:
        # return not_authenticated_response

        # TODO: Descomentar esto cuando ya esté el token
        # if not request.user.is_host:
        # return not_host_response
        instance = self.get_object()
        instance.activa = not instance.activa
        instance.save(update_fields=["activa"])
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


class FavoritoViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
):
    queryset = Favorito.objects.all()
    serializer_class = FavoritoSerializer

    def list(self, request):
        user = request.user

        debug = Usuario.objects.get(pk=1)
        queryset = Cards.objects.filter(
            propiedad_id__in=Favorito.objects.filter(usuario=debug).values_list(
                "propiedad_id", flat=True
            )
        )

        # TODO: Descomentar esto cuando ya esté el token
        # queryset = Favorito.objects.filter(usuario=user)
        serializer = CardSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        usuario = request.user
        # TODO: Descomentar esto cuando ya esté el token
        # if not usuario.is_authenticated:
        # return not_authenticated_response

        propiedad_ = request.data.get("propiedad")

        propiedadObject = Propiedad.objects.get(pk=propiedad_)

        debug = Usuario.objects.get(pk=1)
        favorito, created = Favorito.objects.get_or_create(
            usuario=debug, propiedad=propiedadObject
        )

        # TODO: Cuando ya esté el token descomentar esto
        # favorito, created = Favorito.objects.get_or_create(
        #     usuario=usuario_,
        #     propiedad=propiedadObject
        # )

        return Response(
            {"created": created, "id": favorito.favorito_id},
            status=status.HTTP_201_CREATED,
        )


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
        propiedad_id = request.data.get("propiedad")
        imagenes = request.FILES.getlist("imagenes")
        ordenes = request.data.getlist("ordenes")
        propiedad = Propiedad.objects.get(pk=propiedad_id)
        total_existentes = PropiedadImagen.objects.filter(
            propiedad_id=propiedad_id
        ).count()
        print(len(imagenes), len(ordenes))
        lista = []
        if total_existentes + len(imagenes) > 10:
            return Response(
                {"error": "Máximo 10 imágenes por propiedad"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(imagenes) < 1:
            return Response(
                {"error": "Mínimo 1 imagen por propiedad"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(ordenes) != len(imagenes):
            return Response(
                {"error": "Debe enviar un orden por cada imagen"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for i, imagen in enumerate(imagenes):
            orden = int(ordenes[i])

            if orden < 1 or orden > 10:
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
                    print(
                        f"Imagen {saved.prop_ima_id} guardada con orden {saved.orden}"
                    )

                except Exception as e:
                    print(traceback.format_exc())
                    return Response(
                        {"error": f"No se pudo guardar la imagen: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        serializer = ImagenSerializer(lista, many=True)

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

        if not propiedad_id or not imagen or not orden:
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
            print("Error al guardar la imagen:", str(e))
            print(traceback.format_exc())
            return Response(
                {"error": f"No se pudo guardar la imagen: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ImagenSerializer(saved)

        return Response(
            {
                "message": f"Imágen para {propiedad.titulo} guardadas correctamente",
                "imagen": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
