# Cross-User Gig Visibility Debug Guide

## 🚨 **Issue**: Gigs posted by other users not showing up

## 🔍 **Enhanced Debugging Added**

I've added comprehensive logging to help identify exactly why gigs aren't showing up between users. The console will now show detailed information about:

### **What the Console Will Show:**

1. **User Profile Information:**
   ```
   🔍 fetchGigs called, userProfile: {uid: "abc123", college: "CMRIT", ...}
   🔍 Current user ID: abc123
   ```

2. **Gig Fetching Process:**
   ```
   🔍 Fetching gigs for college: CMRIT
   ✅ College-specific fetch successful, found: 2 gigs
   ```

3. **Individual Gig Details:**
   ```
   📋 Gig 1: "Help with React project" by John Doe (user123) - College: CMRIT
   📋 Gig 2: "Design poster" by Jane Smith (user456) - College: CMRIT
   ```

4. **Gig Posting Process:**
   ```
   🚀 Posting gig with data: {title: "New gig", college: "CMRIT", postedBy: "user789", ...}
   ✅ Gig created successfully: {id: "gig123", ...}
   ```

## 🧪 **Step-by-Step Testing Process**

### **Step 1: Test Account 1 (Gig Poster)**
1. **Open browser console** (F12 → Console tab)
2. **Login with first account**
3. **Complete profile** with college (e.g., "CMRIT")
4. **Check console logs** - should show:
   ```
   🔍 fetchGigs called, userProfile: {college: "CMRIT", ...}
   ```
5. **Post a gig:**
   - Fill out gig form
   - Submit
   - **Check console** for posting logs:
     ```
     🚀 Posting gig with data: {...}
     ✅ Gig created successfully: {...}
     ```
6. **Refresh page** and verify gig appears in feed

### **Step 2: Test Account 2 (Gig Viewer)**
1. **Open new incognito window**
2. **Open browser console** (F12 → Console tab)
3. **Login with different account**
4. **Complete profile** with **SAME college** as Account 1
5. **Check console logs** when page loads:
   ```
   🔍 fetchGigs called, userProfile: {college: "CMRIT", ...}
   🔍 Fetching gigs for college: CMRIT
   ✅ College-specific fetch successful, found: X gigs
   📋 Gig 1: "..." by Account1Name (user123) - College: CMRIT
   ```

## 🔍 **What to Look For in Console**

### **✅ Expected Logs (Working):**
```
🔍 fetchGigs called, userProfile: {uid: "user456", college: "CMRIT", firstName: "Jane", lastName: "Smith"}
🔍 Fetching gigs for college: CMRIT
🔍 Current user ID: user456
✅ College-specific fetch successful, found: 2 gigs
📋 Gig 1: "Help with React project" by John Doe (user123) - College: CMRIT
📋 Gig 2: "Design poster" by Jane Smith (user456) - College: CMRIT
🎯 Final fetched gigs: [2 gigs]
✅ Successfully loaded 2 gigs
```

### **❌ Problem Indicators:**

**1. College Mismatch:**
```
🔍 Checking gig: "Help with React" - College: "CMRIT" vs "cmrit" - Status: "open"
⚠️ No gigs found for college: cmrit
```
**Solution:** Ensure both users have EXACT same college name (case-sensitive)

**2. No Gigs in Database:**
```
✅ College-specific fetch successful, found: 0 gigs
⚠️ No gigs found for college: CMRIT
```
**Solution:** Verify gigs were actually saved to Firebase

**3. Permission Issues:**
```
❌ Error fetching gigs: FirebaseError: Missing or insufficient permissions
```
**Solution:** Check Firebase security rules

**4. Profile Issues:**
```
⚠️ No user profile or college found, using mock data
```
**Solution:** Complete user profile with college information

## 🛠 **Common Issues & Solutions**

### **Issue 1: College Name Mismatch**
**Symptoms:** Console shows different college names
**Example:** User 1 has "CMRIT", User 2 has "cmrit"
**Solution:** 
- Both users must use EXACT same college name
- Check profile page and ensure consistency
- Case-sensitive: "CMRIT" ≠ "cmrit"

### **Issue 2: Gigs Not Saved to Database**
**Symptoms:** Posting shows success but no gigs found when fetching
**Solution:**
- Check Firebase Console → Firestore → gigs collection
- Verify gig documents exist with correct data
- Check if status is 'open'

### **Issue 3: Profile Incomplete**
**Symptoms:** Using mock data instead of real gigs
**Solution:**
- Complete profile with all required fields
- Especially ensure college field is filled
- Refresh page after completing profile

### **Issue 4: Authentication Issues**
**Symptoms:** Permission denied errors
**Solution:**
- Ensure both users are logged in
- Check Firebase Authentication in console
- Verify Firebase security rules

## 🔧 **Manual Verification Steps**

### **Check Firebase Console:**
1. **Go to Firebase Console**
2. **Navigate to Firestore Database**
3. **Check 'gigs' collection:**
   - Should contain gig documents
   - Each gig should have: title, college, postedBy, status: 'open'
4. **Check 'users' collection:**
   - Both users should exist
   - Both should have same college value

### **Check Browser Network Tab:**
1. **Open Developer Tools → Network tab**
2. **Refresh page**
3. **Look for Firestore requests**
4. **Check if requests are successful (200 status)**

## 📋 **Testing Checklist**

- [ ] Account 1 can login and complete profile
- [ ] Account 1 can post gig successfully
- [ ] Console shows gig creation logs
- [ ] Account 2 can login with different credentials
- [ ] Account 2 has SAME college as Account 1
- [ ] Console shows gig fetching logs for Account 2
- [ ] Console shows Account 1's gig in the fetched list
- [ ] Account 1's gig appears in Account 2's feed
- [ ] Account 2 can make offers on Account 1's gig

## 🆘 **If Still Not Working**

1. **Share console logs** - Copy the exact console output
2. **Check Firebase Console** - Verify data exists in Firestore
3. **Try different college names** - Use simple names like "CMRIT"
4. **Clear browser data** - Clear cache and try again
5. **Check network connectivity** - Ensure Firebase connection works

## 🧹 **Remove Debug Logs (After Fixing)**

Once the issue is resolved, you can remove the debug logs by:

1. **Remove from Index.tsx:**
   - Remove console.log statements in fetchGigs function
2. **Remove from PostGigDialog.tsx:**
   - Remove console.log statements in handleSubmit function

The enhanced logging will show you exactly where the cross-user visibility is breaking! 🔍
