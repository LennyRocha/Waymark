@echo on
setlocal

cd /d "%~dp0.."

echo ===== DIRECTORIO ACTUAL =====
cd

call venv/Scripts/activate

echo ===== CARGANDO amenidades =====
python manage.py loaddata initialdata/fixtures/amenidades.json --verbosity 2

echo ===== CARGANDO divisas =====
python manage.py loaddata initialdata/fixtures/divisas.json --verbosity 2

echo ===== CARGANDO roles =====
python manage.py loaddata initialdata/fixtures/roles.json --verbosity 2

echo ===== CARGANDO tipo_propiedades =====
python manage.py loaddata initialdata/fixtures/tipo_propiedades.json --verbosity 2

echo ===== TERMINADO =====
pause