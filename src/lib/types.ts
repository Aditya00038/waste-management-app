
// Re-export AI types
export * from './ai-types';

export type UserRole = "Admin" | "Citizen" | "Waste Worker" | "Green Champion" | "Bulk Producer";
export type HouseholdType = "Residential" | "Apartment" | "Bulk Waste Generator";

export type ModuleCompletionState = {
  [moduleId: string]: {
      video: boolean;
      content: boolean;
      quiz: boolean;
  }
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  email: string;
  
  // Citizen-specific
  address?: string;
  householdType?: HouseholdType;
  points?: number;
  badges?: string[];
  courseProgress?: number;
  moduleCompletion?: ModuleCompletionState;

  // Waste Worker-specific
  employeeId?: string;
  assignedRoute?: string;
  shift?: 'Day' | 'Night';
  
  // Green Champion-specific
  assignedZone?: string;

  // Bulk Producer-specific
  institutionName?: string;
  fines?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
}

export interface CollectionVehicle {
  id: string;
  driverName: string;
  vehicleNumber: string;
  route: string;
  status: "On Route" | "Idle" | "At Facility" | "Delayed";
}

export interface Facility {
  id: string;
  name: string;
  type: "recycling_center" | "compost_plant" | "landfill" | "hazardous_waste_collection" | "biomethanization_plant" | "waste_to_energy_plant";
  address: string;
  distance: string;
}

export interface EducationArticle {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  aiHint: string;
  readTime: number;
  author: string;
  content: string;
}

export interface TrainingModule {
    id: string;
    title: string;
    duration: number;
    content: string;
    keyTakeaways: string[];
    quiz: {
        question: string;
        options: string[];
        correctAnswer: string;
    }
}

export interface TrainingCourse {
    id: string;
    title: string;
    description: string;
    modules: TrainingModule[];
}

export interface BadgeTier {
    name: string;
    description: string;
    requiredPoints: number;
}

export interface Reward {
  name: string;
  points: number;
  description: string;
}

export interface DonationItem {
  id: string;
  title: string;
  category: 'Clothes' | 'Books' | 'Electronics' | 'Furniture' | 'Other';
  description: string;
  imageUrl: string;
  aiHint: string;
  donatedBy: string;
  location: string;
  createdAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  type: 'Cleanup Drive' | 'Workshop' | 'Plantation' | 'Swachh Camp';
  date: string;
  location: string;
  organizer: string;
  imageUrl: string;
  aiHint: string;
}

export interface LocalReport {
    id: string;
    location: string;
    category: string;
    status: "Pending" | "Verified";
}

export interface UserReport {
    id: string;
    userId: string;
    category: string;
    location: string;
    status: "Pending" | "Collected" | "In Process";
    description: string;
    imageUrl: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    rating: number;
    reviews: number;
    createdAt: string;
}

export interface Order {
    id: string;
    userId: string;
    items: { id: string, name: string, quantity: number, price: number }[];
    total: number;
    createdAt: any; // Firestore timestamp
    status: "Pending" | "Shipped" | "Delivered";
}

export interface BulkProducerReport {
    id: string;
    producerName: string;
    issue: string;
    status: "Pending" | "Flagged";
}
