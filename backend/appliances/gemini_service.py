"""
Gemini AI service for VoltWise.
Uses Python's built-in urllib (no extra packages needed).
Falls back gracefully if API key is missing or call fails.
"""

import os
import re
import json
import logging

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta"
    "/models/gemini-1.5-flash:generateContent"
)

# ─── City rate lookup (offline, instant) ────────────────────────────
CITY_RATES = {
    'mumbai': 5.50, 'pune': 6.35, 'delhi': 6.00, 'new delhi': 6.00,
    'bangalore': 6.55, 'bengaluru': 6.55, 'hyderabad': 6.00,
    'chennai': 5.65, 'kolkata': 5.50, 'ahmedabad': 5.50,
    'jaipur': 6.65, 'lucknow': 5.50, 'nagpur': 5.90,
    'surat': 5.50, 'patna': 6.00, 'bhopal': 5.75,
    'indore': 5.75, 'chandigarh': 4.80, 'noida': 6.00,
    'gurgaon': 6.00, 'gurugram': 6.00, 'thane': 5.50,
    'nashik': 6.35, 'coimbatore': 5.65, 'vizag': 6.00,
    'visakhapatnam': 6.00, 'kochi': 4.50, 'cochin': 4.50,
}
DEFAULT_RATE = 7.10


def _call_gemini(prompt: str, max_tokens: int = 300) -> str | None:
    """Call Gemini API. Returns text or None on any failure."""
    if not GEMINI_API_KEY:
        return None
    try:
        import urllib.request
        import urllib.error

        payload = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": max_tokens,
            },
        }).encode('utf-8')

        req = urllib.request.Request(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data['candidates'][0]['content']['parts'][0]['text'].strip()
    except Exception as exc:
        logger.warning("Gemini call failed: %s", exc)
        return None


# ─── Electricity Rate ────────────────────────────────────────────────

def get_electricity_rate(city: str) -> dict:
    """
    Return electricity rate for a city.
    Priority: local lookup → Gemini API → default.
    """
    city_lower = city.lower().strip()

    # 1. Local lookup (instant, offline)
    for key, rate in CITY_RATES.items():
        if key in city_lower or city_lower in key:
            return {'rate': rate, 'source': 'lookup', 'city': city}

    # 2. Gemini
    if GEMINI_API_KEY:
        prompt = (
            f"What is the approximate average residential electricity rate per unit "
            f"(₹/kWh) for {city}, India? "
            f"Reply with ONLY a single decimal number, nothing else. Example: 6.50"
        )
        response = _call_gemini(prompt, max_tokens=20)
        if response:
            match = re.search(r'\d+\.?\d*', response)
            if match:
                rate = float(match.group())
                if 2.0 <= rate <= 20.0:
                    return {'rate': round(rate, 2), 'source': 'gemini', 'city': city}

    # 3. Default
    return {'rate': DEFAULT_RATE, 'source': 'default', 'city': city}


# ─── AI Insights ─────────────────────────────────────────────────────

def generate_insights(dashboard_data: dict) -> list:
    """
    Generate 3 AI insights from dashboard data.
    Falls back to rule-based insights if Gemini unavailable.
    """
    appliances   = dashboard_data.get('appliances', [])
    monthly_cost = dashboard_data.get('total_monthly_cost', 0)
    yearly_co2   = dashboard_data.get('total_yearly_co2_kg', 0)
    monthly_kwh  = dashboard_data.get('total_monthly_kwh', 0)
    slab         = dashboard_data.get('current_slab', 'LOW')
    top_name     = appliances[0]['name'] if appliances else 'Unknown appliance'

    if GEMINI_API_KEY and appliances:
        prompt = (
            f"Analyze this Indian household energy data and give exactly 3 short insights (one sentence each):\n"
            f"- Monthly electricity bill: ₹{monthly_cost:.0f}\n"
            f"- Monthly usage: {monthly_kwh:.1f} kWh (currently in {slab} billing slab)\n"
            f"- Yearly CO₂ emissions: {yearly_co2:.1f} kg\n"
            f"- Top energy-consuming appliance: {top_name}\n"
            f"- Total tracked appliances: {len(appliances)}\n\n"
            f"Reply in exactly this format (no extra text):\n"
            f"1. [biggest energy waste finding]\n"
            f"2. [specific money-saving tip]\n"
            f"3. [environmental impact statement]"
        )
        response = _call_gemini(prompt, max_tokens=250)
        if response:
            lines = [l.strip() for l in response.split('\n') if l.strip()]
            parsed = [re.sub(r'^[123]\.\s*', '', l) for l in lines if l]
            parsed = [p for p in parsed if len(p) > 15]
            if len(parsed) >= 2:
                return parsed[:3]

    return _rule_based_insights(dashboard_data)


def _rule_based_insights(data: dict) -> list:
    """Deterministic insights when Gemini is unavailable."""
    appliances   = data.get('appliances', [])
    monthly_kwh  = data.get('total_monthly_kwh', 0)
    yearly_co2   = data.get('total_yearly_co2_kg', 0)
    slab         = data.get('current_slab', 'LOW')
    monthly_cost = data.get('total_monthly_cost', 0)

    insights = []

    # 1 · Biggest waster
    if appliances:
        top = appliances[0]
        insights.append(
            f"🔥 {top['name']} alone uses {top['energy_percentage']:.0f}% of your total energy, "
            f"costing ₹{top['yearly_cost']:,.0f}/year — your #1 target for savings."
        )

    # 2 · Cost tip based on slab
    if slab == 'HIGH':
        save_units = round(monthly_kwh - 300, 1)
        insights.append(
            f"💡 You're in the highest billing slab (₹15/unit). Cutting just "
            f"{save_units} kWh/month drops you to ₹12.94/unit and saves ₹{round(save_units * 2.06)}/month."
        )
    elif slab == 'MEDIUM':
        save_units = round(monthly_kwh - 100, 1)
        insights.append(
            f"💡 Dropping below 100 units/month lowers your rate from ₹12.94 → ₹7.10/unit. "
            f"Reduce by {save_units} kWh to unlock this saving."
        )
    else:
        insights.append(
            f"✅ Great job staying in the lowest slab (₹7.10/unit). Your ₹{monthly_cost:.0f}/month "
            f"bill is well-optimised — keep it up!"
        )

    # 3 · Environmental impact
    trees_needed = max(1, round(yearly_co2 / 20))
    insights.append(
        f"🌍 Your home emits {yearly_co2:.1f} kg CO₂/year. That's equivalent to "
        f"{trees_needed} trees needed to offset it — every kWh saved counts."
    )

    return insights


# ─── Energy Saver Score ──────────────────────────────────────────────

def calculate_energy_score(dashboard_data: dict) -> int:
    """Return energy efficiency score 0–100."""
    appliances  = dashboard_data.get('appliances', [])
    slab        = dashboard_data.get('current_slab', 'LOW')
    monthly_kwh = dashboard_data.get('total_monthly_kwh', 0)

    if not appliances:
        return 75  # neutral default

    score = 100

    # Slab penalty
    if slab == 'HIGH':
        score -= 35
    elif slab == 'MEDIUM':
        score -= 15

    # Phantom load penalty (5 pts per standby device)
    standby_count = sum(1 for a in appliances if a.get('standby_enabled', False))
    score -= standby_count * 5

    # Per-appliance efficiency penalty
    avg_monthly = monthly_kwh / len(appliances)
    if avg_monthly > 100:
        score -= 15
    elif avg_monthly > 50:
        score -= 5

    return max(10, min(100, round(score)))
