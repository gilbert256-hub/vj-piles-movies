# Firebase Setup Instructions

## Current Status
Your Firebase configuration has been integrated with the following credentials:
- Project ID: `luo-ancient-movies-com`
- Auth Domain: `luo-ancient-movies-com.firebaseapp.com`
- Storage Bucket: `luo-ancient-movies-com.firebasestorage.app`

## What's Working
✅ Firebase Authentication (Email/Password & Google Sign-in)
✅ Firestore Database
✅ Firebase Storage
✅ Real-time Database

## 🚨 IMPORTANT: Fix "auth/unauthorized-domain" Error

If you're getting the `auth/unauthorized-domain` error when trying to use Google Sign-in, follow these steps:

### Step 1: Find Your Preview Domain
Look at your browser's address bar when previewing the app. Copy the domain (without `https://`).
- Example: If the URL is `https://abc123.v0.app/signup`, your domain is `abc123.v0.app`

### Step 2: Add Domain to Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **luo-ancient-movies-com**
3. Click **Authentication** in the left sidebar
4. Click the **Settings** tab at the top
5. Scroll down to **Authorized domains**
6. Click **Add domain**
7. Paste your v0 preview domain (e.g., `abc123.v0.app`)
8. Click **Add**

### Step 3: Wait and Test
- Wait 1-2 minutes for changes to propagate
- Refresh your preview page
- Try Google Sign-in again

**Common domains to add:**
- `localhost` (for local development)
- Your v0 preview domain (e.g., `your-project.v0.app`)
- Your production domain (when deploying)

## Firebase Console Setup Required

### 1. Enable Authentication Methods
Go to Firebase Console → Authentication → Sign-in method:
- ✅ Enable **Email/Password** authentication
- ✅ Enable **Google** authentication
  - **IMPORTANT:** After enabling, add authorized domains (see above)

### 2. Realtime Database Rules (REQUIRED - Fix "Permission denied" Error)

**⚠️ IMPORTANT:** This app uses **Firebase Realtime Database**, not Firestore.

Go to Firebase Console → **Realtime Database** → Rules:

\`\`\`json
{
  "rules": {
    "movies": {
      ".read": true,
      ".write": "auth != null"
    },
    "series": {
      ".read": true,
      ".write": "auth != null"
    },
    "episodes": {
      ".read": true,
      ".write": "auth != null"
    },
    "adverts": {
      ".read": true,
      ".write": "auth != null"
    },
    "heroImages": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
\`\`\`

**See `FIREBASE_REALTIME_DATABASE_RULES.md` for detailed instructions and more secure rules.**

### 3. Firestore Database Rules (Optional - Not Currently Used)
Go to Firebase Console → Firestore Database → Rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Movies collection
    match /movies/{movieId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Series collection
    match /series/{seriesId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Episodes collection
    match /episodes/{episodeId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Adverts collection
    match /adverts/{advertId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Hero images collection
    match /heroImages/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
\`\`\`

### 4. Storage Rules
Go to Firebase Console → Storage → Rules:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
\`\`\`

### 5. Set Admin User
The admin email is currently set to: `lightstarrecord@gmail.com`

To change this:
1. Open `lib/auth-context.tsx`
2. Update the `ADMIN_EMAIL` constant

### 6. Firebase Admin SDK (Optional - for server-side operations)
If you need server-side operations:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the values to `.env.local`:
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

## Testing Your Setup

### Test Authentication
1. Go to `/signup` to create a new account
2. Go to `/login` to sign in
3. Try Google Sign-in

### Test Admin Access
1. Sign in with `lightstarrecord@gmail.com`
2. You should see admin options in the sidebar
3. Access `/admin` routes

### Test File Upload
1. Sign in as admin
2. Go to `/admin/upload/movies`
3. Try uploading a movie poster (will upload to Firebase Storage)

## Troubleshooting

### "auth/unauthorized-domain" Error ⚠️
**This is the most common error!**

**Cause:** Your preview domain is not authorized in Firebase Console.

**Solution:**
1. Copy your v0 preview domain from the browser address bar
2. Go to Firebase Console → Authentication → Settings → Authorized domains
3. Click "Add domain" and paste your domain
4. Wait 1-2 minutes and try again

**Example domains to add:**
- `localhost` (always add this)
- `abc123.v0.app` (your v0 preview domain)
- `your-site.vercel.app` (your production domain)

### "auth/invalid-api-key" Error
- ✅ Fixed: Real credentials are now hardcoded with env fallback
- Make sure `.env.local` file exists in project root

### Google Sign-in Not Working
- Add authorized domains in Firebase Console
- Check that Google provider is enabled
- Verify redirect URIs are correct

## Environment Variables
All Firebase config is in `.env.local` file. For production deployment:
1. Add all `NEXT_PUBLIC_*` variables to Vercel
2. Keep them secret and never commit to git
