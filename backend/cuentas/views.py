from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Usuario
from .serializers import RegistroSerializer, LoginTokenSerializer, GetUserSerializer


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