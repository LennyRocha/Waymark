from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import PropiedadSerializer, DivisaSerializer, FavoritoSerializer, TipoPropSerializer, AmenidadSerializer
from .models import Propiedad, Divisa, PropiedadImagen, Favorito, TipoPropiedad, Amenidad
from django.db import transaction
import cloudinary.uploader

# Create your views here.
method_not_allowed_response = Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class PropiedadViewSet(viewsets.ModelViewSet):
    queryset = Propiedad.objects.select_related(
        'divisa',
        'tipo_propiedad'
    ).prefetch_related(
        'amenidades',
        'imagenes'
    )
    serializer_class = PropiedadSerializer
    
    @action(detail=False, methods=["GET"], url_path="by-host/(?P<host_id>[^/.]+)")
    def by_host(self, request, host_id=None):
        queryset = Propiedad.objects.select_related(
            'divisa',
            'tipo_propiedad'
        ).prefetch_related(
            'amenidades',
            'imagenes'
        ).filter(anfitrion=host_id)

        serializer = PropiedadSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):

        imagenes = request.FILES.getlist('imagenes')

        if len(imagenes) > 10:
            return Response(
                {"error": "Máximo 10 imágenes por propiedad"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        public_ids = []

        try:

            with transaction.atomic():

                propiedad = serializer.save()

                for i, imagen in enumerate(imagenes):

                    subida = cloudinary.uploader.upload(imagen)

                    public_ids.append(subida['public_id'])

                    PropiedadImagen.objects.create(
                        propiedad=propiedad,
                        url=subida['secure_url'],
                        public_id=subida['public_id'],
                        orden=i
                    )

        except Exception as e:

            # eliminar imágenes subidas si algo falla
            for public_id in public_ids:
                try:
                    cloudinary.uploader.destroy(public_id)
                except Exception:
                    pass

            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            PropiedadSerializer(propiedad).data,
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):

        propiedad = self.get_object()

        serializer = self.get_serializer(
            propiedad,
            data=request.data,
            partial=False
        )

        serializer.is_valid(raise_exception=True)

        imagenes = request.FILES.getlist("imagenes")
        ordenes = request.data.getlist("ordenes")

        public_ids_nuevos = []
        public_ids_viejos = []

        try:

            with transaction.atomic():

                propiedad = serializer.save()

                for imagen, orden in zip(imagenes, ordenes):

                    orden = int(orden)

                    imagen_obj = PropiedadImagen.objects.filter(
                        propiedad=propiedad,
                        orden=orden
                    ).first()

                    subida = cloudinary.uploader.upload(imagen)

                    public_ids_nuevos.append(subida['public_id'])

                    if imagen_obj:

                        public_ids_viejos.append(imagen_obj.public_id)

                        imagen_obj.url = subida['secure_url']
                        imagen_obj.public_id = subida['public_id']
                        imagen_obj.save()

                    else:

                        PropiedadImagen.objects.create(
                            propiedad=propiedad,
                            url=subida['secure_url'],
                            public_id=subida['public_id'],
                            orden=orden
                        )

            # eliminar imágenes viejas
            for public_id in public_ids_viejos:
                try:
                    cloudinary.uploader.destroy(public_id)
                except Exception:
                    pass

        except Exception as e:

            # eliminar imágenes nuevas si algo falla
            for public_id in public_ids_nuevos:
                try:
                    cloudinary.uploader.destroy(public_id)
                except Exception:
                    pass

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            PropiedadSerializer(propiedad).data
        )
    
class DivisaViewSet(viewsets.ModelViewSet):
    queryset = Divisa.objects.all().order_by("nombre")
    serializer_class = DivisaSerializer
    
class FavoritoViewSet(viewsets.ModelViewSet):
    queryset = Favorito.objects.all()
    serializer_class = FavoritoSerializer
    
    def list(self, request):
        user = request.query_params.get("usuario")
        queryset = Favorito.objects.filter(usuario = user)
        serializer = FavoritoSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        usuario_ = request.data.get("usuario")
        propiedad_ = request.data.get("propiedad")

        favorito, created = Favorito.objects.get_or_create(
            usuario=usuario_,
            propiedad=propiedad_
        )

        return Response(
            {"created": created, "id": favorito.id},
            status=status.HTTP_201_CREATED
        )
        
class AmenidadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Amenidad.objects.all().order_by("categoria")
    serializer_class = AmenidadSerializer

class TipoPropiedadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoPropiedad.objects.all().order_by("tipo")
    serializer_class = TipoPropSerializer