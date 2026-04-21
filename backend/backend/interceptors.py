from loguru import logger
import logging
from django.db import connection

class InterceptorHandler(logging.Handler):
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2

        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        
        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())
        
def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")

    return ip


class AuditMiddleware:
    """Audits every API request across all modules using logs and optional DB table."""

    CANDIDATE_TABLES = ("auditoria", "auditoria_log", "audit_log")

    def __init__(self, get_response):
        self.get_response = get_response
        self._resolved_table_name = None
        self._table_resolution_done = False

    def __call__(self, request):
        response = self.get_response(request)

        if request.path.startswith("/api/"):
            self._audit_request(request, response)

        return response

    def _resolve_audit_table_name(self):
        if self._table_resolution_done:
            return self._resolved_table_name

        self._table_resolution_done = True
        try:
            existing_tables = set(connection.introspection.table_names())
            for candidate in self.CANDIDATE_TABLES:
                if candidate in existing_tables:
                    self._resolved_table_name = candidate
                    break
        except Exception:
            self._resolved_table_name = None

        return self._resolved_table_name

    def _extract_modulo(self, path):
        parts = [p for p in path.strip("/").split("/") if p]
        if len(parts) < 2:
            return "sistema"
        return parts[1]

    def _extract_accion(self, request):
        resolver_match = getattr(request, "resolver_match", None)
        if resolver_match and resolver_match.view_name:
            return f"{request.method} {resolver_match.view_name}"
        return f"{request.method} {request.path}"

    def _extract_user_id(self, request):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return None
        return getattr(user, "pk", None)

    def _save_in_db_if_possible(self, request, response, modulo, accion):
        table_name = self._resolve_audit_table_name()
        if not table_name:
            return

        ip = get_client_ip(request)
        user_id = self._extract_user_id(request)
        status_code = getattr(response, "status_code", None)
        detalle = f"{request.method} {request.path} -> {status_code}"

        query = (
            f"INSERT INTO {table_name} "
            "(modulo, accion, usuario_id, ip, status_code, detalle, fecha) "
            "VALUES (%s, %s, %s, %s, %s, %s, NOW())"
        )

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    query,
                    [modulo, accion, user_id, ip, status_code, detalle],
                )
        except Exception:
            # Failsafe: if table schema differs, keep file-based audit only.
            pass

    def _audit_request(self, request, response):
        modulo = self._extract_modulo(request.path)
        accion = self._extract_accion(request)
        status_code = getattr(response, "status_code", None)
        ip = get_client_ip(request)
        user_id = self._extract_user_id(request)

        logger.bind(
            audit=True,
            user_id=user_id,
            ip=ip,
            action=accion,
            modulo=modulo,
            status_code=status_code,
        ).log("AUDIT", f"modulo={modulo} accion={accion} status={status_code}")

        self._save_in_db_if_possible(request, response, modulo, accion)