# 🔐 Google OAuth Setup Guide for CampusCrew

This guide will help you set up Google OAuth authentication for your CampusCrew application.

## 📋 **Prerequisites**

- Google Cloud Console account
- CampusCrew application running locally
- Admin access to configure OAuth settings

## 🚀 **Step 1: Create Google Cloud Project**

### **1.1 Go to Google Cloud Console**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **"Create Project"** or select an existing project

### **1.2 Create New Project**
1. **Project Name**: `CampusCrew-OAuth`
2. **Organization**: Select your organization (if applicable)
3. Click **"Create"**

## ⚙️ **Step 2: Enable Google Identity Services**

### **2.1 Enable APIs**
1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Identity Services API"**
3. Click **"Enable"**
4. Also enable **"Google+ API"** (if available)

### **2.2 Configure OAuth Consent Screen**
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type
3. Fill in the required information:
   - **App name**: `CampusCrew`
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - **App domain**: `http://localhost:8080` (for development)
4. Click **"Save and Continue"**

### **2.3 Add Scopes**
1. Click **"Add or Remove Scopes"**
2. Add these scopes:
   - `email`
   - `profile`
   - `openid`
3. Click **"Save and Continue"**

### **2.4 Add Test Users (Development)**
1. Add test email addresses that can access your app during development
2. Include CMR Group email addresses for testing
3. Click **"Save and Continue"**

## 🔑 **Step 3: Create OAuth Credentials**

### **3.1 Create OAuth Client ID**
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**

### **3.2 Configure OAuth Client**
1. **Name**: `CampusCrew Web Client`
2. **Authorized JavaScript origins**:
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   ```
3. **Authorized redirect URIs**:
   ```
   http://localhost:8080/auth/google/callback
   http://127.0.0.1:8080/auth/google/callback
   ```
4. Click **"Create"**

### **3.3 Save Credentials**
1. Copy the **Client ID** and **Client Secret**
2. Keep these secure - you'll need them for configuration

## 🔧 **Step 4: Configure CampusCrew Application**

### **4.1 Update Environment Variables**
Edit your `.env.local` file:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=your-actual-client-secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
```

### **4.2 Replace Placeholder Values**
Replace the placeholder values in `.env.local`:
- `your-actual-client-id.apps.googleusercontent.com` → Your actual Client ID
- `your-actual-client-secret` → Your actual Client Secret

### **4.3 Restart Development Server**
```bash
npm run dev
```

## 🧪 **Step 5: Test Google OAuth**

### **5.1 Test Login Page**
1. Go to `http://localhost:8080/login`
2. You should see the Google Sign-In button
3. Click the button to test authentication

### **5.2 Test SignUp Page**
1. Go to `http://localhost:8080/signup`
2. You should see the Google Sign-Up button
3. Test with a CMR Group email address

### **5.3 Verify Email Validation**
The application validates these CMR Group domains:
- `cmrec.ac.in` - CMR Engineering College
- `cmrit.ac.in` - CMR Institute of Technology
- `cmrtc.ac.in` - CMR Technical Campus
- `cmrcet.ac.in` - CMR College of Engineering & Technology
- `cmr.edu.in` - CMR Group of Institutions

## 🔒 **Step 6: Security Considerations**

### **6.1 Environment Variables**
- Never commit `.env.local` to version control
- Use different credentials for production
- Keep Client Secret secure

### **6.2 Domain Restrictions**
- Only allow CMR Group email domains
- Validate email domains on both client and server
- Implement proper session management

### **6.3 Production Setup**
For production deployment:
1. Create separate OAuth credentials
2. Update authorized origins and redirect URIs
3. Use environment-specific configuration

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **"Google Sign-In button not appearing"**
- Check if `REACT_APP_GOOGLE_CLIENT_ID` is set correctly
- Verify the Google Identity Services script is loading
- Check browser console for errors

#### **"Invalid client ID" error**
- Verify the Client ID in `.env.local` matches Google Cloud Console
- Ensure no extra spaces or characters in the Client ID
- Check that the domain is authorized in Google Cloud Console

#### **"Email domain not allowed" error**
- This is expected for non-CMR email addresses
- Use a CMR Group email for testing
- Check the domain validation logic in `googleAuth.ts`

#### **"OAuth consent screen error"**
- Ensure OAuth consent screen is properly configured
- Add test users during development
- Verify app is not restricted to internal users only

### **Debug Steps:**
1. Check browser console for JavaScript errors
2. Verify network requests in Developer Tools
3. Confirm environment variables are loaded
4. Test with different CMR email addresses

## 📚 **Additional Resources**

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [Google Cloud Console](https://console.cloud.google.com/)

## 🎯 **Next Steps**

After successful setup:
1. Test with multiple CMR email addresses
2. Verify user data is properly stored
3. Test sign-out functionality
4. Prepare for production deployment

---

**🔐 Your CampusCrew application now supports secure Google OAuth authentication for CMR Group students!**
