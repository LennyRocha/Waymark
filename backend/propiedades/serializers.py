from .models import (
    Divisa,
    Propiedad,
    PropiedadImagen,
    Amenidad,
    TipoPropiedad,
    CategoriasAmenidad,
    Ubicaciones,
    Favorito,
    Cards,
)
from rest_framework import serializers

class DivisaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Divisa
        fields = ("divisa_id", "nombre", "acronimo")


class TipoPropSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoPropiedad
        fields = "__all__"


class AmenidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenidad
        fields = ("amenidad_id", "nombre", "icono_nombre", "descripcion", "categoria")


class ImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropiedadImagen
        fields = (
            "prop_ima_id",
            "url",
            "orden",
        )


class PropiedadSerializer(serializers.ModelSerializer):
    divisa = DivisaSerializer(read_only=True)
    tipo = TipoPropSerializer(source="tipo_propiedad", read_only=True)
    amenidades = AmenidadSerializer(many=True, read_only=True)

    check_in = serializers.TimeField(format="%H:%M")
    check_out = serializers.TimeField(format="%H:%M")

    activa = serializers.BooleanField(read_only=True)

    divisa_id = serializers.PrimaryKeyRelatedField(
        queryset=Divisa.objects.all(), write_only=True, source="divisa"
    )

    tipo_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoPropiedad.objects.all(), write_only=True, source="tipo_propiedad"
    )

    amenidades_ids = serializers.PrimaryKeyRelatedField(
        queryset=Amenidad.objects.all(), many=True, write_only=True, source="amenidades"
    )

    updated_at = serializers.DateTimeField(read_only=True)

    imagenes = ImagenSerializer(many=True, read_only=True)

    class Meta:
        model = Propiedad
        fields = (
            "propiedad_id",
            "titulo",
            "descripcion",
            "pais",
            "ciudad",
            "region",
            "direccion",
            "activa",
            "coordenadas",
            "precio_noche",
            "divisa",
            "divisa_id",
            "max_huespedes",
            "habitaciones",
            "camas",
            "banos",
            "check_in",
            "check_out",
            "regla_mascotas",
            "regla_ninos",
            "regla_fumar",
            "regla_fiestas",
            "regla_autochecar",
            "regla_apagar",
            "reglas_extra",
            "tipo",
            "tipo_id",
            "anfitrion_id",
            "amenidades",
            "updated_at",
            "amenidades_ids",
            "slug",
            "imagenes",
        )

    def create(self, validated_data):
        anfitrion = self.context.get("anfitrion")
        if not anfitrion:
            raise serializers.ValidationError("Se requiere anfitrion")

        tipo = validated_data.pop("tipo_propiedad", None)  # si existe, lo sacamos
        if not tipo:
            raise serializers.ValidationError("Se requiere tipo_propiedad")

        # reasignar campos correctos para el modelo
        validated_data["anfitrion"] = anfitrion
        validated_data["tipo_propiedad"] = tipo
        validated_data["activa"] = True

        amenidades = validated_data.pop("amenidades", [])

        propiedad = super().create(validated_data)

        propiedad.amenidades.set(amenidades)

        return propiedad


class CategoriaAmenidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasAmenidad
        fields = "__all__"


class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicaciones
        fields = "__all__"


class CardSerializer(serializers.ModelSerializer):
    es_mi_favorito = serializers.SerializerMethodField()
    favorito_id = serializers.SerializerMethodField()

    class Meta:
        model = Cards
        fields = "__all__"

    def get_es_mi_favorito(self, obj):
        user = self.context.get("request").user

        if not user.is_authenticated:
            return False

        return Favorito.objects.filter(
            usuario=user, propiedad_id=obj.propiedad_id
        ).exists()

    def get_favorito_id(self, obj):
        user = self.context.get("request").user

        if not user.is_authenticated:
            return False

        fav = Favorito.objects.filter(usuario=user, propiedad_id=obj.propiedad_id).first()

        return fav.favorito_id if fav else None


class FavoritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorito
        fields = "__all__"
