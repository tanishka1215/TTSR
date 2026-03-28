"""
AI + Gamification API views for VoltWise.
All new endpoints — existing appliance/auth endpoints are untouched.
"""

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from .models import Appliance, UserProfile
from .calculations import calc_dashboard_summary
from .gemini_service import (
    get_electricity_rate,
    generate_insights,
    calculate_energy_score,
)


# ─── Helper ──────────────────────────────────────────────────────────

def _get_or_create_profile(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


# ─── User Profile ────────────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """GET or update user profile (city, electricity rate)."""
    profile = _get_or_create_profile(request.user)

    if request.method == 'GET':
        return Response({
            'username':         request.user.username,
            'email':            request.user.email,
            'city':             profile.city,
            'electricity_rate': profile.electricity_rate,
        })

    # PUT — update city (triggers rate fetch)
    city = request.data.get('city', '').strip()
    if city and city != profile.city:
        rate_info = get_electricity_rate(city)
        profile.city = city
        profile.electricity_rate = rate_info['rate']
        profile.save()
        return Response({
            'city':             profile.city,
            'electricity_rate': profile.electricity_rate,
            'rate_source':      rate_info['source'],
            'message':          f'Rate for {city}: ₹{profile.electricity_rate}/unit',
        })

    return Response({'message': 'No changes made.'})


# ─── Electricity Rate Lookup ──────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def electricity_rate(request):
    """GET /api/ai/electricity-rate/?city=Pune"""
    city = request.query_params.get('city', '').strip()
    if not city:
        return Response({'error': 'city parameter is required'}, status=400)

    result = get_electricity_rate(city)
    return Response(result)


# ─── AI Insights ─────────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def ai_insights(request):
    """GET /api/ai/insights/ — returns 3 AI-generated insights."""
    appliances = Appliance.objects.all()
    if not appliances.exists():
        return Response({
            'insights': [],
            'powered_by': 'none',
            'message': 'Add appliances first to get AI insights.',
        })

    dashboard = calc_dashboard_summary(appliances)
    insights  = generate_insights(dashboard)

    import os
    powered_by = 'gemini' if os.getenv('GEMINI_API_KEY') else 'fallback'

    return Response({
        'insights':   insights,
        'powered_by': powered_by,
        'score':      calculate_energy_score(dashboard),
    })


# ─── Gamification ────────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def gamification(request):
    """GET /api/gamification/ — score, badge, points for current user."""
    profile = _get_or_create_profile(request.user)

    appliances  = Appliance.objects.all()
    score       = 75
    monthly_kwh = 0

    if appliances.exists():
        dashboard   = calc_dashboard_summary(appliances)
        score       = calculate_energy_score(dashboard)
        monthly_kwh = dashboard.get('total_monthly_kwh', 0)

    # Persist score
    profile.score = score
    profile.save()

    # Badge
    if score >= 80:
        badge = {'label': 'Energy Pro',      'icon': '🟢', 'color': '#22c55e'}
    elif score >= 50:
        badge = {'label': 'Saver',           'icon': '🟡', 'color': '#f59e0b'}
    else:
        badge = {'label': 'High Consumer',   'icon': '🔴', 'color': '#ef4444'}

    return Response({
        'score':       score,
        'badge':       badge,
        'points':      profile.points,
        'monthly_kwh': round(monthly_kwh, 1),
        'city':        profile.city,
        'electricity_rate': profile.electricity_rate,
    })
