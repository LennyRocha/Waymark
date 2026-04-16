from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ReservaViewSet

router = DefaultRouter()
router.register(r"reservas", ReservaViewSet, basename="reservas")

urlpatterns = [
    path("", include(router.urls)),
]
