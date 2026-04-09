from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import connection
from .models import Calificacion
from .serializers import CalificacionSerializer
from cuentas.models import Usuario
import traceback

not_authenticated_response = Response(
    {'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED
)


def get_reserva_ids_por_propiedad(propiedad_id):
    """Obtiene los reserva_id de una propiedad usando raw SQL.
    TODO: Reemplazar con FK cuando el módulo de reservas (Pedro) esté listo.
    """
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT reserva_id FROM reserva WHERE propiedad_id = %s",
            [propiedad_id],
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
            # La calificación se vincula a propiedad a través de reserva
            reserva_ids = get_reserva_ids_por_propiedad(propiedad_id)
            queryset = queryset.filter(reserva_id__in=reserva_ids)
        return queryset

    @action(detail=False, methods=['GET'])
    def mis_calificaciones(self, request):
        # TODO: Cuando ya esté el token usar request.user
        # if not request.user.is_authenticated:
        #     return not_authenticated_response

        debug = Usuario.objects.get(pk=1)
        queryset = Calificacion.objects.select_related('usuario').filter(usuario=debug)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def promedio(self, request):
        propiedad_id = request.query_params.get('propiedad')
        if not propiedad_id:
            return Response(
                {'error': 'Se requiere el parámetro propiedad'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # JOIN a través de reserva (ya que calificacion no tiene propiedad_id directo)
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT AVG(c.puntuacion), COUNT(c.calificacion_id)
                FROM calificacion c
                INNER JOIN reserva r ON r.reserva_id = c.reserva_id
                WHERE r.propiedad_id = %s
                """,
                [propiedad_id],
            )
            row = cursor.fetchone()

        promedio_val = float(row[0]) if row[0] else None
        total = row[1] or 0
        return Response({
            'promedio': round(promedio_val, 2) if promedio_val else None,
            'total': total,
        })

    def create(self, request, *args, **kwargs):
        # TODO: Cuando ya esté el token usar request.user
        # if not request.user.is_authenticated:
        #     return not_authenticated_response

        debug = Usuario.objects.get(pk=1)
        reserva_id = request.data.get('reserva_id')

        # TODO: Cuando reservas esté listo, validar:
        # 1. Que la reserva pertenece al usuario autenticado
        # 2. Que la reserva está en estado "completada"
        # 3. Actualmente solo se valida que no exista ya una calificación para esa reserva

        if Calificacion.objects.filter(reserva_id=reserva_id).exists():
            return Response(
                {'error': 'Ya existe una calificación para esta reserva'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CalificacionSerializer(
            data=request.data,
            context={'usuario': debug},
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            calificacion = serializer.save()
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(
            CalificacionSerializer(calificacion).data,
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        # TODO: Verificar que solo admin pueda borrar cuando esté el token
        # if not request.user.is_authenticated:
        #     return not_authenticated_response

        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
