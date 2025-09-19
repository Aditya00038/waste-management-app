import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { isVehicleNearby } from '@/lib/vehicle-tracking';
import { createVehicleProximityNotification } from '@/lib/notifications';

// This route is called by a Vercel cron job every 5 minutes
export async function GET() {
  try {
    // Get all users who have vehicle notifications enabled
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('vehicleNotifications.enabled', '==', true)
    );
    
    const usersSnapshot = await getDocs(q);
    
    const notificationTasks = [];
    
    // For each user, check if there's a vehicle nearby
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Skip users who received a notification in the past hour
      if (
        userData.vehicleNotifications?.lastNotified &&
        Date.now() - userData.vehicleNotifications.lastNotified < 60 * 60 * 1000
      ) {
        continue;
      }
      
      // Check if there's a vehicle nearby with the user's configured radius
      const nearbyResult = await isVehicleNearby(
        userId,
        userData.vehicleNotifications?.radiusInKm || 1
      );
      
      // If a vehicle is nearby, send a notification
      if (nearbyResult.isNearby && nearbyResult.nearestVehicle) {
        notificationTasks.push(
          createVehicleProximityNotification(
            userId,
            nearbyResult.nearestVehicle.id,
            nearbyResult.estimatedArrivalMinutes || 5
          )
        );
        
        // Update the last notified timestamp
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
          'vehicleNotifications.lastNotified': Date.now()
        });
      }
    }
    
    // Wait for all notification tasks to complete
    await Promise.allSettled(notificationTasks);
    
    return NextResponse.json({ 
      success: true, 
      notificationsSent: notificationTasks.length 
    });
  } catch (error) {
    console.error('Error in vehicle proximity check:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
