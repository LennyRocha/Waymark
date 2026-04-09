from django.urls import path
from .views import DocumentoCreateView, EscanearINEView

urlpatterns = [
    path('', DocumentoCreateView.as_view(), name='crear-documento'),
    path('escanear-ine/', EscanearINEView.as_view(), name='escanear-ine'),
]