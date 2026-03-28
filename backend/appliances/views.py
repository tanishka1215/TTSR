from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Appliance
from .serializers import ApplianceSerializer
from .calculations import (
    calc_dashboard_summary,
    generate_recommendations,
    simulate_what_if,
    PRESET_APPLIANCES,
    calc_appliance_stats,
    calc_standby_wattage,
)


class ApplianceViewSet(viewsets.ModelViewSet):
    """Full CRUD for appliances."""
    queryset = Appliance.objects.all().order_by('-created_at')
    serializer_class = ApplianceSerializer


@api_view(['GET'])
def dashboard_summary(request):
    """
    Aggregated dashboard stats:
    - Total cost, CO2, units
    - Per-appliance breakdown with waste scores
    - Ranked appliances
    """
    appliances = Appliance.objects.all()
    if not appliances.exists():
        return Response({
            'total_monthly_kwh': 0,
            'total_yearly_kwh': 0,
            'total_monthly_cost': 0,
            'total_yearly_cost': 0,
            'total_yearly_co2_kg': 0,
            'current_slab': 'LOW',
            'appliance_count': 0,
            'appliances': [],
        })

    data = calc_dashboard_summary(appliances)
    return Response(data)


@api_view(['GET'])
def recommendations(request):
    """Smart recommendation engine based on current appliance data."""
    appliances = Appliance.objects.all()
    if not appliances.exists():
        return Response([])

    dashboard_data = calc_dashboard_summary(appliances)
    tips = generate_recommendations(dashboard_data)
    return Response(tips)


@api_view(['POST'])
def simulate(request):
    """
    What-if simulator.
    POST body: { modifications: [{id, usage_hours_per_day, standby_enabled}, ...] }
    """
    modifications = request.data.get('modifications', [])
    appliances = Appliance.objects.all()

    if not appliances.exists():
        return Response({'error': 'No appliances found'}, status=400)

    # Build current appliance data list
    appliances_data = []
    for app in appliances:
        stats = calc_appliance_stats(app)
        appliances_data.append({
            'id': app.id,
            'name': app.name,
            'wattage': app.wattage,
            'usage_hours_per_day': app.usage_hours_per_day,
            'standby_enabled': app.standby_enabled,
            'standby_wattage': app.standby_wattage or calc_standby_wattage(app.wattage),
        })

    # Get baseline (current)
    from .calculations import calc_slab_cost, INDIA_CO2_FACTOR
    current_monthly_kwh = sum(a['monthly_total_kwh'] for a in [calc_appliance_stats(app) for app in appliances])
    current_monthly_cost = calc_slab_cost(current_monthly_kwh)
    current_yearly_cost = current_monthly_cost * 12
    current_yearly_co2 = round((current_monthly_kwh * 12) * INDIA_CO2_FACTOR, 2)

    # Simuate new scenario
    result = simulate_what_if(appliances_data, modifications)

    result['current_yearly_cost'] = round(current_yearly_cost, 2)
    result['savings_yearly'] = round(current_yearly_cost - result['new_yearly_cost'], 2)
    result['co2_reduction_kg'] = round(current_yearly_co2 - result['new_yearly_co2_kg'], 2)
    result['current_monthly_kwh'] = round(current_monthly_kwh, 2)
    result['units_saved_monthly'] = round(current_monthly_kwh - result['new_monthly_kwh'], 2)

    return Response(result)


@api_view(['GET'])
def preset_appliances(request):
    """Return the built-in appliance preset dataset."""
    return Response(PRESET_APPLIANCES)


@api_view(['POST'])
def seed_sample_appliances(request):
    """
    Seed sample appliances for demo purposes.
    Adds AC, Fan, TV, LED Bulb, Refrigerator if none exist.
    """
    if Appliance.objects.exists():
        return Response({'message': 'Appliances already exist, skipping seed.'})

    samples = [
        {'name': 'AC (1.5 Ton)', 'room': 'bedroom', 'wattage': 1500, 'usage_hours_per_day': 8, 'standby_enabled': True, 'standby_wattage': 30},
        {'name': 'Ceiling Fan', 'room': 'living_room', 'wattage': 75, 'usage_hours_per_day': 10, 'standby_enabled': False},
        {'name': 'LED TV', 'room': 'living_room', 'wattage': 100, 'usage_hours_per_day': 5, 'standby_enabled': True, 'standby_wattage': 2},
        {'name': 'LED Bulb (x4)', 'room': 'bedroom', 'wattage': 36, 'usage_hours_per_day': 6, 'standby_enabled': False},
        {'name': 'Refrigerator', 'room': 'kitchen', 'wattage': 150, 'usage_hours_per_day': 24, 'standby_enabled': True, 'standby_wattage': 150},
    ]

    for sample in samples:
        Appliance.objects.create(**sample)

    return Response({'message': f'Seeded {len(samples)} sample appliances.'}, status=201)
