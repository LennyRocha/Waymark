from django.db import models
from cuentas.models import Usuario
from django.core.exceptions import ValidationError


class ReservaEstado(models.Model):
    id = models.AutoField(primary_key=True)
    estado = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'reserva_estado'

    def __str__(self):
        return self.estado


class Reserva(models.Model):
    reserva_id = models.AutoField(primary_key=True)

    propiedad = models.ForeignKey(
        'propiedades.Propiedad',
        models.CASCADE
    )

    huesped = models.ForeignKey(
        Usuario,
        models.CASCADE
    )

    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    huespedes = models.IntegerField()

    estado = models.ForeignKey(
        ReservaEstado,
        models.SET_NULL,
        blank=True,
        null=True
    )

    precio_total = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'reserva'

    def __str__(self):
        return f"{self.reserva_id} - {self.propiedad} ({self.fecha_inicio} a {self.fecha_fin})"

    def clean(self):
        if self.fecha_inicio >= self.fecha_fin:
            raise ValidationError("La fecha de inicio debe ser menor a la fecha fin")

        reservas_existentes = Reserva.objects.filter(
            propiedad=self.propiedad,
            fecha_inicio__lt=self.fecha_fin,
            fecha_fin__gt=self.fecha_inicio
        ).exclude(reserva_id=self.reserva_id)

        if reservas_existentes.exists():
            raise ValidationError("Las fechas no están disponibles")

    @property
    def duracion_dias(self):
        return (self.fecha_fin - self.fecha_inicio).days