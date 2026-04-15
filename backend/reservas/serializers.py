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
