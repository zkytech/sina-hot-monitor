from django.urls import path
from data import views
urlpatterns = [
    path('sina',views.sina),
    path('zhihu',views.zhihu),
    path('bilibili',views.bilibili)
]
