from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, DecimalValidator
from django.utils import timezone
from cuentas.models import Usuario


class Calificacion(models.Model):
    calificacion_id = models.AutoField(primary_key=True)
    # La columna en BD se llama autor_id
    usuario = models.ForeignKey(
        Usuario,
        models.CASCADE,
        related_name='calificaciones',
        db_column='autor_id',
    )
    # TODO: Convertir a FK(Reserva) cuando el módulo de reservas esté listo (Pedro)
    reserva_id = models.IntegerField(
        blank=False,
        null=False,
        error_messages={'null': 'La reserva es requerida'},
    )
    puntuacion = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[
            MinValueValidator(1, 'La puntuación mínima es 1'),
            MaxValueValidator(5, 'La puntuación máxima es 5'),
        ],
        error_messages={
            'invalid': 'Ingresa un valor entre 1 y 5',
        },
    )
    comentario = models.TextField(
        max_length=1000,
        blank=False,
        error_messages={
            'blank': 'El comentario no puede estar vacío',
            'max_length': 'El comentario no debe exceder los 1000 caracteres',
        },
    )
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    updated_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    updated_by = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'calificacion'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
