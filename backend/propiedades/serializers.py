from .models import Divisa, Propiedad, PropiedadImagen, Amenidad, TipoPropiedad, CategoriasAmenidad, Ubicaciones, Favorito
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
        )
class FavoritoSerializer (serializers.ModelSerializer):
    class Meta:
        model = Favorito
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
            'slug',
            'imagenes'
        )
    
    def create(self, validated_data):
        anfitrion = self.context.get('anfitrion')
        if not anfitrion:
            raise serializers.ValidationError("Se requiere anfitrion")
        
        tipo = validated_data.pop('tipo', None)  # si existe, lo sacamos
        if not tipo:
            raise serializers.ValidationError("Se requiere tipo_propiedad")
        
        # eliminar campos read-only
        validated_data.pop("amenidades", None)

        # reasignar campos correctos para el modelo
        validated_data['anfitrion'] = anfitrion
        validated_data['tipo_propiedad'] = tipo
        validated_data['activa'] = 1

        return super().create(validated_data)
        
class CategoriaAmenidadSerializer (serializers.ModelSerializer):
    class Meta:
        model = CategoriasAmenidad
        fields = '__all__'

class UbicacionSerializer (serializers.ModelSerializer):
    class Meta:
        model = Ubicaciones
        fields = '__all__'