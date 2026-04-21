from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
    update_last_login,
)
from django.contrib.auth.signals import user_logged_in
from django.utils import timezone


class Rol(models.Model):
    nombre = models.TextField()

    class Meta:
        db_table = "rol"

    def __str__(self):
        return self.nombre


class UsuarioQuerySet(models.QuerySet):
    """QuerySet that defers last_login to avoid selecting non-existent column."""
    def get(self, *args, **kwargs):
        return super().defer("last_login").get(*args, **kwargs)
    
    def all(self):
        return super().defer("last_login")


class UsuarioManager(BaseUserManager):
    def create_user(self, correo, password=None, **extra_fields):
        if not correo:
            raise ValueError("El usuario debe tener un correo")

        correo = self.normalize_email(correo)
        user = self.model(correo=correo, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True")

        return self.create_user(correo, password, **extra_fields)


user_logged_in.disconnect(update_last_login)


class Usuario(AbstractBaseUser, PermissionsMixin):
    last_login = models.DateTimeField(null=True, blank=True, editable=False, db_column=None)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    usuario_id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido_p = models.CharField(max_length=50)
    apellido_m = models.CharField(max_length=50, blank=True)
    telefono = models.CharField(max_length=20)
    correo = models.EmailField(unique=True, max_length=50)

    password = models.CharField(max_length=128)

    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, db_column="rol")
    foto_perfil = models.ImageField(upload_to="usuarios/", blank=True, null=True)
    verificado = models.BooleanField(default=False)
    ciudad = models.CharField(max_length=50)
    pais = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)

    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = "correo"
    REQUIRED_FIELDS = ["nombre", "apellido_p", "telefono", "rol"]

    class Meta:
        db_table = "usuario"

    def __str__(self):
        return self.correo
