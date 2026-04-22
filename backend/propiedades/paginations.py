from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class PropiedadPagination(PageNumberPagination):
    page_size = 10
    max_page_size = 25
    page_size_query_param = "size"
    
    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "page": self.page.number,
            "size": self.get_page_size(self.request),
            "total_pages": self.page.paginator.num_pages,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })