
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getSession(request);
      if (session?.role !== 'admin' && session?.role !== 'super-admin') {
          return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
      }

      await dbConnect();
      
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
      }

      // Prevent users from deleting themselves
      if (session.userId === params.id) {
        return NextResponse.json({ message: 'You cannot delete your own account.' }, { status: 400 });
      }

      const deletedUser = await User.findByIdAndDelete(params.id);
  
      if (!deletedUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      return NextResponse.json(
        { message: 'Failed to delete user', details: error.toString() },
        { status: 500 }
      );
    }
}
