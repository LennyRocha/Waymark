# initialdata/apps.py

from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.core.management import call_command


class InitialdataConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "initialdata"

    def ready(self):
        post_migrate.connect(load_initial_data, sender=self)


def load_initial_data(sender, **kwargs):
    from propiedades.models import Amenidad
    from propiedades.models import Divisa
    from propiedades.models import TipoPropiedad
    from cuentas.models import Rol
    from reservas.models import ReservaEstado

    try:
        print("Verificando datos iniciales...")

        if Amenidad.objects.count() == 0:
            call_command("loaddata", "initialdata/fixtures/amenidades.json")
            print("Amenidades cargadas.")

        if Divisa.objects.count() == 0:
            call_command("loaddata", "initialdata/fixtures/divisas.json")
            print("Divisas cargadas.")

        if TipoPropiedad.objects.count() == 0:
            call_command("loaddata", "initialdata/fixtures/tipo_propiedades.json")
            print("Tipos de propiedad cargados.")

        if Rol.objects.count() == 0:
            call_command("loaddata", "initialdata/fixtures/roles.json")
            print("Roles cargados.")

        if ReservaEstado.objects.count() == 0:
            call_command("loaddata", "initialdata/fixtures/reserva_estado.json")
            print("Estados de reserva cargados.")

        print("Datos iniciales verificados.")

    except Exception as e:
        print(f"Error cargando fixtures: {e}")