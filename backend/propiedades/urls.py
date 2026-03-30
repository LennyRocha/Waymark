from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from .views import DivisaViewSet, PropiedadViewSet, FavoritoViewSet, TipoPropiedadViewSet, AmenidadViewSet, ImagenViewSet

# Creamos el router y registramos nuestro ViewSet
router = DefaultRouter()
router.register(r'propiedades', PropiedadViewSet, basename='propiedades')
router.register(r'favoritos', FavoritoViewSet, basename='favoritos')
router.register(r'divisas', DivisaViewSet, basename='divisas')
router.register(r'amenidades', AmenidadViewSet, basename='amenidades')
router.register(r'tipos_propiedad', TipoPropiedadViewSet, basename='tipos_propiedad')

urlpatterns = [
    # Incluimos todas las rutas generadas por el router bajo el prefijo 'api/'
    path('', include(router.urls)), 
    path('propiedades/<int:propiedad_pk>/imagenes/', ImagenViewSet.as_view({'post': 'create'}))
]

# Esto permite visualizar las imágenes en modo DEBUG (desarrollo)
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)