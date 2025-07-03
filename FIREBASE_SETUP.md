# Firebase Setup Guide for CampusCrew

## ✅ Completed Steps
- [x] Firebase project created: `campuscrew-65d5d`
- [x] Firestore database created (test mode)
- [x] Firebase configuration added to `.env.local`
- [x] Firebase SDK integrated in the application

## 🔧 Required Steps to Complete Setup

### 1. Enable Authentication Methods

Go to [Firebase Console](https://console.firebase.google.com/project/campuscrew-65d5d/authentication/providers)

#### Enable Google Authentication:
1. Click on **Google** provider
2. Click **Enable**
3. Add your email as the project support email
4. Click **Save**

#### Enable Phone Authentication:
1. Click on **Phone** provider
2. Click **Enable**
3. Click **Save**

### 2. Configure Authorized Domains

Go to [Authentication Settings](https://console.firebase.google.com/project/campuscrew-65d5d/authentication/settings)

Add these domains to **Authorized domains**:
- `localhost` (for development)
- `127.0.0.1` (for development)
- Your production domain (when you deploy)

### 3. Test Authentication

Once you've enabled the providers, test the authentication:

#### Test Google Sign In:
1. Go to http://localhost:8081/login
2. Click "Sign in with Google"
3. Complete Google authentication
4. Check Firestore Console for user data

#### Test Phone Authentication:
1. Go to http://localhost:8081/login
2. Enter a phone number (use your real number for testing)
3. Enter the OTP you receive
4. Check Firestore Console for user data

### 4. Verify Database Collections

After testing, check your [Firestore Console](https://console.firebase.google.com/project/campuscrew-65d5d/firestore/data) for:

- **users** collection with user profiles
- Proper data structure:
  ```
  users/
    └── {userId}/
        ├── uid: string
        ├── email: string
        ├── firstName: string
        ├── lastName: string
        ├── college: string
        ├── year: string
        ├── branch: string
        ├── rollNumber: string
        ├── phone: string
        ├── authMethod: 'google' | 'phone'
        ├── createdAt: timestamp
        └── updatedAt: timestamp
  ```

## 🚀 Ready to Use Features

Once setup is complete, your CampusCrew app will have:

### Authentication Features:
- ✅ Google Sign In/Sign Up
- ✅ Phone Number + OTP Authentication
- ✅ User profile management
- ✅ Automatic user data storage in Firestore

### Database Features:
- ✅ User profiles stored in Firestore
- ✅ Real-time data synchronization
- ✅ Secure authentication-based access
- ✅ Ready for gigs, offers, and chat features

## 🔒 Security Notes

- Database is currently in **test mode** (30-day access)
- Before production, you'll need to set up proper security rules
- Test mode allows read/write access for development
- All authentication is handled securely by Firebase

## 📱 Demo Credentials

For testing phone authentication, you can use:
- **Phone**: Any valid phone number (you'll receive real SMS)
- **OTP**: The actual code sent to your phone

For Google authentication:
- Use any Google account
- First-time users will be prompted to complete their college profile

## 🆘 Troubleshooting

If you encounter issues:

1. **Google Sign In not working**: Check that Google provider is enabled
2. **Phone OTP not received**: Verify phone provider is enabled and number format is correct
3. **Database errors**: Ensure Firestore is in test mode
4. **Environment variables**: Restart dev server after changing `.env.local`

## Next Steps

After authentication is working:
1. Test user registration and login flows
2. Verify user data appears in Firestore
3. Ready to implement gigs, offers, and chat features!
