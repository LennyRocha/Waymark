import django_filters
from .models import Propiedad


class PropiedadFilter(django_filters.FilterSet):

    ciudad = django_filters.CharFilter(
        field_name="ciudad",
        lookup_expr="icontains"
    )

    precio_min = django_filters.NumberFilter(
        field_name="precio_noche",
        lookup_expr="gte"
    )

    precio_max = django_filters.NumberFilter(
        field_name="precio_noche",
        lookup_expr="lte"
    )

    max_huespedes = django_filters.NumberFilter(
        field_name="max_huespedes",
        lookup_expr="gte"
    )

    habitaciones = django_filters.NumberFilter(
        field_name="habitaciones",
        lookup_expr="gte"
    )

    banos = django_filters.NumberFilter(
        field_name="banos",
        lookup_expr="gte"
    )

    camas = django_filters.NumberFilter(
        field_name="camas",
        lookup_expr="gte"
    )

    tipo_id = django_filters.NumberFilter(
        field_name="tipo_propiedad_id"
    )

    regla_mascotas = django_filters.NumberFilter()
    regla_ninos = django_filters.NumberFilter()
    regla_fumar = django_filters.NumberFilter()
    regla_fiestas = django_filters.NumberFilter()
    
    amenidades = django_filters.BaseInFilter(
        field_name="amenidades__amenidad_id",
        lookup_expr="in"
    )

    class Meta:
        model = Propiedad
        fields = []