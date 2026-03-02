
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Redirect to the new clean URL
    const url = new URL(request.url);
    return NextResponse.redirect(new URL('/seed/feed', url.origin));
}
