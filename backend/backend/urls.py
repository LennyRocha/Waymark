"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from cuentas.views import RegistroView, LoginView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("propiedades.urls")),
    path("api/", include("calificaciones.urls")),
    path("api/", include("reservas.urls")),
    path("api/cuentas/", include("cuentas.urls")),

    # Endpoints de cuentas
    path("api/login/", LoginView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/registro/", RegistroView.as_view(), name="registro"),
    path('api/documentos/', include('documentos.urls')),
]

# Esto permite visualizar las imágenes en modo DEBUG (desarrollo)
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)