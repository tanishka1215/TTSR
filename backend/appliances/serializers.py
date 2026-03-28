from rest_framework import serializers
from .models import Appliance
from .calculations import calc_appliance_stats, calc_standby_wattage


class ApplianceSerializer(serializers.ModelSerializer):
    # Read-only computed fields
    daily_kwh = serializers.SerializerMethodField()
    monthly_kwh = serializers.SerializerMethodField()
    yearly_kwh = serializers.SerializerMethodField()
    standby_kwh_monthly = serializers.SerializerMethodField()
    standby_hours = serializers.SerializerMethodField()
    effective_standby_wattage = serializers.SerializerMethodField()
    room_display = serializers.CharField(source='get_room_display', read_only=True)

    class Meta:
        model = Appliance
        fields = [
            'id', 'name', 'room', 'room_display', 'wattage',
            'usage_hours_per_day', 'standby_enabled', 'standby_wattage',
            'created_at', 'updated_at',
            # Computed
            'daily_kwh', 'monthly_kwh', 'yearly_kwh',
            'standby_kwh_monthly', 'standby_hours', 'effective_standby_wattage',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_daily_kwh(self, obj):
        stats = calc_appliance_stats(obj)
        return stats['daily_total_kwh']

    def get_monthly_kwh(self, obj):
        stats = calc_appliance_stats(obj)
        return stats['monthly_total_kwh']

    def get_yearly_kwh(self, obj):
        stats = calc_appliance_stats(obj)
        return stats['yearly_total_kwh']

    def get_standby_kwh_monthly(self, obj):
        stats = calc_appliance_stats(obj)
        return stats['monthly_standby_kwh']

    def get_standby_hours(self, obj):
        if obj.standby_enabled:
            return max(0, 24 - obj.usage_hours_per_day)
        return 0

    def get_effective_standby_wattage(self, obj):
        if obj.standby_wattage:
            return obj.standby_wattage
        return calc_standby_wattage(obj.wattage)

    def validate_wattage(self, value):
        if value <= 0:
            raise serializers.ValidationError("Wattage must be positive.")
        return value

    def validate_usage_hours_per_day(self, value):
        if not (0 <= value <= 24):
            raise serializers.ValidationError("Usage hours must be between 0 and 24.")
        return value
