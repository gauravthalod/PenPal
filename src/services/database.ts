import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/contexts/AuthContext';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  GIGS: 'gigs',
  OFFERS: 'offers',
  CHATS: 'chats',
  MESSAGES: 'messages'
} as const;

// User operations
export const userService = {
  // Create user profile
  async createUser(userId: string, userData: Partial<UserProfile>) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = {
      ...userData,
      uid: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(userRef, userDoc);
    return userDoc;
  },

  // Get user profile
  async getUser(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  },

  // Update user profile
  async updateUser(userId: string, userData: Partial<UserProfile>) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const updateData = {
      ...userData,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(userRef, updateData);
    return updateData;
  },

  // Get users by college
  async getUsersByCollege(college: string) {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(
      usersRef, 
      where('college', '==', college),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProfile[];
  }
};

// Gig interface
export interface Gig {
  id?: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: Date;
  location: string;
  college: string;
  postedBy: string;
  postedByName: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Gig operations
export const gigService = {
  // Create gig
  async createGig(gigData: Omit<Gig, 'id' | 'createdAt' | 'updatedAt'>) {
    const gigsRef = collection(db, COLLECTIONS.GIGS);
    const gigDoc = {
      ...gigData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = doc(gigsRef);
    await setDoc(docRef, gigDoc);
    return { id: docRef.id, ...gigDoc };
  },

  // Get gigs by college
  async getGigsByCollege(college: string, limitCount = 20) {
    try {
      console.log("Getting gigs for college:", college);
      const gigsRef = collection(db, COLLECTIONS.GIGS);

      let querySnapshot;

      try {
        // Try query with college filter
        const q = query(gigsRef, where('college', '==', college), limit(limitCount));
        console.log("Executing Firestore query with college filter...");
        querySnapshot = await getDocs(q);
        console.log("Query snapshot size:", querySnapshot.size);
      } catch (queryError) {
        console.warn("College-specific query failed, trying without filter:", queryError);
        // Fallback: get all gigs and filter client-side
        const q = query(gigsRef, limit(limitCount * 2)); // Get more to account for filtering
        querySnapshot = await getDocs(q);
        console.log("Fallback query snapshot size:", querySnapshot.size);
      }

      const gigs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Processing gig doc:", doc.id, data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || new Date()
        };
      }) as Gig[];

      // Filter for college and open status client-side, then sort by creation date
      const filteredGigs = gigs
        .filter(gig => gig.college === college && gig.status === 'open')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limitCount);

      console.log("Processed and filtered gigs:", filteredGigs);
      return filteredGigs;
    } catch (error) {
      console.error("Error in getGigsByCollege:", error);
      throw error;
    }
  },

  // Get all gigs (for testing)
  async getAllGigs(limitCount = 20) {
    try {
      console.log("Getting all gigs...");
      const gigsRef = collection(db, COLLECTIONS.GIGS);
      const q = query(gigsRef, limit(limitCount));

      const querySnapshot = await getDocs(q);
      console.log("All gigs query snapshot size:", querySnapshot.size);

      const gigs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || new Date()
        };
      }) as Gig[];

      console.log("All gigs:", gigs);
      return gigs;
    } catch (error) {
      console.error("Error in getAllGigs:", error);
      throw error;
    }
  },

  // Search gigs by college with text search
  async searchGigsByCollege(college: string, searchQuery: string, limitCount = 20) {
    const gigsRef = collection(db, COLLECTIONS.GIGS);
    const q = query(
      gigsRef,
      where('college', '==', college),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const allGigs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      deadline: doc.data().deadline?.toDate() || new Date()
    })) as Gig[];

    // Client-side filtering for text search (Firebase doesn't support full-text search)
    const searchLower = searchQuery.toLowerCase();
    return allGigs.filter(gig =>
      gig.title.toLowerCase().includes(searchLower) ||
      gig.description.toLowerCase().includes(searchLower) ||
      gig.category.toLowerCase().includes(searchLower) ||
      gig.postedByName.toLowerCase().includes(searchLower)
    );
  },

  // Get user's posted gigs
  async getUserGigs(userId: string) {
    const gigsRef = collection(db, COLLECTIONS.GIGS);
    const q = query(
      gigsRef,
      where('postedBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Gig[];
  }
};

// Offer interface
export interface Offer {
  id?: string;
  gigId: string;
  gigTitle: string;
  offeredBy: string;
  offeredByName: string;
  gigPostedBy: string;
  message: string;
  proposedBudget: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Offer operations
export const offerService = {
  // Create offer
  async createOffer(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) {
    const offersRef = collection(db, COLLECTIONS.OFFERS);
    const offerDoc = {
      ...offerData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = doc(offersRef);
    await setDoc(docRef, offerDoc);
    return { id: docRef.id, ...offerDoc };
  },

  // Get offers for a gig
  async getOffersForGig(gigId: string) {
    const offersRef = collection(db, COLLECTIONS.OFFERS);
    const q = query(
      offersRef,
      where('gigId', '==', gigId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Offer[];
  },

  // Get offers received by user (for their gigs)
  async getOffersReceived(userId: string) {
    const offersRef = collection(db, COLLECTIONS.OFFERS);
    const q = query(
      offersRef,
      where('gigPostedBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Offer[];
  },

  // Get offers made by user
  async getOffersMade(userId: string) {
    const offersRef = collection(db, COLLECTIONS.OFFERS);
    const q = query(
      offersRef,
      where('offeredBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Offer[];
  },

  // Update offer status
  async updateOfferStatus(offerId: string, status: Offer['status']) {
    const offerRef = doc(db, COLLECTIONS.OFFERS, offerId);
    await updateDoc(offerRef, {
      status,
      updatedAt: Timestamp.now()
    });

    // Return the updated offer for chat creation
    const updatedOffer = await getDoc(offerRef);
    if (updatedOffer.exists()) {
      return {
        id: updatedOffer.id,
        ...updatedOffer.data(),
        createdAt: updatedOffer.data().createdAt?.toDate() || new Date(),
        updatedAt: updatedOffer.data().updatedAt?.toDate() || new Date()
      } as Offer;
    }
    return null;
  },

  // Get offer by ID
  async getOfferById(offerId: string) {
    try {
      const offerRef = doc(db, COLLECTIONS.OFFERS, offerId);
      const offerDoc = await getDoc(offerRef);

      if (offerDoc.exists()) {
        return {
          id: offerDoc.id,
          ...offerDoc.data(),
          createdAt: offerDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: offerDoc.data().updatedAt?.toDate() || new Date()
        } as Offer;
      }
      return null;
    } catch (error) {
      console.error("Error getting offer by ID:", error);
      throw error;
    }
  }
};

// Initialize database with sample data (for development)
export const initializeDatabase = async () => {
  console.log('Database service initialized');
  // Add any initialization logic here
};
