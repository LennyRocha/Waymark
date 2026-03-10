from django.db import models
from cuentas.models import Usuario
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django_resized import ResizedImageField

# Create your models here.
class Amenidad(models.Model):
    amenidad_id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    icono_nombre = models.TextField()
    descripcion = models.TextField()
    categoria = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    updated_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)

    class Meta:
        managed = False
        db_table = 'amenidad'
        ordering = ["categoria"]
        
    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(self,*args, **kwargs)


class Divisa(models.Model):
    divisa_id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    acronimo = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    updated_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'divisa'
        ordering = ['nombre']
    
    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(self,*args, **kwargs)
        

class TipoPropiedad(models.Model):
    tipo = models.TextField()

    class Meta:
        managed = False
        db_table = 'tipo_propiedad'
        ordering = ['tipo']
        
class Propiedad(models.Model):
    propiedad_id = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=50)
    descripcion = models.TextField()
    pais = models.CharField(max_length=25)
    ciudad = models.CharField(max_length=25)
    direccion = models.CharField(max_length=100)
    activa = models.IntegerField(blank=True, null=True)
    coordenadas = models.JSONField()
    precio_noche = models.DecimalField(max_digits=10, decimal_places=2)
    divisa = models.ForeignKey(Divisa, models.PROTECT)
    max_huespedes = models.IntegerField()
    habitaciones = models.IntegerField()
    camas = models.IntegerField()
    banos = models.IntegerField()
    check_in = models.TimeField()
    check_out = models.TimeField()
    regla_mascotas = models.IntegerField()
    regla_ninos = models.IntegerField()
    regla_fumar = models.IntegerField()
    regla_fiestas = models.IntegerField()
    regla_autochecar = models.IntegerField()
    regla_apagar = models.IntegerField()
    reglas_extra = models.JSONField(blank=True, null=True)
    tipo_propiedad = models.ForeignKey(TipoPropiedad, models.PROTECT, db_column='tipo_propiedad')
    anfitrion = models.ForeignKey(Usuario, models.PROTECT)
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    updated_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    updated_by = models.IntegerField(blank=True, null=True)
    amenidades = models.ManyToManyField(Amenidad)

    class Meta:
        managed = False
        db_table = 'propiedad'
        indexes = [
            models.Index(fields=["ciudad"]),
            models.Index(fields=["pais"]),
            models.Index(fields=["precio_noche"]),
            models.Index(fields=["tipo_propiedad"]),
            models.Index(fields=["anfitrion"]),
        ]
    
    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(self,*args, **kwargs)


class PropiedadImagen(models.Model):
    prop_ima_id = models.AutoField(primary_key=True)
    propiedad = models.ForeignKey(Propiedad, models.CASCADE, related_name='imagenes')
    url = ResizedImageField(
        size=[1200, 800],
        quality=85,
        upload_to="propiedades/",
    )
    orden = models.IntegerField(        
        validators=[
            MinValueValidator(1), 
            MaxValueValidator(10) ,
        ],)
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    updated_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    updated_by = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'propiedad_imagen'
        unique_together = (('propiedad', 'orden'),)
        ordering = ['orden']
    
    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(self,*args, **kwargs)

class Favorito(models.Model):
    favorito_id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, models.CASCADE)
    propiedad = models.ForeignKey(Propiedad, models.CASCADE)
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)

    class Meta:
        managed = False
        db_table = 'favorito'
        unique_together = (('usuario', 'propiedad'),)

# Vistas SQL generadas con inspectdb
class CategoriasAmenidad(models.Model):
    categorias = models.TextField(db_collation='utf8mb4_0900_ai_ci', primary_key= True)

    class Meta:
        managed = False
        db_table = 'categorias_amenidad'

class Ubicaciones(models.Model):
    ciudad = models.CharField(max_length=25, db_collation='utf8mb4_0900_ai_ci', primary_key= True)
    pais = models.CharField(max_length=25, db_collation='utf8mb4_0900_ai_ci')

    class Meta:
        managed = False
        db_table = 'ubicaciones'
        unique_together = (('ciudad', 'pais'),)
        
class PropiedadCard(models.Model):
    propiedad_id = models.IntegerField(primary_key= True)
    titulo = models.CharField(max_length=50, db_collation='utf8mb4_0900_ai_ci')
    precio_noche = models.DecimalField(max_digits=10, decimal_places=2)
    ciudad = models.CharField(max_length=25, db_collation='utf8mb4_0900_ai_ci')
    pais = models.CharField(max_length=25, db_collation='utf8mb4_0900_ai_ci')
    divisa = models.TextField(db_collation='utf8mb4_0900_ai_ci')
    tipo_propiedad = models.TextField(db_collation='utf8mb4_0900_ai_ci')
    imagen_principal = models.TextField(db_collation='utf8mb4_0900_ai_ci', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'propiedad_card'