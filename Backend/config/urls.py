from django.urls import path, include

urlpatterns = [
    path('api/contracts/', include('api.urls')),
]
