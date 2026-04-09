from rest_framework import generics
from .models import Documento
from .serializers import DocumentoSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import procesar_ine_con_ocr_space
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from cuentas.models import Usuario

class DocumentoCreateView(generics.CreateAPIView):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        usuario_id = self.request.data.get("usuario_id")

        if not usuario_id:
            raise ValidationError("usuario_id es requerido")

        try:
            user = Usuario.objects.get(pk=usuario_id)
        except Usuario.DoesNotExist:
            raise ValidationError("Usuario no existe")

        # 🔒 Validar rol
        if user.rol.nombre.lower() != "anfitrion":
            raise ValidationError("Solo anfitriones pueden subir documentos")

        serializer.save(usuario=user)

class EscanearINEView(APIView):
    
    def post(self, request, *args, **kwargs):
        if "imagen" not in request.FILES:
            return Response(
                {"error": "Debes enviar una imagen"},
                status=status.HTTP_400_BAD_REQUEST
            )

        imagen = request.FILES["imagen"]

        try:
            datos = procesar_ine_con_ocr_space(imagen)

            return Response(
                {
                    "status": "ok",
                    "mensaje": "OCR procesado correctamente",
                    "datos": {
                        "nombre": datos["nombre"],
                        "domicilio": datos["domicilio"],
                        "curp": datos["curp"],
                        "fecha_nacimiento": datos["fecha_nacimiento"],
                    }
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "mensaje": "Error procesando OCR",
                    "detalle": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )