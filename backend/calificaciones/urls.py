from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CalificacionViewSet

router = DefaultRouter()
router.register(r'calificaciones', CalificacionViewSet, basename='calificaciones')

urlpatterns = [
    path('', include(router.urls)),
]
