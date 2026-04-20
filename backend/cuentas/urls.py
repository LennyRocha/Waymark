from django.urls import path
from .views import PerfilView, ChangePasswordView

urlpatterns = [
    path("me/", PerfilView.as_view(), name="perfil-me"),
    path("me/password/", ChangePasswordView.as_view(), name="perfil-password"),
]
