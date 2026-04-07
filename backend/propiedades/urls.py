from django.urls import path, include

from rest_framework.routers import DefaultRouter
from .views import DivisaViewSet, PropiedadViewSet, FavoritoViewSet, TipoPropiedadViewSet, AmenidadViewSet, ImagenViewSet

# Creamos el router y registramos nuestro ViewSet
router = DefaultRouter()
router.register(r'propiedades', PropiedadViewSet, basename='propiedades')
router.register(r'favoritos', FavoritoViewSet, basename='favoritos')
router.register(r'divisas', DivisaViewSet, basename='divisas')
router.register(r'amenidades', AmenidadViewSet, basename='amenidades')
router.register(r'imagenes', ImagenViewSet, basename='imagenes')
router.register(r'tipos_propiedad', TipoPropiedadViewSet, basename='tipos_propiedad')

urlpatterns = [
    # Incluimos todas las rutas generadas por el router bajo el prefijo 'api/'
    path('', include(router.urls)), 
    path('propiedades/<int:propiedad_pk>/imagenes/', ImagenViewSet.as_view({'post': 'create'}))
]