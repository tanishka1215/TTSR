from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'appliances', views.ApplianceViewSet, basename='appliance')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.dashboard_summary, name='dashboard-summary'),
    path('recommendations/', views.recommendations, name='recommendations'),
    path('simulator/', views.simulate, name='simulator'),
    path('presets/', views.preset_appliances, name='preset-appliances'),
    path('seed/', views.seed_sample_appliances, name='seed-appliances'),
]
