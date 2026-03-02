
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Setting from '@/app/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const signupSetting = await Setting.findOne({ key: 'signupEnabled' });
        // Default to true if not set, to not lock out admins from setting it the first time.
        const isEnabled = signupSetting ? signupSetting.value : true;
        return NextResponse.json({ key: 'signupEnabled', value: isEnabled });
    } catch (e) {
        console.error("Could not fetch signupEnabled setting:", e);
        // Fail open if there's a DB error to prevent locking everyone out.
        return NextResponse.json({ key: 'signupEnabled', value: true });
    }
}
