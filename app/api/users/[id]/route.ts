
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import mongoose from 'mongoose';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getSession(request);
      if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      
      // A user can update their own info, or an admin can update any user.
      if (session.userId !== params.id && session.role !== 'admin' && session.role !== 'super-admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      await dbConnect();
      const body = await request.json();
      
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
      }

      // Prevent non-admins from changing their role
      if (body.role && session.role !== 'admin' && session.role !== 'super-admin') {
        delete body.role;
      }
      
      const user = await User.findById(params.id);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // If emailConfig is being updated, it needs the pre-save hook
      if (body.emailConfig) {
        // Merge new config. Passwords will be encrypted by pre-save hook.
        user.emailConfig = { ...user.emailConfig, ...body.emailConfig };
        delete body.emailConfig; // remove from main body to avoid overwriting
      }
      
      Object.assign(user, body);
      await user.save();
      
      const userObject = user.toObject();
      delete userObject.password;

      return NextResponse.json(userObject);

    } catch (error: any) {
      console.error('Failed to update user:', error);
      return NextResponse.json(
        { message: 'Failed to update user', details: error.toString() },
        { status: 500 }
      );
    }
}

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
