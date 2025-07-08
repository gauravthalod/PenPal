# Dashboard Troubleshooting Guide

## Error: "Failed to load your dashboard data. Please try again."

This error occurs when the dashboard cannot fetch data from Firebase. Here are the most common causes and solutions:

## 🔍 **Debugging Steps**

### 1. **Check Browser Console**
Open your browser's developer tools (F12) and look at the Console tab for detailed error messages.

### 2. **Use the Test Firebase Button**
Click the "Test Firebase" button in the dashboard to check:
- Firebase connection status
- Collection accessibility
- Document counts in each collection

### 3. **Check Authentication**
Make sure you're logged in with a valid user account.

## 🚨 **Common Issues & Solutions**

### **Issue 1: No Data in Collections**
**Symptoms**: Test shows 0 documents in collections
**Solution**: 
- Post some gigs first from the main page
- Make some offers on existing gigs
- The dashboard will show data once you have activity

### **Issue 2: Permission Denied**
**Symptoms**: Console shows "permission-denied" errors
**Solution**: 
- Check Firebase Security Rules
- Ensure rules allow authenticated users to read their own data
- Update rules if necessary

### **Issue 3: Collection Names Mismatch**
**Symptoms**: Collections not found or empty
**Solution**: 
- Verify collection names in Firebase Console
- Check that collections are named: `users`, `gigs`, `offers`, `chats`, `messages`

### **Issue 4: Timestamp Conversion Errors**
**Symptoms**: Errors about date/timestamp conversion
**Solution**: 
- Check that Firestore documents have proper timestamp fields
- Ensure `createdAt`, `updatedAt`, `deadline` are Firestore Timestamps

## 🔧 **Manual Verification Steps**

### 1. **Check Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `campuscrew-65d5d`
3. Go to Firestore Database
4. Check if these collections exist:
   - `users`
   - `gigs` 
   - `offers`
   - `chats`
   - `messages`

### 2. **Verify User Data**
1. In Firestore, go to `users` collection
2. Find your user document (by UID)
3. Verify it has the required fields

### 3. **Check Gigs Collection**
1. Go to `gigs` collection
2. Verify documents have these fields:
   - `postedBy` (string - user UID)
   - `title`, `description`, `budget`, etc.
   - `createdAt`, `updatedAt`, `deadline` (Timestamps)

### 4. **Check Offers Collection**
1. Go to `offers` collection  
2. Verify documents have these fields:
   - `offeredBy` (string - user UID)
   - `gigPostedBy` (string - user UID)
   - `gigId`, `message`, `proposedBudget`, etc.
   - `createdAt`, `updatedAt` (Timestamps)

## 🛠️ **Quick Fixes**

### **Fix 1: Create Sample Data**
If collections are empty:
1. Go to main page and post a gig
2. Make an offer on someone else's gig
3. Return to dashboard - it should now show data

### **Fix 2: Reset Dashboard**
1. Refresh the page
2. Log out and log back in
3. Clear browser cache if needed

### **Fix 3: Check Network**
1. Ensure stable internet connection
2. Check if Firebase is accessible
3. Try accessing Firebase Console directly

## 📊 **Expected Dashboard Behavior**

### **For New Users (No Activity)**
- Should show 0 for all statistics
- Should show empty states with helpful messages
- Should encourage posting gigs and making offers

### **For Active Users**
- Should show real statistics based on activity
- Should display actual gigs posted
- Should show offers made and received

## 🔍 **Debug Information to Collect**

When reporting issues, please provide:

1. **Browser Console Logs**
   - Any error messages
   - Firebase connection status
   - Test Firebase button results

2. **User Information**
   - User UID from console logs
   - Authentication method used
   - User profile completeness

3. **Firebase Data**
   - Number of documents in each collection
   - Sample document structure
   - Any permission errors

4. **Environment**
   - Browser type and version
   - Network connection status
   - Any ad blockers or extensions

## 🎯 **Next Steps**

1. **Click "Test Firebase"** button to get detailed diagnostics
2. **Check browser console** for specific error messages
3. **Verify Firebase Console** has the expected collections and data
4. **Try posting a gig** if collections are empty
5. **Contact support** with debug information if issues persist

## 🚀 **Success Indicators**

Dashboard is working correctly when:
- ✅ Test Firebase shows accessible collections
- ✅ Statistics reflect actual user activity  
- ✅ Tabs show real gigs and offers
- ✅ No error messages in console
- ✅ Loading states work properly
