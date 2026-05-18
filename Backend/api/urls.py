from django.urls import path
from api.views import upload_contract

urlpatterns = [
    path('upload/', upload_contract, name='upload-contract'),
]
