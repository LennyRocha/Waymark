from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import PropiedadSerializer, DivisaSerializer, FavoritoSerializer, TipoPropSerializer, AmenidadSerializer, CategoriaAmenidadSerializer, UbicacionSerializer, ImagenSerializer
from .models import Propiedad, Divisa, PropiedadImagen, Favorito, TipoPropiedad,Amenidad, CategoriasAmenidad, Ubicaciones
from django.db import transaction
from .filters import PropiedadFilter
from .paginations import PropiedadPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
import traceback
from cuentas.models import Usuario
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

# Create your views here.
method_not_allowed_response = Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class PropiedadViewSet(viewsets.ModelViewSet):
    queryset = Propiedad.objects.select_related(
        "divisa",
        "tipo_propiedad"
    ).prefetch_related(
        "amenidades",
        "imagenes"
    ).filter(activa=1)

    serializer_class = PropiedadSerializer

    filter_backends = [
        DjangoFilterBackend,
        OrderingFilter
    ]

    ordering_fields = [
        "precio_noche",
        "habitaciones",
        "max_huespedes"
    ]

    filterset_class = PropiedadFilter
    serializer_class = PropiedadSerializer
    
    @action(detail=False, methods=["GET"])
    def locations(self, request, pk=None):
        queryset = Ubicaciones.objects.all()
        serializer = UbicacionSerializer(queryset, many = True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["GET"], url_path="by-host/(?P<host_id>[^/.]+)")
    def by_host(self, request, host_id=None):
        self.pagination_class = PropiedadPagination  # ← solo aplica aquí
        queryset = Propiedad.objects.select_related(
            'divisa', 'tipo_propiedad'
        ).prefetch_related(
            'amenidades', 'imagenes'
        ).filter(anfitrion=host_id)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PropiedadSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PropiedadSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        print("Datos recibidos en el backend", request.data)

        imagenes = request.FILES.getlist('imagenes')
        
        anfitrion = request.user
        #TODO: Cuando ya esté el token quitar esto
        debug_anfitrion = Usuario.objects.get(pk=1)

        if len(imagenes) > 10:
            return Response(
                {"error": "Máximo 10 imágenes por propiedad"},
                status=status.HTTP_400_BAD_REQUEST
            )

        #TODO: Usar anfitrion en vez de debug_anfitrion cuando ya esté el token
        serializer = PropiedadSerializer(data=request.data, context={'anfitrion': debug_anfitrion})
        # print("Serializer creado, validando...")
        # if not serializer.is_valid():
        #     print("Errores de validación:", serializer.errors)
        #     return Response(serializer.errors, status=400)
        serializer.is_valid(raise_exception=True)

        try:

            with transaction.atomic():

                propiedad = serializer.save()

                for i, imagen in enumerate(imagenes):

                    PropiedadImagen.objects.create(
                        propiedad=propiedad,
                        url=imagen,
                        orden=i,
                        updated_by = propiedad.anfitrion
                    )
                    
        except ValidationError as ve:
            # Devuelve los errores de validación como JSON
            return Response({'errores': ve.detail}, status=status.HTTP_400_BAD_REQUEST)
        
        except IntegrityError as ie:
            if 'propiedad.direccion' in str(ie):
                return Response({'direccion': ['Esa dirección ya fue registrada']}, status=400)
            return Response({'error': 'Error de integridad'}, status=400)

        except Exception as e:

            print(traceback.format_exc())
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            self.get_serializer(propiedad).data,
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):

        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        imagenes = request.FILES.getlist("imagenes")
        ordenes = request.data.getlist("ordenes")

        try:

            with transaction.atomic():

                propiedad = serializer.save()

                existentes = PropiedadImagen.objects.filter(propiedad=propiedad).count()

                for i, imagen in enumerate(imagenes):

                    orden = int(ordenes[i])

                    if orden < 0 or orden > 9:
                        return Response(
                            {"error": "El orden debe estar entre 0 y 9"},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    existente = PropiedadImagen.objects.filter(
                        propiedad=propiedad,
                        orden=orden
                    ).first()

                    if existente:
                        # reemplazar imagen
                        existente.url = imagen
                        existente.save()

                    else:
                        if existentes >= 10:
                            return Response(
                                {"error": "Máximo 10 imágenes por propiedad"},
                                status=status.HTTP_400_BAD_REQUEST
                            )

                        PropiedadImagen.objects.create(
                            propiedad=propiedad,
                            url=imagen,
                            orden=orden
                        )

                        existentes += 1
                        
        except ValidationError as ve:
            # Devuelve los errores de validación como JSON
            return Response({'errores': ve.detail}, status=status.HTTP_400_BAD_REQUEST)
        
        except IntegrityError as ie:
            if 'propiedad.direccion' in str(ie):
                return Response({'direccion': ['Esa dirección ya fue registrada']}, status=400)
            return Response({'error': 'Error de integridad'}, status=400)

        except Exception as e:

            print(traceback.format_exc())
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            self.get_serializer(propiedad).data,
            status=status.HTTP_200_OK
        )
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.activa = 0
        instance.save(update_fields=["activa"])
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class DivisaViewSet(viewsets.ModelViewSet):
    queryset = Divisa.objects.all().order_by("nombre")
    serializer_class = DivisaSerializer
    
class FavoritoViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin):
    queryset = Favorito.objects.all()
    serializer_class = FavoritoSerializer
    
    def list(self, request):
        user = request.query_params.get("usuario")
        queryset = Favorito.objects.filter(usuario = user)
        serializer = FavoritoSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        usuario_  = request.user
        propiedad_ = request.data.get("propiedad")

        favorito, created = Favorito.objects.get_or_create(
            usuario=1,
            propiedad=propiedad_
        )
        
        #TODO: Cuando ya esté el token descomentar esto
        # favorito, created = Favorito.objects.get_or_create(
        #     usuario=usuario_,
        #     propiedad=propiedad_
        # )

        return Response(
            {"created": created, "id": favorito.id},
            status=status.HTTP_201_CREATED
        )
        
class AmenidadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Amenidad.objects.all().order_by("categoria")
    serializer_class = AmenidadSerializer
    
    @action(detail=False, methods=["GET"])
    def categorias(self, request, pk=None):
        queryset = CategoriasAmenidad.objects.all()
        serializer = CategoriaAmenidadSerializer(queryset, many = True)
        return Response(serializer.data)

class TipoPropiedadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoPropiedad.objects.all().order_by("tipo")
    serializer_class = TipoPropSerializer
    
class ImagenViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = PropiedadImagen.objects.all()
    serializer_class = ImagenSerializer

    def create(self, request, *args, **kwargs):
        propiedad_id = request.data.get('propiedad')
        if PropiedadImagen.objects.filter(propiedad_id=propiedad_id).count() >= 10:
            return Response(
                {"error": "Máximo 10 imágenes por propiedad"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)