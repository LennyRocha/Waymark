from rest_framework import serializers
from .models import Calificacion
from cuentas.models import Usuario


class UsuarioSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('usuario_id', 'nombre', 'apellido_p', 'foto_perfil')


class CalificacionSerializer(serializers.ModelSerializer):
    usuario = UsuarioSimpleSerializer(read_only=True)

    class Meta:
        model = Calificacion
        fields = ('calificacion_id', 'usuario', 'reserva_id', 'puntuacion', 'comentario', 'created_at')
        read_only_fields = ('calificacion_id', 'usuario', 'created_at')

    def create(self, validated_data):
        # usuario llega via save(usuario=...) o via context — aceptamos ambas rutas
        usuario = validated_data.pop('usuario', None) or self.context.get('usuario')
        if not usuario:
            raise serializers.ValidationError('Se requiere usuario autenticado')
        validated_data['usuario'] = usuario
        return super().create(validated_data)
