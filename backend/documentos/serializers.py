from rest_framework import serializers
from .models import Documento


class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = [
            "documento_id",
            "usuario",
            "tipo",
            "numero_doc",
            "archivo_front",
            "archivo_trasero",
            "estado",
        ]