from django.db import models


ROOM_CHOICES = [
    ('living_room', 'Living Room'),
    ('bedroom', 'Bedroom'),
    ('kitchen', 'Kitchen'),
    ('bathroom', 'Bathroom'),
    ('office', 'Office/Study'),
    ('dining', 'Dining Room'),
    ('garage', 'Garage'),
    ('other', 'Other'),
]


class Appliance(models.Model):
    name = models.CharField(max_length=200)
    room = models.CharField(max_length=50, choices=ROOM_CHOICES, default='living_room')
    wattage = models.FloatField(help_text="Active wattage in Watts")
    usage_hours_per_day = models.FloatField(help_text="Active usage hours per day")
    standby_enabled = models.BooleanField(default=False)
    standby_wattage = models.FloatField(
        null=True, blank=True,
        help_text="Standby wattage in Watts (auto-computed if not provided)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.wattage}W)"
