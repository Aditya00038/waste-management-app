'use server';

import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, GeoPoint } from 'firebase/firestore';
import { getUserById } from './data';

export interface VehicleLocation {
  id: string;
  vehicleId: string;
  driverId: string;
  driverName: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  routeId?: string;
  routeName?: string;
  lastUpdated: number; // timestamp
  estimatedArrival?: {
    locationId: string;
    locationName: string;
    time: number; // timestamp
  };
  vehicleType: 'collection' | 'transport' | 'recycling';
  distanceInKm?: number; // Added field to store distance from user
}

// Get all active vehicles
export async function getActiveVehicles(): Promise<VehicleLocation[]> {
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const vehiclesQuery = query(vehiclesRef, where('status', '==', 'active'));
    const snapshot = await getDocs(vehiclesQuery);
    
    const vehicles: VehicleLocation[] = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const driverData = await getUserById(data.driverId);
      
      vehicles.push({
        id: doc.id,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        driverName: driverData?.name || 'Unknown Driver',
        location: {
          latitude: data.location?.latitude || 0,
          longitude: data.location?.longitude || 0
        },
        status: data.status,
        routeId: data.routeId,
        routeName: data.routeName,
        lastUpdated: data.lastUpdated,
        estimatedArrival: data.estimatedArrival,
        vehicleType: data.vehicleType
      });
    }
    
    return vehicles;
  } catch (error) {
    console.error('Error fetching active vehicles:', error);
    return [];
  }
}

// Get nearest vehicles to a user's location
export async function getNearestVehicles(
  latitude: number, 
  longitude: number, 
  radiusInKm: number = 5,
  vehicleType?: 'collection' | 'transport' | 'recycling'
): Promise<VehicleLocation[]> {
  try {
    // Get all active vehicles
    const vehicles = await getActiveVehicles();
    
    // Filter by vehicle type if provided
    let filteredVehicles = vehicleType 
      ? vehicles.filter(v => v.vehicleType === vehicleType)
      : vehicles;
    
    // Calculate distance for each vehicle
    const vehiclesWithDistance = filteredVehicles.map(vehicle => {
      const distance = calculateDistance(
        latitude,
        longitude,
        vehicle.location.latitude,
        vehicle.location.longitude
      );
      
      return {
        ...vehicle,
        distanceInKm: distance
      };
    });
    
    // Filter vehicles within the radius and sort by distance
    return vehiclesWithDistance
      .filter(v => v.distanceInKm <= radiusInKm)
      .sort((a, b) => a.distanceInKm - b.distanceInKm);
  } catch (error) {
    console.error('Error getting nearest vehicles:', error);
    return [];
  }
}

// Calculate distance between two coordinates using the Haversine formula
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Check if a vehicle is near a specific location
export async function isVehicleNearby(
  userId: string, 
  radiusInKm: number = 1
): Promise<{
  isNearby: boolean;
  nearestVehicle?: VehicleLocation;
  estimatedArrivalMinutes?: number;
}> {
  try {
    // Get user's location from their profile
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { isNearby: false };
    }
    
    const userData = userSnap.data();
    const userLocation = userData.homeLocation || userData.lastLocation;
    
    if (!userLocation) {
      return { isNearby: false };
    }
    
    // Get nearby vehicles
    const nearbyVehicles = await getNearestVehicles(
      userLocation.latitude,
      userLocation.longitude,
      radiusInKm,
      'collection' // Only look for collection vehicles
    );
    
    if (nearbyVehicles.length === 0) {
      return { isNearby: false };
    }
    
    const nearestVehicle = nearbyVehicles[0];
    const distanceInKm = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      nearestVehicle.location.latitude,
      nearestVehicle.location.longitude
    );
    
    // Estimate arrival time (assume average speed of 20 km/h in urban areas)
    const speedKmPerHour = 20;
    const estimatedTimeHours = distanceInKm / speedKmPerHour;
    const estimatedMinutes = Math.round(estimatedTimeHours * 60);
    
    return {
      isNearby: distanceInKm <= radiusInKm,
      nearestVehicle,
      estimatedArrivalMinutes: estimatedMinutes
    };
  } catch (error) {
    console.error('Error checking nearby vehicles:', error);
    return { isNearby: false };
  }
}

// Update vehicle location
export async function updateVehicleLocation(
  vehicleId: string,
  latitude: number,
  longitude: number
): Promise<boolean> {
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    await updateDoc(vehicleRef, {
      location: new GeoPoint(latitude, longitude),
      lastUpdated: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating vehicle location:', error);
    return false;
  }
}

// Subscribe user for vehicle proximity notifications
export async function subscribeToVehicleNotifications(
  userId: string,
  notificationRadius: number = 1 // in km
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      vehicleNotifications: {
        enabled: true,
        radiusInKm: notificationRadius,
        lastNotified: null
      }
    });
    return true;
  } catch (error) {
    console.error('Error subscribing to vehicle notifications:', error);
    return false;
  }
}

// Unsubscribe from notifications
export async function unsubscribeFromVehicleNotifications(
  userId: string
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'vehicleNotifications.enabled': false
    });
    return true;
  } catch (error) {
    console.error('Error unsubscribing from vehicle notifications:', error);
    return false;
  }
}
