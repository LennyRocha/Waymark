from rest_framework import serializers
from .models import Reserva


class ReservaCreateSerializer(serializers.Serializer):
    propiedad_id = serializers.IntegerField()
    fecha_inicio = serializers.DateField()
    fecha_fin = serializers.DateField()
    huespedes = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        if attrs["fecha_inicio"] >= attrs["fecha_fin"]:
            raise serializers.ValidationError(
                {"fecha_fin": "La fecha de salida debe ser posterior a la de llegada."}
            )
        return attrs


class ReservaSerializer(serializers.ModelSerializer):
    estado_nombre = serializers.CharField(source="estado.estado", read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "reserva_id",
            "propiedad_id",
            "fecha_inicio",
            "fecha_fin",
            "huespedes",
            "estado_nombre",
            "codigo",
            "precio_total",
            "created_at",
        ]


class SolicitudSerializer(serializers.ModelSerializer):
    estado_nombre = serializers.CharField(source="estado.estado", read_only=True)
    huesped_nombre = serializers.CharField(source="huesped.nombre", read_only=True)
    huesped_apellido = serializers.CharField(source="huesped.apellido_p", read_only=True)
    huesped_foto = serializers.SerializerMethodField()
    propiedad_titulo = serializers.SerializerMethodField()

    def get_huesped_foto(self, obj):
        foto = obj.huesped.foto_perfil
        return foto.url if foto else None

    def get_propiedad_titulo(self, obj):
        propiedades_map = self.context.get("propiedades_map", {})
        return propiedades_map.get(obj.propiedad_id, f"Propiedad #{obj.propiedad_id}")

    class Meta:
        model = Reserva
        fields = [
            "reserva_id",
            "propiedad_id",
            "propiedad_titulo",
            "huesped_nombre",
            "huesped_apellido",
            "huesped_foto",
            "fecha_inicio",
            "fecha_fin",
            "huespedes",
            "estado_nombre",
            "codigo",
            "precio_total",
            "created_at",
        ]
