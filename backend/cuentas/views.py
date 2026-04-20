from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Usuario
from .serializers import (
    RegistroSerializer,
    LoginTokenSerializer,
    GetUserSerializer,
    PerfilSerializer,
    ChangePasswordSerializer,
)


class RegistroView(generics.CreateAPIView):
    # Le indicamos que modelo va a consultar/crear
    queryset = Usuario.objects.all()
    # Permitimos que cualquier usuario pueda acceder a esta vista
    permission_classes = [AllowAny]
    # Le indicamos que serializador debe usar para validar y guardar los datos
    serializer_class = RegistroSerializer


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = LoginTokenSerializer


class UserDetailView(generics.RetrieveAPIView):
    queryset = Usuario.objects.all()
    serializer_class = GetUserSerializer
    lookup_field = "usuario_id"


class PerfilView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PerfilSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response(
            {"detail": "Contraseña actualizada correctamente"},
            status=status.HTTP_200_OK,
        )