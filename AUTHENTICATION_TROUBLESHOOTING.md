# Authentication Troubleshooting Guide

## 🚨 **Issue**: "Please login before posting" error with second account

## 🔍 **Debugging Steps**

I've added debugging tools to help identify the exact issue. When you open the app now, you'll see a blue debug box at the top that shows:

### **What the Debug Box Shows:**
- ✅/❌ Firebase User authentication status
- ✅/❌ User Profile loading status  
- Complete profile information (name, email, college, etc.)
- Specific error messages and action buttons

## 🛠 **Common Issues & Solutions**

### **Issue 1: User Profile Not Created**
**Symptoms:** Debug box shows "✅ Authenticated" but "❌ Missing Profile"
**Solution:**
1. Click "Complete Profile" button in debug box
2. Fill out all required fields (especially college)
3. Save the profile
4. Try posting a gig again

### **Issue 2: Incomplete Profile**
**Symptoms:** Debug box shows profile loaded but missing college/name
**Solution:**
1. Click "Complete Profile" button
2. Fill in missing fields (college is required for posting gigs)
3. Save and try again

### **Issue 3: Authentication State Not Persisting**
**Symptoms:** User appears logged out after refresh
**Solution:**
1. Clear browser cache and cookies
2. Log out completely and log back in
3. Complete profile setup again

### **Issue 4: Multiple Browser Sessions**
**Symptoms:** Works in one browser tab but not another
**Solution:**
1. Use incognito/private browsing for second account
2. Or use different browsers (Chrome vs Safari)
3. Or clear all data and start fresh

## 📋 **Step-by-Step Testing Process**

### **Test Account 1:**
1. Open http://localhost:8081/
2. Check debug box - should show authentication status
3. If not authenticated, click "Go to Login"
4. Sign up/login with first account
5. Complete profile with college information
6. Verify debug box shows ✅ for both user and profile
7. Try posting a gig - should work

### **Test Account 2:**
1. Open new incognito window or different browser
2. Go to http://localhost:8081/
3. Check debug box - should show "❌ Not authenticated"
4. Click "Go to Login" 
5. Sign up/login with DIFFERENT account (different email/phone)
6. **IMPORTANT:** Complete profile with SAME college as Account 1
7. Verify debug box shows ✅ for both user and profile
8. Try posting a gig - should work now

## 🔧 **Manual Profile Completion**

If the profile isn't being created automatically:

1. **Go to Profile Page:** Click profile icon or navigate to `/profile`
2. **Fill Required Fields:**
   - First Name
   - Last Name  
   - College (must match other users to see their gigs)
   - Year
   - Branch
   - Roll Number
3. **Save Profile**
4. **Return to Home** and try posting again

## 🧪 **Console Debugging**

Open browser developer tools (F12) and check console for:

### **Expected Logs:**
```
🔄 Auth state changed: User: abc123...
🔍 Loading user profile for: abc123...
✅ User profile loaded: {firstName: "John", college: "CMRIT", ...}
```

### **Error Logs to Look For:**
```
❌ Error loading user profile: [error details]
⚠️ No user profile found for: abc123...
❌ PostGig: No userProfile found
❌ PostGig: Incomplete user profile
```

## 🎯 **Quick Fix Commands**

If you want to remove the debug box after fixing:

1. **Remove from Index.tsx:**
```typescript
// Remove this line:
import AuthDebugger from "@/components/AuthDebugger";

// Remove this line:
<AuthDebugger />
```

2. **Remove debug logs from AuthContext.tsx:**
```typescript
// Remove console.log statements in useEffect
```

## 🔒 **Firebase Security Check**

Ensure Firebase is properly configured:

1. **Check .env.local** - Firebase config should be present
2. **Firebase Console** - Authentication should be enabled
3. **Firestore Rules** - Should allow authenticated users to read/write

## 📱 **Testing Checklist**

- [ ] Debug box shows authentication status correctly
- [ ] First account can login and complete profile  
- [ ] First account can post gigs successfully
- [ ] Second account (different browser/incognito) can login
- [ ] Second account can complete profile with same college
- [ ] Second account can see first account's gigs
- [ ] Second account can post gigs successfully
- [ ] Second account can make offers on first account's gigs

## 🆘 **If Still Not Working**

1. **Clear All Data:**
   - Clear browser cache/cookies
   - Clear localStorage: `localStorage.clear()`
   - Restart browser

2. **Check Firebase Console:**
   - Go to Firebase Console → Authentication
   - Verify both users are listed
   - Go to Firestore → users collection
   - Verify both user profiles exist with complete data

3. **Reset Everything:**
   - Delete users from Firebase Console
   - Clear browser data
   - Start fresh with new accounts

The debug box will help you identify exactly where the authentication is failing! 🔍
