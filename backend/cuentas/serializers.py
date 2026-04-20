from django.contrib.auth.password_validation import validate_password
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
            "created_at",
        ]


class PerfilSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source="rol.nombre", read_only=True)
    correo = serializers.EmailField(read_only=True)
    foto_perfil = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Usuario
        fields = [
            "usuario_id",
            "nombre",
            "apellido_p",
            "apellido_m",
            "telefono",
            "correo",
            "foto_perfil",
            "ciudad",
            "pais",
            "rol",
            "rol_nombre",
        ]
        read_only_fields = ["usuario_id", "correo", "rol", "rol_nombre"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual no es correcta")
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context["request"].user)
        return value