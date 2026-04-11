from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import EscanearINESerializer
from .services import procesar_ine_con_ocr_space


class EscanearINEView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = EscanearINESerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "mensaje": "Archivo inválido",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            imagen = serializer.validated_data["imagen"]
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
                },
            },
    status=status.HTTP_200_OK
)

        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "mensaje": "Ocurrió un error al procesar la imagen",
                    "detalle": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )