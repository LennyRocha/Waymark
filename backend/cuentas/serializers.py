from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            "nombre",
            "apellido_p",
            "apellido_m",
            "telefono",
            "correo",
            "password",
            "rol",
            "foto_perfil",
            "ciudad",
            "pais",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Usuario.objects.create_user(password=password, **validated_data)
        return user


class LoginTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["rol_id"] = user.rol_id
        token["rol_nombre"] = (user.rol.nombre or "").strip().lower()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["usuario"] = {
            "usuario_id": self.user.usuario_id,
            "correo": self.user.correo,
            "rol_id": self.user.rol_id,
            "rol_nombre": (self.user.rol.nombre or "").strip().lower(),
        }
        return data
    
# Serializer para obtener el dueño de una propiedad
class GetUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "nombre",
            "apellido_p",
            "apellido_m",
            "telefono",
            "correo",
            "foto_perfil",
            "created_at"
        ]