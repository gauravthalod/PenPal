# Admin Panel Guide - CampusCrew

## Overview
The admin panel now fetches real data from Firebase and supports comprehensive user and gig management with cascading deletes.

## Features Implemented

### 🔥 Firebase Integration
- **Real Data Fetching**: Admin panel now fetches actual user and gig data from Firebase
- **Live Statistics**: Real-time counts of users, gigs, and activity
- **Automatic Refresh**: Data can be refreshed manually or loads automatically

### 👥 User Management
- **View All Users**: See all registered users with complete profile information
- **User Details**: Display name, email, college, branch, year, phone, auth method
- **User Statistics**: Show gig count and offer count for each user
- **Search & Filter**: Search users by name, email, or college
- **Delete Users**: Permanently delete user profiles with cascading deletes

### 📋 Gigs Management
- **View All Gigs**: See all posted gigs across the platform
- **Gig Details**: Title, description, budget, category, status, deadlines
- **Posted By Info**: See who posted each gig and their college
- **Search Gigs**: Search by title, description, category, or poster name
- **Delete Gigs**: Remove individual gigs with cascading deletes

### 🗑️ Cascading Deletes
When you delete a user profile, the system automatically removes:
- ✅ All gigs posted by that user
- ✅ All offers made by that user
- ✅ All chats involving that user
- ✅ All messages in those chats
- ✅ The user profile itself

When you delete a gig, the system automatically removes:
- ✅ All offers made for that gig
- ✅ All chats related to that gig
- ✅ All messages in those chats
- ✅ The gig itself

## How to Access

### 1. Admin Login
- Navigate to `/admin/login`
- Use credentials:
  - **Username**: `admin_cmr_2024`
  - **Password**: `CMR@Admin#2024$Secure!`

### 2. Admin Dashboard
- Navigate to `/admin/dashboard` (after login)
- Three main tabs:
  - **User Management**: Manage all users
  - **Gigs Management**: Manage all gigs
  - **Reports & Moderation**: (Future feature)

## Admin Service Functions

### Core Functions
```typescript
// Get all users with enhanced stats
adminService.getAllUsers()

// Get all gigs
adminService.getAllGigs()

// Delete user and all associated data
adminService.deleteUser(userId)

// Delete gig and all associated data
adminService.deleteGig(gigId)

// Get user statistics
adminService.getUserStats(userId)
```

### Safety Features
- **Confirmation Dialogs**: All delete operations require confirmation
- **Batch Operations**: Uses Firebase batch writes for data consistency
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Visual feedback during operations

## Testing

### Test Admin Functionality
- Click "Test Admin" button in the admin dashboard
- Verifies Firebase connection and data fetching
- Shows counts of users and gigs found

### Manual Testing
1. **Create Test Data**: Post some gigs and create user accounts
2. **View in Admin**: Check that data appears in admin panel
3. **Test Search**: Use search functionality to find specific users/gigs
4. **Test Delete**: Try deleting a user and verify all their gigs are removed
5. **Test Refresh**: Use refresh button to reload data

## Security Notes

### Access Control
- Admin panel requires specific credentials
- Session-based authentication
- Lockout after failed attempts

### Data Safety
- All delete operations are irreversible
- Confirmation required for destructive actions
- Batch operations ensure data consistency

## Troubleshooting

### Common Issues
1. **No Data Showing**: Check Firebase connection and permissions
2. **Delete Fails**: Verify user has proper admin permissions
3. **Loading Forever**: Check network connection and Firebase config

### Debug Tools
- Use "Test Admin" button to verify functionality
- Check browser console for detailed error messages
- Verify Firebase rules allow admin operations

## Future Enhancements
- User suspension/banning functionality
- Bulk operations (delete multiple users/gigs)
- Advanced filtering and sorting
- Export data functionality
- Real reporting system
- Activity logs and audit trails
