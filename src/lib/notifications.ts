'use server';

import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, deleteDoc, addDoc } from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'vehicle' | 'waste' | 'system' | 'achievement' | 'reward';
  timestamp: number;
  read: boolean;
  data?: any; // Additional data specific to the notification type
  expiresAt?: number; // Optional expiration timestamp
}

// Create a new notification for a user
export async function createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<string | null> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const newNotification: Omit<Notification, 'id'> = {
      ...notification,
      timestamp: Date.now(),
      read: false
    };
    
    const docRef = await addDoc(notificationsRef, newNotification);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Create a vehicle proximity notification
export async function createVehicleProximityNotification(
  userId: string, 
  vehicleId: string,
  estimatedMinutes: number
): Promise<string | null> {
  try {
    // Get vehicle details
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    const vehicleSnap = await getDoc(vehicleRef);
    
    if (!vehicleSnap.exists()) {
      throw new Error(`Vehicle with ID ${vehicleId} not found`);
    }
    
    const vehicleData = vehicleSnap.data();
    const vehicleType = vehicleData.vehicleType || 'collection';
    
    let title: string;
    let message: string;
    
    // Different message based on vehicle type
    switch(vehicleType) {
      case 'collection':
        title = 'Waste Collection Vehicle Nearby';
        message = `A waste collection vehicle is about ${estimatedMinutes} minutes away from your location. Please keep your waste ready for collection.`;
        break;
      case 'recycling':
        title = 'Recycling Vehicle Approaching';
        message = `A recycling vehicle is about ${estimatedMinutes} minutes away. Please sort your recyclables for collection.`;
        break;
      default:
        title = 'Waste Management Vehicle Nearby';
        message = `A waste management vehicle is about ${estimatedMinutes} minutes away from your location.`;
    }
    
    return createNotification({
      userId,
      title,
      message,
      type: 'vehicle',
      data: {
        vehicleId,
        vehicleType,
        estimatedMinutes,
        vehicleLocation: vehicleData.location
      }
    });
  } catch (error) {
    console.error('Error creating vehicle proximity notification:', error);
    return null;
  }
}

// Get unread notifications count
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
}

// Get user notifications
export async function getUserNotifications(
  userId: string, 
  limit: number = 20,
  includeRead: boolean = true
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, 'notifications');
    let q;
    
    if (includeRead) {
      q = query(
        notificationsRef,
        where('userId', '==', userId)
      );
    } else {
      q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );
    }
    
    const snapshot = await getDocs(q);
    
    const notifications: Notification[] = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as Notification);
    });
    
    // Sort by timestamp (newest first) and limit
    return notifications
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}
