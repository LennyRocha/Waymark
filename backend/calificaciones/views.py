from rest_framework import mixins, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import connection
from django.db.models import Avg
from .models import Calificacion
from .serializers import CalificacionSerializer
from cuentas.models import Usuario


def get_reserva_ids_por_propiedad(propiedad_id):
    """Raw SQL porque el modelo Reserva aún no existe en Django (módulo de Pedro)."""
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT reserva_id FROM reserva WHERE propiedad_id = %s",
            [propiedad_id]
        )
        return [row[0] for row in cursor.fetchall()]


class CalificacionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = CalificacionSerializer

    def get_queryset(self):
        queryset = Calificacion.objects.select_related('usuario')
        propiedad_id = self.request.query_params.get('propiedad')
        if propiedad_id:
            reserva_ids = get_reserva_ids_por_propiedad(propiedad_id)
            queryset = queryset.filter(reserva_id__in=reserva_ids)
        return queryset

    def create(self, request, *args, **kwargs):
        # Validar que no exista ya una calificación para esta reserva
        reserva_id = request.data.get('reserva_id')
        if reserva_id and Calificacion.objects.filter(reserva_id=reserva_id).exists():
            return Response(
                {'detail': 'Ya existe una calificación para esta reserva.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # TODO: cuando Pedro entregue reservas, validar que la reserva pertenece
        # al usuario autenticado y que está completada.

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        usuario_id = request.user.pk if request.user.is_authenticated else 1
        try:
            usuario = Usuario.objects.get(pk=usuario_id)
        except Usuario.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer.save(usuario=usuario)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='mis-calificaciones')
    def mis_calificaciones(self, request):
        usuario_id = request.user.pk if request.user.is_authenticated else 1
        qs = Calificacion.objects.select_related('usuario').filter(usuario_id=usuario_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='promedio')
    def promedio(self, request):
        propiedad_id = request.query_params.get('propiedad')
        if not propiedad_id:
            return Response({'detail': 'Se requiere el parámetro propiedad.'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT AVG(c.puntuacion), COUNT(c.calificacion_id)
                FROM calificacion c
                INNER JOIN reserva r ON r.reserva_id = c.reserva_id
                WHERE r.propiedad_id = %s
                """,
                [propiedad_id]
            )
            row = cursor.fetchone()

        promedio_val = float(row[0]) if row[0] is not None else None
        return Response({'promedio': promedio_val, 'total': row[1]})
