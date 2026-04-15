import uuid
from datetime import date

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from propiedades.models import Propiedad

from .models import Reserva, ReservaEstado
from .serializers import ReservaCreateSerializer, ReservaSerializer


def _genera_codigo() -> str:
    """Genera un código de 12 caracteres único."""
    while True:
        codigo = uuid.uuid4().hex[:12].upper()
        if not Reserva.objects.filter(codigo=codigo).exists():
            return codigo


class ReservaViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        """POST /api/reservas/ — crea una reserva en estado 'pendiente'."""
        serializer = ReservaCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        propiedad_id = data["propiedad_id"]
        fecha_inicio: date = data["fecha_inicio"]
        fecha_fin: date = data["fecha_fin"]
        huespedes: int = data["huespedes"]

        # Verificar que la propiedad existe y está activa
        try:
            propiedad = Propiedad.objects.get(
                propiedad_id=propiedad_id, activa=True
            )
        except Propiedad.DoesNotExist:
            return Response(
                {"detail": "Propiedad no encontrada o no disponible."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Validar capacidad
        if huespedes > propiedad.max_huespedes:
            return Response(
                {
                    "detail": f"La propiedad acepta máximo {propiedad.max_huespedes} huésped(es)."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar disponibilidad (sin solapamiento con reservas no canceladas)
        solapamiento = Reserva.objects.filter(
            propiedad_id=propiedad_id,
            fecha_inicio__lt=fecha_fin,
            fecha_fin__gt=fecha_inicio,
        ).exclude(estado_id=3)  # 3 = cancelada

        if solapamiento.exists():
            return Response(
                {"detail": "Las fechas seleccionadas no están disponibles."},
                status=status.HTTP_409_CONFLICT,
            )

        # Calcular precio total
        noches = (fecha_fin - fecha_inicio).days
        precio_total = propiedad.precio_noche * noches

        estado_pendiente = ReservaEstado.objects.get(pk=1)  # 1 = pendiente

        reserva = Reserva.objects.create(
            propiedad_id=propiedad_id,
            huesped=request.user,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            huespedes=huespedes,
            estado=estado_pendiente,
            codigo=_genera_codigo(),
            precio_total=precio_total,
        )

        return Response(
            ReservaSerializer(reserva).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="mis-reservas")
    def mis_reservas(self, request):
        """GET /api/reservas/mis-reservas/ — reservas del usuario autenticado."""
        reservas = Reserva.objects.filter(
            huesped=request.user
        ).select_related("estado").order_by("-created_at")
        return Response(ReservaSerializer(reservas, many=True).data)
