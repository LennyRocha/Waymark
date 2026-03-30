from django.db import models
from cuentas.models import Usuario
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator, URLValidator, DecimalValidator, FileExtensionValidator, BaseValidator
from django.utils import timezone
from django_resized import ResizedImageField
from django.utils.text import slugify

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
    nombre = models.CharField(max_length=50, blank=False,  validators=[RegexValidator(f'^[a-zA-ZáéíóúÁÉÍÓÚ ]$', "No puedes incluir números")])
    acronimo = models.TextField(blank= False)
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
    titulo = models.CharField(max_length=50, blank=False, validators=[RegexValidator(f'^[a-zA-ZáéíóúÁÉÍÓÚ ]+$', "No puedes incluir números")] , error_messages={
        "max_length" : "El título asignado no debe exceder los 50 carácteres",
        "blank" : "Este campo no puede estar vacío"
    })
    descripcion = models.TextField(max_length=500, blank=False, error_messages={
        "max_length" : "La descripción asignada no debe exceder los 500 carácteres",
        "blank" : "Este campo no puede estar vacío"
    })
    pais = models.CharField(max_length=25, blank=False, error_messages={
        "max_length" : "El país no debe exceder los 25 carácteres",
        "blank" : "Este campo no puede estar vacío"
    })
    ciudad = models.CharField(max_length=25, blank=False, error_messages={
        "max_length" : "La ciudad no debe exceder los 25 carácteres",
        "blank" : "Este campo no puede estar vacío"
    })
    direccion = models.CharField(max_length=100, blank=False, unique=True, error_messages={
        "max_length" : "La dirección asignada no debe exceder los 100 carácteres",
        "blank" : "Este campo no puede estar vacío",
        "unique" : "Esa dirección ya fue registrada"
    })
    activa = models.IntegerField(blank=True, null=True)
    coordenadas = models.JSONField(blank= False, error_messages={
        "blank" : "Este campo no puede estar vacío"
    })
    precio_noche = models.DecimalField(max_digits=10, decimal_places=2, blank=False, error_messages={
        "max_digits" : "El precio asignado es demasiado alto",
        "decimal_places" : "Solo se admiten 2 decimales",
        "blank" : "Este campo no puede estar vacío"
    },
    validators=[MaxValueValidator(9999999,"El precio dado es demasiado grande"),MinValueValidator(1, "El precio asignado no debe ser menor o igual a 0")])
    divisa = models.ForeignKey(Divisa, models.PROTECT, blank=False, error_messages={
        "blank" : "Este campo no puede estar vacío"
    })
    max_huespedes = models.IntegerField( validators=[MinValueValidator(1)], blank=False, error_messages={
        "min_value" : "No se aceptan numeros menores o iguales a 0",
        "blank" : "Este campo no puede estar vacío"
    })
    habitaciones = models.IntegerField( validators=[MinValueValidator(1), MaxValueValidator(20)], blank=False, error_messages={
        "min_value" : "No se aceptan numeros menores o iguales a 0",
        "max_value" : "El límite de habitaciones es 20",
        "blank" : "Este campo no puede estar vacío"
    })
    camas = models.IntegerField( validators=[MinValueValidator(1), MaxValueValidator(20)], blank=False, error_messages={
        "min_value" : "No se aceptan numeros menores o iguales a 0",
        "max_value" : "El límite de camas es 20",
        "blank" : "Este campo no puede estar vacío"
    })
    banos = models.IntegerField( validators=[MinValueValidator(1), MaxValueValidator(20)], blank=False, error_messages={
        "min_value" : "No se aceptan numeros menores o iguales a 0",
        "max_value" : "El límite de baños es 20",
        "blank" : "Este campo no puede estar vacío"
    })
    check_in = models.TimeField(blank=False, error_messages={
        "blank" : "Este campo no puede estar vacío"
    })
    check_out = models.TimeField(blank=False, error_messages={
        "blank" : "Este campo no puede estar vacío"
    })
    regla_mascotas = models.BooleanField()
    regla_ninos = models.BooleanField()
    regla_fumar = models.BooleanField()
    regla_fiestas = models.BooleanField()
    regla_autochecar = models.BooleanField()
    regla_apagar = models.BooleanField()
    reglas_extra = models.JSONField(blank=True, null=True)
    tipo_propiedad = models.ForeignKey(TipoPropiedad, models.PROTECT, db_column='tipo_propiedad', blank=False, error_messages={
        "blank" : "Este campo no puede estar vacío"
    })
    anfitrion = models.ForeignKey(Usuario, models.PROTECT, blank=False, error_messages={
        "blank" : "Este campo no puede estar vacío"
    })
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    updated_at = models.DateTimeField(blank=True, null=True, auto_now_add= True)
    updated_by = models.IntegerField(blank=True, null=True)
    amenidades = models.ManyToManyField(Amenidad, blank=False, error_messages={
        "blank" : "Este campo no puede estar vacío"
    })
    slug = models.SlugField(unique=True, max_length=60, blank=True)

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
        base_slug = slugify(self.titulo)
        slug = base_slug
        contador = 1

        while Propiedad.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base_slug}-{contador}"
            contador += 1

        self.slug = slug
        super().save(*args, **kwargs)


class PropiedadImagen(models.Model):
    prop_ima_id = models.AutoField(primary_key=True)
    propiedad = models.ForeignKey(Propiedad, models.CASCADE, related_name='imagenes', blank=False)
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