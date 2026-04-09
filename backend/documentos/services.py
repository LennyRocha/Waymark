import re
import requests
from django.conf import settings


def limpiar_texto(texto: str) -> str:
    texto = texto.replace("\n", " ")
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip().upper()


def extraer_curp(texto: str) -> str:
    patron = r'\b[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM][A-Z]{5}[A-Z0-9]\d\b'
    coincidencia = re.search(patron, texto)
    return coincidencia.group(0) if coincidencia else ""


def extraer_fecha_nacimiento(texto: str) -> str:
    patrones = [
        r'\b\d{2}/\d{2}/\d{4}\b',
        r'\b\d{2}-\d{2}-\d{4}\b',
    ]

    for patron in patrones:
        coincidencia = re.search(patron, texto)
        if coincidencia:
            return coincidencia.group(0)

    return ""


def extraer_nombre(texto: str) -> str:
    coincidencia = re.search(
        r'NOMBRE\s+(.+?)(?=\s+DOMICILIO|\s+CURP|\s+SEXO|\s+CLAVE DE ELECTOR|\s+FECHA DE NACIMIENTO|$)',
        texto
    )

    if coincidencia:
        nombre = coincidencia.group(1).strip()
        nombre = re.sub(r'\s+', ' ', nombre)
        return nombre

    return ""


def extraer_domicilio(texto: str) -> str:
    coincidencia = re.search(
        r'DOMICILIO\s+(.+?)(?=\s+CLAVE DE ELECTOR|\s+CURP|\s+FECHA DE NACIMIENTO|\s+SECCIÓN|\s+AÑO DE REGISTRO|\s+VIGENCIA|$)',
        texto
    )

    if coincidencia:
        domicilio = coincidencia.group(1).strip()
        domicilio = re.sub(r'\s+', ' ', domicilio)
        return domicilio

    return ""


def separar_nombre_completo(nombre_completo: str) -> dict:
    partes = nombre_completo.split()

    if len(partes) >= 3:
        return {
            "nombre": " ".join(partes[2:]),
            "apellido_p": partes[0],
            "apellido_m": partes[1],
        }

    elif len(partes) == 2:
        return {
            "nombre": partes[1],
            "apellido_p": partes[0],
            "apellido_m": "",
        }

    return {
        "nombre": nombre_completo,
        "apellido_p": "",
        "apellido_m": "",
    }


def procesar_ine_con_ocr_space(imagen) -> dict:
    url = "https://api.ocr.space/parse/image"

    respuesta = requests.post(
        url,
        files={
            "filename": (imagen.name, imagen, imagen.content_type)
        },
        data={
            "apikey": settings.OCR_API_KEY,
            "language": "spa",
            "isOverlayRequired": False,
            "OCREngine": 2,
        },
        timeout=30,
    )

    respuesta.raise_for_status()
    data = respuesta.json()

    resultados = data.get("ParsedResults", [])
    texto = " ".join([r.get("ParsedText", "") for r in resultados])
    texto_limpio = limpiar_texto(texto)

    return {
        "texto_detectado": texto_limpio,
        "nombre": extraer_nombre(texto_limpio),
        "domicilio": extraer_domicilio(texto_limpio),
        "curp": extraer_curp(texto_limpio),
        "fecha_nacimiento": extraer_fecha_nacimiento(texto_limpio),
    }