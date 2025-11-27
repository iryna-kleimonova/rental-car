import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://car-rental-api.goit.global';

export async function GET() {
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/brands`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy error fetching brands', error);
    return NextResponse.json<string[]>([], { status: 500 });
  }
}

