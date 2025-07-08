// Test admin functionality
import { adminService } from '@/services/database';

export const testAdminFunctionality = async () => {
  try {
    console.log("🔧 Testing Admin Service...");
    
    // Test 1: Fetch all users
    console.log("📋 Test 1: Fetching all users...");
    const users = await adminService.getAllUsers();
    console.log(`✅ Found ${users.length} users`);
    
    // Test 2: Fetch all gigs
    console.log("📋 Test 2: Fetching all gigs...");
    const gigs = await adminService.getAllGigs();
    console.log(`✅ Found ${gigs.length} gigs`);
    
    // Test 3: Get user stats for first user (if exists)
    if (users.length > 0) {
      console.log("📋 Test 3: Getting user stats...");
      const stats = await adminService.getUserStats(users[0].id);
      console.log(`✅ User stats:`, stats);
    }
    
    console.log("🎉 All admin tests passed!");
    return {
      success: true,
      usersCount: users.length,
      gigsCount: gigs.length
    };
  } catch (error) {
    console.error("❌ Admin test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test Firebase connection specifically for admin
export const testAdminFirebaseConnection = async () => {
  try {
    console.log("🔥 Testing Firebase connection for admin...");
    
    // Try to read from users collection
    const users = await adminService.getAllUsers();
    console.log(`✅ Firebase connection successful. Found ${users.length} users.`);
    
    return true;
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    return false;
  }
};
