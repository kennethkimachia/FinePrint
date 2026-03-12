from django.urls import path
from api.views import upload_contract, get_contract_results

urlpatterns = [
    path('upload/', upload_contract, name='upload-contract'),
    path('<uuid:contract_id>/results/', get_contract_results, name='contract-results'),
]
