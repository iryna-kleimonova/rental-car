import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://car-rental-api.goit.global';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await axios.get(`${API_BASE_URL}/cars/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy error fetching car details', error);
    return NextResponse.json(
      { message: 'Failed to fetch car details' },
      { status: 500 }
    );
  }
}

