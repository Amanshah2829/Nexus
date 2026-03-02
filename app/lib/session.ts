
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { NextRequest } from 'next/server';

export type SessionData = {
    userId: string;
    email: string;
    role: 'super-admin' | 'admin' | 'engineer' | 'viewer' | 'sales' | 'hod' | 'micro-admin' | 'nano-admin' | 'user';
    name: string;
    tenant: string | null; // Tenant ID, null for super-admins
}

function isNextRequest(request: any): request is NextRequest {
    return !!request.nextUrl;
}


export async function getSession(request: NextRequest | ReadonlyRequestCookies): Promise<SessionData | null> {
    
    let sessionCookie;

    if (isNextRequest(request)) {
        // This is a NextRequest from middleware
        sessionCookie = request.cookies.get('session');
    } else {
        // This is a ReadonlyRequestCookies object from a Server Component
        sessionCookie = request.get('session');
    }

    if (!sessionCookie) {
        // This log can be noisy, but useful for debugging auth issues.
        // console.log("No session cookie found");
        return null;
    }

    try {
        const session = JSON.parse(sessionCookie.value);
        // Basic validation to ensure the session object has the expected shape
        if (session && session.userId && session.role) {
            return session;
        }
        console.error('Invalid session object:', session);
        return null;
    } catch (e) {
        console.error('Failed to parse session cookie:', e);
        return null;
    }
}
