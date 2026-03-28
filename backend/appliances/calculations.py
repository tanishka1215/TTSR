"""
Core energy calculation engine for VoltWise.
All monetary values in INR (₹), energy in kWh, CO2 in kg.
"""

# India CO2 emission factor (kg CO2 per kWh) - CEA 2023
INDIA_CO2_FACTOR = 0.82

# Fixed monthly charges (distribution, meter rent, etc.)
FIXED_MONTHLY_CHARGE = 150.0

# Slab-based pricing (per unit / kWh)
# Format: (upper_limit, rate_per_unit)
SLABS = [
    (100, 7.10),
    (300, 12.94),
    (float('inf'), 15.00),
]


def calc_standby_wattage(active_wattage: float) -> float:
    """Auto-compute standby wattage: 8% of active or minimum 5W."""
    return max(5.0, active_wattage * 0.08)


def calc_daily_kwh(wattage: float, hours: float) -> float:
    """Daily energy consumption in kWh."""
    return (wattage * hours) / 1000.0


def calc_slab_cost(monthly_units: float) -> float:
    """
    Apply slab-based billing. Returns total monthly bill in ₹.
    Slabs: 0-100 @ ₹7.1, 101-300 @ ₹12.94, 300+ @ ₹15
    """
    cost = 0.0
    remaining = monthly_units
    prev_limit = 0

    for limit, rate in SLABS:
        if remaining <= 0:
            break
        slab_band = limit - prev_limit
        units_in_slab = min(remaining, slab_band)
        cost += units_in_slab * rate
        remaining -= units_in_slab
        prev_limit = limit

    return cost + FIXED_MONTHLY_CHARGE


def calc_appliance_stats(appliance) -> dict:
    """
    Calculate all energy stats for a single appliance.
    Returns a comprehensive dict of metrics.
    """
    wattage = float(appliance.wattage)
    hours = float(appliance.usage_hours_per_day)
    standby_enabled = appliance.standby_enabled

    # Active energy
    daily_active_kwh = calc_daily_kwh(wattage, hours)
    monthly_active_kwh = daily_active_kwh * 30
    yearly_active_kwh = daily_active_kwh * 365

    # Standby energy
    standby_wattage = float(appliance.standby_wattage) if appliance.standby_wattage else calc_standby_wattage(wattage)
    standby_hours = max(0, 24 - hours) if standby_enabled else 0
    daily_standby_kwh = calc_daily_kwh(standby_wattage, standby_hours) if standby_enabled else 0
    monthly_standby_kwh = daily_standby_kwh * 30
    yearly_standby_kwh = daily_standby_kwh * 365

    # Total energy
    daily_total_kwh = daily_active_kwh + daily_standby_kwh
    monthly_total_kwh = monthly_active_kwh + monthly_standby_kwh
    yearly_total_kwh = yearly_active_kwh + yearly_standby_kwh

    # CO2 emissions (yearly)
    yearly_co2_kg = yearly_total_kwh * INDIA_CO2_FACTOR

    return {
        'wattage': wattage,
        'usage_hours_per_day': hours,
        'standby_enabled': standby_enabled,
        'standby_wattage': standby_wattage,
        'standby_hours': standby_hours,
        'daily_active_kwh': round(daily_active_kwh, 4),
        'monthly_active_kwh': round(monthly_active_kwh, 3),
        'yearly_active_kwh': round(yearly_active_kwh, 2),
        'daily_standby_kwh': round(daily_standby_kwh, 4),
        'monthly_standby_kwh': round(monthly_standby_kwh, 3),
        'yearly_standby_kwh': round(yearly_standby_kwh, 2),
        'daily_total_kwh': round(daily_total_kwh, 4),
        'monthly_total_kwh': round(monthly_total_kwh, 3),
        'yearly_total_kwh': round(yearly_total_kwh, 2),
        'yearly_co2_kg': round(yearly_co2_kg, 2),
    }


def calc_waste_score(yearly_cost: float, yearly_co2: float, standby_enabled: bool) -> float:
    """
    Waste score formula:
    waste_score = cost + (CO2 × 2) + (standby ? 50 : 0)
    """
    score = yearly_cost + (yearly_co2 * 2) + (50 if standby_enabled else 0)
    return round(score, 2)


def calc_dashboard_summary(appliances) -> dict:
    """
    Aggregate dashboard stats across all appliances.
    Returns total cost, CO2, units, and per-appliance breakdown.
    """
    appliance_stats = []
    total_monthly_kwh = 0.0
    total_yearly_kwh = 0.0
    total_yearly_co2 = 0.0

    for appliance in appliances:
        stats = calc_appliance_stats(appliance)
        total_monthly_kwh += stats['monthly_total_kwh']
        total_yearly_kwh += stats['yearly_total_kwh']
        total_yearly_co2 += stats['yearly_co2_kg']
        appliance_stats.append({
            'id': appliance.id,
            'name': appliance.name,
            'room': appliance.room,
            **stats
        })

    # Slab-based monthly cost
    monthly_cost = calc_slab_cost(total_monthly_kwh)
    yearly_cost = monthly_cost * 12

    # Assign per-appliance cost proportionally
    for stat in appliance_stats:
        proportion = stat['monthly_total_kwh'] / total_monthly_kwh if total_monthly_kwh > 0 else 0
        stat['monthly_cost'] = round(proportion * monthly_cost, 2)
        stat['yearly_cost'] = round(proportion * yearly_cost, 2)
        stat['energy_percentage'] = round(proportion * 100, 1)
        stat['waste_score'] = calc_waste_score(
            stat['yearly_cost'],
            stat['yearly_co2_kg'],
            stat['standby_enabled']
        )

    # Sort by waste score descending
    appliance_stats.sort(key=lambda x: x['waste_score'], reverse=True)

    # Determine slab
    slab_label = 'LOW'
    if total_monthly_kwh > 300:
        slab_label = 'HIGH'
    elif total_monthly_kwh > 100:
        slab_label = 'MEDIUM'

    return {
        'total_monthly_kwh': round(total_monthly_kwh, 2),
        'total_yearly_kwh': round(total_yearly_kwh, 2),
        'total_monthly_cost': round(monthly_cost, 2),
        'total_yearly_cost': round(yearly_cost, 2),
        'total_yearly_co2_kg': round(total_yearly_co2, 2),
        'current_slab': slab_label,
        'appliance_count': len(appliance_stats),
        'appliances': appliance_stats,
    }


def generate_recommendations(dashboard_data: dict) -> list:
    """
    Rule-based smart recommendations engine.
    Returns list of actionable tips.
    """
    recommendations = []
    appliances = dashboard_data['appliances']
    total_monthly_kwh = dashboard_data['total_monthly_kwh']
    total_yearly_cost = dashboard_data['total_yearly_cost']

    for app in appliances:
        name = app['name']
        yearly_cost = app['yearly_cost']
        hours = app['usage_hours_per_day']
        standby = app['standby_enabled']
        pct = app['energy_percentage']

        # High energy consumer
        if pct >= 30:
            recommendations.append({
                'type': 'warning',
                'appliance': name,
                'icon': '⚡',
                'title': f'{name} is your biggest energy hog',
                'message': f'{name} alone consumes {pct}% of your total energy, costing ₹{yearly_cost:,.0f}/year.',
                'saving': None,
            })

        # AC high usage
        if 'ac' in name.lower() or 'air conditioner' in name.lower():
            if hours > 8:
                saving = round((app['wattage'] * 365) / 1000 * 0.082 * 12.94, 0)
                recommendations.append({
                    'type': 'tip',
                    'appliance': name,
                    'icon': '❄️',
                    'title': f'Reduce {name} by 1 hour/day',
                    'message': f'Your {name} runs {hours}h/day. Cutting 1 hour saves approx ₹{saving:,.0f}/year.',
                    'saving': saving,
                })

        # Incandescent bulb → LED
        if 'incandescent' in name.lower() or ('bulb' in name.lower() and app['wattage'] >= 40):
            led_wattage = 9
            kwh_saved_yearly = ((app['wattage'] - led_wattage) * hours * 365) / 1000
            cost_saved = round(kwh_saved_yearly * 12.94, 0)
            recommendations.append({
                'type': 'upgrade',
                'appliance': name,
                'icon': '💡',
                'title': f'Replace {name} with LED',
                'message': f'Switching from {app["wattage"]}W bulb to 9W LED saves ₹{cost_saved:,.0f}/year.',
                'saving': cost_saved,
            })

        # Phantom load / standby ghost
        if standby and app['standby_hours'] >= 16:
            standby_cost = round(app['yearly_standby_kwh'] * 12.94, 0)
            recommendations.append({
                'type': 'phantom',
                'appliance': name,
                'icon': '👻',
                'title': f'Ghost load detected — {name}',
                'message': f'{name} consumes power in standby for {app["standby_hours"]:.0f}h/day. '
                           f'Use a smart plug to save ₹{standby_cost:,.0f}/year.',
                'saving': standby_cost,
            })

        # Refrigerator — always on
        if 'refrigerator' in name.lower() or 'fridge' in name.lower():
            recommendations.append({
                'type': 'tip',
                'appliance': name,
                'icon': '🧊',
                'title': f'Optimise {name} temperature',
                'message': f'Setting fridge at 3–4°C (not 1°C) can reduce energy use by 10–15%, '
                           f'saving approx ₹{round(yearly_cost * 0.12):,.0f}/year.',
                'saving': round(yearly_cost * 0.12),
            })

    # Slab warning
    if total_monthly_kwh > 300:
        units_to_save = round(total_monthly_kwh - 300, 1)
        cost_saving = round(units_to_save * 15, 0)
        recommendations.append({
            'type': 'slab',
            'appliance': None,
            'icon': '📊',
            'title': 'You are in the HIGHEST billing slab!',
            'message': f'You use {total_monthly_kwh:.0f} units/month. '
                       f'Reducing by {units_to_save} units could save ₹{cost_saving:,.0f}/month.',
            'saving': cost_saving,
        })
    elif total_monthly_kwh > 100:
        recommendations.append({
            'type': 'info',
            'appliance': None,
            'icon': '📋',
            'title': 'You are in a medium consumption slab',
            'message': f'You use {total_monthly_kwh:.0f} units/month (₹12.94/unit). '
                       f'Keeping usage under 100 units drops cost to ₹7.10/unit.',
            'saving': None,
        })

    return recommendations


def simulate_what_if(appliances_data: list, modifications: list) -> dict:
    """
    What-if simulator: apply modifications to appliances and recalculate.
    modifications = [{'id': int, 'usage_hours_per_day': float, 'standby_enabled': bool}, ...]
    """
    # Build modification lookup
    mod_map = {m['id']: m for m in modifications}

    total_monthly_kwh = 0.0
    simulated_appliances = []

    for app in appliances_data:
        app_id = app['id']
        mod = mod_map.get(app_id, {})

        hours = mod.get('usage_hours_per_day', app['usage_hours_per_day'])
        standby = mod.get('standby_enabled', app['standby_enabled'])
        wattage = app['wattage']
        standby_wattage = app['standby_wattage'] or calc_standby_wattage(wattage)

        daily_active_kwh = calc_daily_kwh(wattage, hours)
        standby_hours = max(0, 24 - hours) if standby else 0
        daily_standby_kwh = calc_daily_kwh(standby_wattage, standby_hours) if standby else 0

        monthly_total = (daily_active_kwh + daily_standby_kwh) * 30
        total_monthly_kwh += monthly_total

        simulated_appliances.append({
            'id': app_id,
            'name': app['name'],
            'monthly_kwh': round(monthly_total, 3),
        })

    new_monthly_cost = calc_slab_cost(total_monthly_kwh)
    new_yearly_cost = new_monthly_cost * 12
    new_yearly_co2 = round((total_monthly_kwh * 12) * INDIA_CO2_FACTOR, 2)

    return {
        'new_monthly_kwh': round(total_monthly_kwh, 2),
        'new_monthly_cost': round(new_monthly_cost, 2),
        'new_yearly_cost': round(new_yearly_cost, 2),
        'new_yearly_co2_kg': new_yearly_co2,
        'appliances': simulated_appliances,
    }


# ─── Preset Appliance Data ───────────────────────────────────────────────────

PRESET_APPLIANCES = [
    {'name': 'AC (1.5 Ton)', 'wattage': 1500, 'standby_enabled': True, 'standby_wattage': 30, 'category': 'Cooling'},
    {'name': 'AC (1 Ton)', 'wattage': 1000, 'standby_enabled': True, 'standby_wattage': 20, 'category': 'Cooling'},
    {'name': 'Ceiling Fan', 'wattage': 75, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Cooling'},
    {'name': 'Table Fan', 'wattage': 50, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Cooling'},
    {'name': 'LED Bulb (9W)', 'wattage': 9, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Lighting'},
    {'name': 'Incandescent Bulb (60W)', 'wattage': 60, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Lighting'},
    {'name': 'Tubelight (36W)', 'wattage': 36, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Lighting'},
    {'name': 'Refrigerator (Double Door)', 'wattage': 200, 'standby_enabled': True, 'standby_wattage': 200, 'category': 'Kitchen'},
    {'name': 'Refrigerator (Single Door)', 'wattage': 150, 'standby_enabled': True, 'standby_wattage': 150, 'category': 'Kitchen'},
    {'name': 'Microwave Oven', 'wattage': 1200, 'standby_enabled': True, 'standby_wattage': 3, 'category': 'Kitchen'},
    {'name': 'Mixer / Grinder', 'wattage': 750, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Kitchen'},
    {'name': 'Electric Kettle', 'wattage': 1500, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Kitchen'},
    {'name': 'TV (LED 40")', 'wattage': 100, 'standby_enabled': True, 'standby_wattage': 2, 'category': 'Entertainment'},
    {'name': 'TV (LED 55")', 'wattage': 150, 'standby_enabled': True, 'standby_wattage': 3, 'category': 'Entertainment'},
    {'name': 'Set-top Box', 'wattage': 20, 'standby_enabled': True, 'standby_wattage': 15, 'category': 'Entertainment'},
    {'name': 'Laptop', 'wattage': 60, 'standby_enabled': True, 'standby_wattage': 5, 'category': 'Computing'},
    {'name': 'Desktop Computer', 'wattage': 300, 'standby_enabled': True, 'standby_wattage': 5, 'category': 'Computing'},
    {'name': 'WiFi Router', 'wattage': 10, 'standby_enabled': True, 'standby_wattage': 10, 'category': 'Computing'},
    {'name': 'Phone Charger', 'wattage': 20, 'standby_enabled': True, 'standby_wattage': 5, 'category': 'Computing'},
    {'name': 'Washing Machine', 'wattage': 500, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Appliances'},
    {'name': 'Clothes Iron', 'wattage': 1000, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Appliances'},
    {'name': 'Water Heater / Geyser', 'wattage': 2000, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Appliances'},
    {'name': 'Water Pump (0.5 HP)', 'wattage': 375, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Appliances'},
    {'name': 'Vacuum Cleaner', 'wattage': 1200, 'standby_enabled': False, 'standby_wattage': None, 'category': 'Appliances'},
    {'name': 'Air Purifier', 'wattage': 50, 'standby_enabled': True, 'standby_wattage': 3, 'category': 'Appliances'},
]
