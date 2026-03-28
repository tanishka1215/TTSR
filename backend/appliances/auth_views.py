from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import UserProfile
from .gemini_service import get_electricity_rate


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def register(request):
    """Register a new user and return a token."""
    username = request.data.get('username', '').strip()
    email    = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken.'}, status=400)

    if email and User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered.'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)

    # Create profile with optional city + rate
    city = request.data.get('city', '').strip()
    rate_info = get_electricity_rate(city) if city else {'rate': 7.10, 'source': 'default'}
    UserProfile.objects.create(
        user=user,
        city=city,
        electricity_rate=rate_info['rate'],
    )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id':       user.id,
            'username': user.username,
            'email':    user.email,
            'city':     city,
            'electricity_rate': rate_info['rate'],
        }
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login(request):
    """Authenticate and return a token."""
    from django.contrib.auth import authenticate
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials.'}, status=401)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id':       user.id,
            'username': user.username,
            'email':    user.email,
        }
    })


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    """Delete the user's token (logout)."""
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    """Return current authenticated user info."""
    return Response({
        'id':       request.user.id,
        'username': request.user.username,
        'email':    request.user.email,
    })
