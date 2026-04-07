from django.db import models

# Create your models here.
class Rol(models.Model):
    nombre = models.TextField()

    class Meta:
        managed = False
        db_table = 'rol'

class Usuario(models.Model):
    usuario_id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido_p = models.CharField(max_length=50)
    apellido_m = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20)
    correo = models.CharField(unique=True, max_length=50)
    contra = models.CharField(unique=True, max_length=255)
    rol = models.ForeignKey(Rol, models.PROTECT, db_column='rol')
    foto_perfil = models.CharField(max_length=255, blank=True, null=True)
    verificado = models.IntegerField(blank=True, null=True)
    ciudad = models.CharField(max_length=50)
    pais = models.CharField(max_length=50)
    activo = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuario'