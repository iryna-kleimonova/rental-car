import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://car-rental-api.goit.global';

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const response = await axios.get(`${API_BASE_URL}/cars`, { params: searchParams });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy error fetching cars', error);
    return NextResponse.json(
      { message: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

