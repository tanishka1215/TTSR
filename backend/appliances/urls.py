from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import auth_views
from . import ai_views

router = DefaultRouter()
router.register(r'appliances', views.ApplianceViewSet, basename='appliance')

urlpatterns = [
    # ── Appliances (existing) ────────────────────────────────
    path('', include(router.urls)),
    path('dashboard/', views.dashboard_summary, name='dashboard-summary'),
    path('recommendations/', views.recommendations, name='recommendations'),
    path('simulator/', views.simulate, name='simulator'),
    path('presets/', views.preset_appliances, name='preset-appliances'),
    path('seed/', views.seed_sample_appliances, name='seed-appliances'),

    # ── Auth ─────────────────────────────────────────────────
    path('auth/register/', auth_views.register, name='auth-register'),
    path('auth/login/',    auth_views.login,    name='auth-login'),
    path('auth/logout/',   auth_views.logout,   name='auth-logout'),
    path('auth/me/',       auth_views.me,       name='auth-me'),
    path('auth/profile/',  ai_views.user_profile, name='auth-profile'),

    # ── AI + Gamification ────────────────────────────────────
    path('ai/insights/',          ai_views.ai_insights,       name='ai-insights'),
    path('ai/electricity-rate/',  ai_views.electricity_rate,  name='ai-electricity-rate'),
    path('gamification/',         ai_views.gamification,      name='gamification'),
]

