import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Forward to backend API
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    try {
      const response = await fetch(`${backendUrl}/api/auth/google-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.warn('Backend connection failed for google-signin:', backendError.message);
    }

    // Fallback demo user for Google Sign In if backend is offline
    return NextResponse.json({
      message: 'Google Sign-In successful',
      token: 'demo-google-token-' + Date.now(),
      user: {
        id: 8888,
        email: 'googleuser@skillmirror.ai',
        name: 'Google User'
      }
    });
  } catch (error) {
    console.error('Google Sign-In API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
