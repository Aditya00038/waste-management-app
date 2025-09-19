import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

// This route is called by a Vercel cron job every 10 minutes to clean up expired notifications
export async function GET() {
  try {
    const now = Date.now();
    
    // Get all expired notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('expiresAt', '<=', now)
    );
    
    const expiredNotificationsSnapshot = await getDocs(q);
    
    // Delete all expired notifications
    const deleteTasks = [];
    for (const docSnapshot of expiredNotificationsSnapshot.docs) {
      deleteTasks.push(deleteDoc(docSnapshot.ref));
    }
    
    // Wait for all delete tasks to complete
    await Promise.all(deleteTasks);
    
    return NextResponse.json({ 
      success: true, 
      notificationsProcessed: expiredNotificationsSnapshot.size 
    });
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
