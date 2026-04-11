from rest_framework import serializers


class EscanearINESerializer(serializers.Serializer):
    imagen = serializers.ImageField(required=True)

    def validate_imagen(self, value):
        extensiones_validas = ('.jpg', '.jpeg', '.png', '.webp')
        nombre = value.name.lower()

        if not nombre.endswith(extensiones_validas):
            raise serializers.ValidationError(
                "Formato no permitido. Usa JPG, JPEG, PNG o WEBP."
            )

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "La imagen no debe superar 5 MB."
            )

        return value