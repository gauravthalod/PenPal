// Test Firebase connection
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");
    
    // Test 1: Try to read from a simple collection
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log("✅ Firebase read test passed. Documents found:", snapshot.size);
    
    // Test 2: Try to write to the test collection
    const testDoc = {
      message: "Test connection",
      timestamp: new Date(),
      test: true
    };
    
    const docRef = await addDoc(testCollection, testDoc);
    console.log("✅ Firebase write test passed. Document ID:", docRef.id);
    
    // Test 3: Try to read from gigs collection
    const gigsCollection = collection(db, 'gigs');
    const gigsSnapshot = await getDocs(gigsCollection);
    console.log("✅ Gigs collection read test passed. Documents found:", gigsSnapshot.size);
    
    gigsSnapshot.docs.forEach(doc => {
      console.log("Gig document:", doc.id, doc.data());
    });
    
    return {
      success: true,
      message: "All Firebase tests passed",
      gigsCount: gigsSnapshot.size
    };
    
  } catch (error) {
    console.error("❌ Firebase test failed:", error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};
