from django.db import models
from cuentas.models import Usuario


class ReservaEstado(models.Model):
    estado = models.TextField()

    class Meta:
        managed = False
        db_table = "reserva_estado"

    def __str__(self):
        return self.estado


class Reserva(models.Model):
    reserva_id = models.AutoField(primary_key=True)
    propiedad_id = models.IntegerField()
    huesped = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column="huesped_id",
        related_name="reservas",
    )
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    huespedes = models.IntegerField()
    estado = models.ForeignKey(
        ReservaEstado,
        on_delete=models.PROTECT,
        db_column="estado",
    )
    codigo = models.CharField(max_length=12, unique=True)
    precio_total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "reserva"

    def __str__(self):
        return self.codigo
