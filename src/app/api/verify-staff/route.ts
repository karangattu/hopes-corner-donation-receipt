import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const staffCode = process.env.STAFF_ACCESS_CODE;

    if (!staffCode) {
      console.error('Staff access code not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (code === staffCode) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
    }
  } catch (err) {
    console.error('Staff verification error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}