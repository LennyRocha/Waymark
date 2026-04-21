from rest_framework import mixins, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg
from .models import Calificacion
from .serializers import CalificacionSerializer
from reservas.models import Reserva


class CalificacionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = CalificacionSerializer

    def get_permissions(self):
        if self.action in ("list", "promedio"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def _reserva_finalizada(self, reserva: Reserva) -> bool:
        estado_nombre = (reserva.estado.estado or "").strip().lower()
        return estado_nombre in {"finalizada", "completada"}

    def get_queryset(self):
        queryset = Calificacion.objects.select_related('usuario')
        propiedad_id = self.request.query_params.get('propiedad')
        if propiedad_id:
            reserva_ids = Reserva.objects.filter(
                propiedad_id=propiedad_id
            ).values_list("reserva_id", flat=True)
            queryset = queryset.filter(reserva_id__in=reserva_ids)
        return queryset

    def create(self, request, *args, **kwargs):
        reserva_id = request.data.get('reserva_id')
        if not reserva_id:
            return Response(
                {'detail': 'reserva_id es requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reserva = Reserva.objects.select_related('estado').get(pk=reserva_id)
        except Reserva.DoesNotExist:
            return Response(
                {'detail': 'Reserva no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if reserva.huesped_id != request.user.pk:
            return Response(
                {'detail': 'Solo el huésped puede calificar esta reserva.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not self._reserva_finalizada(reserva):
            return Response(
                {'detail': 'Solo puedes calificar reservas finalizadas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Calificacion.objects.filter(reserva_id=reserva_id).exists():
            return Response(
                {'detail': 'Ya existe una calificación para esta reserva.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save(usuario=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='mis-calificaciones')
    def mis_calificaciones(self, request):
        qs = Calificacion.objects.select_related('usuario').filter(usuario_id=request.user.pk)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='promedio')
    def promedio(self, request):
        propiedad_id = request.query_params.get('propiedad')
        if not propiedad_id:
            return Response({'detail': 'Se requiere el parámetro propiedad.'}, status=status.HTTP_400_BAD_REQUEST)

        reserva_ids = Reserva.objects.filter(
            propiedad_id=propiedad_id
        ).values_list('reserva_id', flat=True)

        agg = Calificacion.objects.filter(
            reserva_id__in=reserva_ids
        ).aggregate(promedio=Avg('puntuacion'))

        total = Calificacion.objects.filter(reserva_id__in=reserva_ids).count()
        promedio_val = float(agg['promedio']) if agg['promedio'] is not None else None
        return Response({'promedio': promedio_val, 'total': total})
