import re
import requests
import os


class OCRSpaceError(Exception):
    def __init__(self, mensaje: str, detalle: str = "", status_code: int = 502):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.detalle = detalle
        self.status_code = status_code


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


def _construir_payload(apikey: str, engine: int) -> dict:
    return {
        "apikey": apikey,
        "language": "spa",
        "isOverlayRequired": False,
        "OCREngine": engine,
    }


def _construir_archivo_payload(imagen, field_name: str) -> dict:
    return {
        field_name: (imagen.name, imagen, imagen.content_type)
    }


def _obtener_detalle_error_respuesta(respuesta: requests.Response) -> str:
    try:
        data = respuesta.json()
        if isinstance(data, dict):
            if data.get("ErrorMessage"):
                if isinstance(data["ErrorMessage"], list):
                    return " ".join(str(msg) for msg in data["ErrorMessage"])
                return str(data["ErrorMessage"])
            if data.get("ErrorDetails"):
                return str(data["ErrorDetails"])
    except ValueError:
        pass

    return respuesta.text[:300] if respuesta.text else "Sin detalle provisto por OCR.Space"


def procesar_ine_con_ocr_space(imagen) -> dict:
    url = "https://api.ocr.space/parse/image"
    api_key = os.getenv("OCR_SPACE_API_KEY")

    if not api_key:
        raise OCRSpaceError(
            mensaje="Configuracion incompleta para OCR",
            detalle="No se encontro OCR_SPACE_API_KEY en variables de entorno.",
            status_code=500,
        )

    motores = [2, 1]
    ultimo_error = ""

    for motor in motores:
        for field_name in ["file", "filename"]:
            try:
                if hasattr(imagen, "seek"):
                    imagen.seek(0)

                respuesta = requests.post(
                    url,
                    files=_construir_archivo_payload(imagen, field_name),
                    data=_construir_payload(api_key, motor),
                    timeout=30,
                )
            except requests.Timeout as exc:
                raise OCRSpaceError(
                    mensaje="El servicio OCR tardo demasiado en responder",
                    detalle=str(exc),
                    status_code=504,
                ) from exc
            except requests.RequestException as exc:
                raise OCRSpaceError(
                    mensaje="No se pudo conectar con OCR.Space",
                    detalle=str(exc),
                    status_code=502,
                ) from exc

            if respuesta.status_code >= 500 and motor == 2:
                ultimo_error = _obtener_detalle_error_respuesta(respuesta)
                continue

            if not respuesta.ok:
                detalle = _obtener_detalle_error_respuesta(respuesta)

                # Some OCR.Space proxies validate a specific multipart field name.
                if "Unexpected field" in detalle and field_name == "file":
                    ultimo_error = detalle
                    continue

                raise OCRSpaceError(
                    mensaje="OCR.Space rechazo la solicitud",
                    detalle=detalle,
                    status_code=502,
                )

            try:
                data = respuesta.json()
            except ValueError as exc:
                raise OCRSpaceError(
                    mensaje="Respuesta invalida de OCR.Space",
                    detalle="No se pudo parsear JSON de respuesta.",
                    status_code=502,
                ) from exc

            if data.get("IsErroredOnProcessing"):
                detalle = data.get("ErrorMessage") or data.get("ErrorDetails") or "Error de procesamiento en OCR.Space"
                if isinstance(detalle, list):
                    detalle = " ".join(str(item) for item in detalle)
                if motor == 2:
                    ultimo_error = str(detalle)
                    continue
                raise OCRSpaceError(
                    mensaje="OCR.Space no pudo procesar la imagen",
                    detalle=str(detalle),
                    status_code=422,
                )

            resultados = data.get("ParsedResults", [])
            texto = " ".join([resultado.get("ParsedText", "") for resultado in resultados])
            texto_limpio = limpiar_texto(texto)

            if not texto_limpio:
                raise OCRSpaceError(
                    mensaje="No se detecto texto en la imagen",
                    detalle="OCR.Space devolvio una respuesta vacia.",
                    status_code=422,
                )

            return {
                "nombre": extraer_nombre(texto_limpio),
                "domicilio": extraer_domicilio(texto_limpio),
                "curp": extraer_curp(texto_limpio),
                "fecha_nacimiento": extraer_fecha_nacimiento(texto_limpio),
            }

    raise OCRSpaceError(
        mensaje="OCR.Space no pudo procesar la imagen",
        detalle=ultimo_error or "Fallo al intentar con los motores OCR disponibles.",
        status_code=502,
    )
    
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
