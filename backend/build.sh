#!/usr/bin/env bash
python manage.py makemigrations
python manage.py collectstatic --noinput
python manage.py migrate

python manage.py loaddata initialdata/fixtures/amenidades.json
python manage.py loaddata initialdata/fixtures/divisas.json
python manage.py loaddata initialdata/fixtures/reserva_estado.json
python manage.py loaddata initialdata/fixtures/roles.json
python manage.py loaddata initialdata/fixtures/tipo_propiedades.json    

gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
