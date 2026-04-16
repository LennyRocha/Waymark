from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from cuentas.models import Usuario


class Calificacion(models.Model):
    calificacion_id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        Usuario,
        models.CASCADE,
        related_name='calificaciones',
        db_column='autor_id',
    )
    reserva_id = models.IntegerField(blank=False, null=False)
    puntuacion = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comentario = models.TextField(max_length=1000, blank=False, null=False)
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'calificacion'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
