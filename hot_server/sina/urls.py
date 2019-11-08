from django.urls import path
from sina import views
urlpatterns = [
    path('data',views.sina)
]
