from django.db import models
from django.utils import timezone
from cuentas.models import Usuario


class Documento(models.Model):
    documento_id = models.AutoField(primary_key=True)
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column="usuario_id",
        related_name="documentos"
    )

    tipo = models.IntegerField()
    numero_doc = models.CharField(max_length=50, blank=True, null=True)

    archivo_front = models.ImageField(upload_to="documentos/front/")
    archivo_trasero = models.ImageField(upload_to="documentos/back/", blank=True, null=True)

    estado = models.IntegerField(default=1)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = "documento"

    def __str__(self):
        return f"Documento {self.documento_id} - Usuario {self.usuario_id}"