from rest_framework.pagination import PageNumberPagination

class PropiedadPagination(PageNumberPagination):
    page_size = 10
    max_page_size = 25