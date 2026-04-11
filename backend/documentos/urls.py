from django.urls import path
from .views import EscanearINEView

urlpatterns = [
    path('escanear-ine/', EscanearINEView.as_view(), name='escanear-ine'),
]