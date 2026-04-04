from rest_framework import serializers
from .models import Reserva, ReservaEstado


class ReservaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reserva
        fields = '__all__'

    def validate(self, data):
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')
        propiedad = data.get('propiedad')

        if fecha_inicio >= fecha_fin:
            raise serializers.ValidationError("La fecha inicio debe ser menor a la fecha fin")

        reservas = Reserva.objects.filter(
            propiedad=propiedad,
            fecha_inicio__lt=fecha_fin,
            fecha_fin__gt=fecha_inicio
        )

        if reservas.exists():
            raise serializers.ValidationError("Las fechas no están disponibles")

        return data

    def create(self, validated_data):
        estado_pendiente = ReservaEstado.objects.get(estado="pendiente")
        validated_data['estado'] = estado_pendiente
        return super().create(validated_data)