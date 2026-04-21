import uuid
from datetime import date

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from propiedades.models import Propiedad

from .models import Reserva, ReservaEstado
from .serializers import ReservaCreateSerializer, ReservaSerializer, SolicitudSerializer


def _genera_codigo() -> str:
    """Genera un código de 12 caracteres único."""
    while True:
        codigo = uuid.uuid4().hex[:12].upper()
        if not Reserva.objects.filter(codigo=codigo).exists():
            return codigo


def _get_estado_or_error(nombre: str) -> ReservaEstado:
    estado = ReservaEstado.objects.filter(estado__iexact=nombre).first()
    if not estado:
        raise ValidationError(
            {"detail": f"No existe el estado de reserva '{nombre}'."}
        )
    return estado


def _es_anfitrion(user) -> bool:
    rol = (getattr(user.rol, "nombre", "") or "").strip().lower()
    return rol in {"anfitrion", "ambos"}


class ReservaViewSet(GenericViewSet):
    def get_permissions(self):
        if self.action in ("list",):
            return [AllowAny()]
        return [IsAuthenticated()]

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
        estado_cancelada = _get_estado_or_error("cancelada")

        solapamiento = Reserva.objects.filter(
            propiedad_id=propiedad_id,
            fecha_inicio__lt=fecha_fin,
            fecha_fin__gt=fecha_inicio,
        ).exclude(estado=estado_cancelada)

        if solapamiento.exists():
            return Response(
                {"detail": "Las fechas seleccionadas no están disponibles."},
                status=status.HTTP_409_CONFLICT,
            )

        # Calcular precio total
        noches = (fecha_fin - fecha_inicio).days
        precio_total = propiedad.precio_noche * noches

        estado_pendiente = _get_estado_or_error("pendiente")

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

    @action(detail=False, methods=["get"], url_path="calendario")
    def calendario(self, request):
        """GET /api/reservas/calendario/ — reservas de las propiedades del anfitrión."""
        if not _es_anfitrion(request.user):
            return Response(
                {"detail": "Solo anfitriones pueden consultar calendario."},
                status=status.HTTP_403_FORBIDDEN,
            )

        propiedad_id = request.query_params.get("propiedad_id")
        propias = Propiedad.objects.filter(anfitrion=request.user)
        if propiedad_id:
            propias = propias.filter(propiedad_id=propiedad_id)

        propiedad_ids = list(propias.values_list("propiedad_id", flat=True))

        reservas = (
            Reserva.objects.filter(propiedad_id__in=propiedad_ids)
            .select_related("estado", "huesped")
            .order_by("fecha_inicio")
        )
        propiedades_map = {
            p.propiedad_id: p.titulo
            for p in Propiedad.objects.filter(propiedad_id__in=propiedad_ids)
        }
        serializer = SolicitudSerializer(
            reservas, many=True, context={"propiedades_map": propiedades_map}
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="mis-reservas")
    def mis_reservas(self, request):
        """GET /api/reservas/mis-reservas/ — reservas del usuario autenticado."""
        reservas = Reserva.objects.filter(
            huesped=request.user
        ).select_related("estado").order_by("-created_at")
        return Response(ReservaSerializer(reservas, many=True).data)

    @action(detail=False, methods=["get"], url_path="solicitudes")
    def solicitudes(self, request):
        """GET /api/reservas/solicitudes/ — reservas de las propiedades del anfitrión."""
        if not _es_anfitrion(request.user):
            return Response(
                {"detail": "Solo anfitriones pueden consultar solicitudes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        propiedad_ids = list(
            Propiedad.objects.filter(anfitrion=request.user)
            .values_list("propiedad_id", flat=True)
        )
        reservas = (
            Reserva.objects.filter(propiedad_id__in=propiedad_ids)
            .select_related("estado", "huesped")
            .order_by("-created_at")
        )
        propiedades_map = {
            p.propiedad_id: p.titulo
            for p in Propiedad.objects.filter(propiedad_id__in=propiedad_ids)
        }
        serializer = SolicitudSerializer(
            reservas, many=True, context={"propiedades_map": propiedades_map}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="confirmar")
    def confirmar(self, request, pk=None):
        """PATCH /api/reservas/{id}/confirmar/ — confirma reserva pendiente (solo anfitrión)."""
        if not _es_anfitrion(request.user):
            return Response(
                {"detail": "Solo anfitriones pueden confirmar reservas."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            reserva = Reserva.objects.select_related("estado").get(pk=pk)
        except Reserva.DoesNotExist:
            return Response(
                {"detail": "Reserva no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            propiedad = Propiedad.objects.get(propiedad_id=reserva.propiedad_id)
        except Propiedad.DoesNotExist:
            return Response(
                {"detail": "La propiedad de la reserva no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if propiedad.anfitrion_id != request.user.pk:
            return Response(
                {"detail": "No puedes confirmar reservas de propiedades ajenas."},
                status=status.HTTP_403_FORBIDDEN,
            )

        estado_pendiente = _get_estado_or_error("pendiente")
        estado_confirmada = _get_estado_or_error("confirmada")
        if reserva.estado_id != estado_pendiente.pk:
            return Response(
                {"detail": "Solo reservas pendientes pueden confirmarse."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reserva.estado = estado_confirmada
        reserva.updated_by = request.user.pk
        reserva.save(update_fields=["estado", "updated_by", "updated_at"])

        return Response(ReservaSerializer(reserva).data)

    @action(detail=True, methods=["patch"], url_path="cancelar")
    def cancelar(self, request, pk=None):
        """PATCH /api/reservas/{id}/cancelar/ — cancela reserva (anfitrión o huésped)."""
        try:
            reserva = Reserva.objects.select_related("estado", "huesped").get(pk=pk)
        except Reserva.DoesNotExist:
            return Response(
                {"detail": "Reserva no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            propiedad = Propiedad.objects.get(propiedad_id=reserva.propiedad_id)
        except Propiedad.DoesNotExist:
            return Response(
                {"detail": "La propiedad de la reserva no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        es_huesped = reserva.huesped_id == request.user.pk
        es_dueno = propiedad.anfitrion_id == request.user.pk
        if not (es_huesped or es_dueno):
            return Response(
                {"detail": "No tienes permisos para cancelar esta reserva."},
                status=status.HTTP_403_FORBIDDEN,
            )

        estado_cancelada = _get_estado_or_error("cancelada")
        if reserva.estado_id == estado_cancelada.pk:
            return Response(
                {"detail": "La reserva ya está cancelada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reserva.estado = estado_cancelada
        reserva.updated_by = request.user.pk
        reserva.save(update_fields=["estado", "updated_by", "updated_at"])

        return Response(ReservaSerializer(reserva).data)
