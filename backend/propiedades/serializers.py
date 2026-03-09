from .models import Divisa, Propiedad, PropiedadImagen, Amenidad, TipoPropiedad
from rest_framework import serializers

class DivisaSerializer (serializers.ModelSerializer):
    class Meta:
        model = Divisa
        fields =('divisa_id', 'nombre', 'acronimo')
        
class TipoPropSerializer (serializers.ModelSerializer):
    class Meta:
        model = TipoPropiedad
        fields = '__all__'
        
class AmenidadSerializer (serializers.ModelSerializer):
    class Meta:
        model = Amenidad
        fields =('amenidad_id', 'nombre', 'icono_nombre', 'descripcion', 'categoria')
        
class ImagenSerializer (serializers.ModelSerializer):
    class Meta:
        model = PropiedadImagen
        fields =( 
            'prop_ima_id',
            'url',
            'orden',
            'public_id'
        )
class FavoritoSerializer (serializers.ModelSerializer):
    class Meta:
        model = PropiedadImagen
        fields ='__all__'
        
class PropiedadSerializer(serializers.ModelSerializer):
    divisa = DivisaSerializer(read_only=True)
    tipo = TipoPropSerializer(read_only=True)
    amenidades = AmenidadSerializer(many=True, read_only=True)

    divisa_id = serializers.PrimaryKeyRelatedField(
        queryset=Divisa.objects.all(),
        write_only=True,
        source='divisa'
    )

    tipo_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoPropiedad.objects.all(),
        write_only=True,
        source='tipo'
    )

    amenidades_ids = serializers.PrimaryKeyRelatedField(
        queryset=Amenidad.objects.all(),
        many=True,
        write_only=True,
        source='amenidades'
    )
    
    imagenes = ImagenSerializer(many=True, read_only=True)

    class Meta:
        model = Propiedad
        fields = (
            'propiedad_id',
            'titulo',
            'descripcion',
            'pais',
            'ciudad',
            'direccion',
            'activa',
            'coordenadas',
            'precio_noche',
            'divisa',
            'divisa_id',
            'max_huespedes',
            'habitaciones',
            'camas',
            'banos',
            'check_in',
            'check_out',
            'regla_mascotas',
            'regla_ninos',
            'regla_fumar',
            'regla_fiestas',
            'regla_autochecar',
            'regla_apagar',
            'reglas_extra',
            'tipo',
            'tipo_id',
            'anfitrion_id',
            'amenidades',
            'amenidades_ids',
            'imagenes'
        )