# Firebase Realtime Database Security Rules

## 🚨 CRITICAL: Set Up Database Rules to Fix Errors

Your app uses **Firebase Realtime Database** (not Firestore). You need to configure the security rules with proper indexes to fix the "Index not defined" error.

## Step-by-Step Instructions

### 1. Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **luo-ancient-movies-com**

### 2. Navigate to Realtime Database Rules
1. Click **Realtime Database** in the left sidebar (NOT Firestore Database)
2. Click the **Rules** tab at the top

### 3. Copy and Paste These Rules

Replace the existing rules with the following (includes indexes for performance):

\`\`\`json
{
  "rules": {
    "movies": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["createdAt"],
      "$movieId": {
        ".validate": "newData.hasChildren(['title', 'description', 'posterUrl', 'videoUrl', 'rating', 'duration', 'genre', 'releaseYear', 'createdAt'])"
      }
    },
    "series": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["createdAt"],
      "$seriesId": {
        ".validate": "newData.hasChildren(['title', 'description', 'posterUrl', 'rating', 'genre', 'releaseYear', 'seasons', 'createdAt'])"
      }
    },
    "episodes": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["createdAt", "seriesId"],
      "$episodeId": {
        ".validate": "newData.hasChildren(['seriesId', 'seasonNumber', 'episodeNumber', 'title', 'description', 'thumbnailUrl', 'videoUrl', 'duration', 'createdAt'])"
      }
    },
    "adverts": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["createdAt"],
      "$advertId": {
        ".validate": "newData.hasChildren(['title', 'description', 'imageUrl', 'linkUrl', 'position', 'createdAt'])"
      }
    },
    "heroImages": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["createdAt"],
      "$heroImageId": {
        ".validate": "newData.hasChildren(['title', 'description', 'imageUrl', 'createdAt'])"
      }
    }
  }
}
\`\`\`

### 4. Click "Publish" Button
- Click the **Publish** button in the top right
- Confirm the changes

### 5. Wait and Test
- Wait 10-30 seconds for changes to propagate
- Refresh your app preview
- Both "Permission denied" and "Index not defined" errors should be gone

## What These Rules Do

✅ **Public Read Access**: Anyone can view movies, series, episodes, adverts, and hero images
✅ **Authenticated Write Access**: Only signed-in users can add/edit content
✅ **Data Validation**: Ensures all required fields are present when writing data
✅ **Performance Indexes**: Optimizes queries by indexing the `createdAt` field

## Why Indexes Are Important

The `.indexOn` property tells Firebase which fields to index for efficient querying. Without indexes:
- Queries using `orderByChild("createdAt")` will fail with "Index not defined" error
- Even if they work, they'll be slow and inefficient
- Firebase requires indexes for any ordered queries

## Security Notes

- These rules allow any authenticated user to write data
- For production, you should add admin-only checks
- Consider adding rate limiting for write operations
- Monitor your Firebase usage to prevent abuse

## More Secure Rules (Optional - For Production)

If you want to restrict writes to admin users only, you'll need to:

1. Store admin status in the database under `users/{userId}/isAdmin`
2. Use these rules instead:

\`\`\`json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "movies": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      ".indexOn": ["createdAt"]
    },
    "series": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      ".indexOn": ["createdAt"]
    },
    "episodes": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      ".indexOn": ["createdAt", "seriesId"]
    },
    "adverts": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      ".indexOn": ["createdAt"]
    },
    "heroImages": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      ".indexOn": ["createdAt"]
    }
  }
}
\`\`\`

## Troubleshooting

### Still Getting "Index not defined" Error?
1. Make sure you clicked "Publish" in the Firebase Console
2. Wait 30 seconds and refresh your app
3. Check that the `.indexOn` properties are included in your rules
4. Verify the rules were saved correctly

### Still Getting "Permission denied"?
1. Make sure you clicked "Publish" in the Firebase Console
2. Wait 30 seconds and refresh your app
3. Check that you're in **Realtime Database** (not Firestore Database)
4. Verify the rules were saved correctly

### "Database not found" Error?
1. Go to Realtime Database in Firebase Console
2. Click "Create Database"
3. Choose your region
4. Start in "Locked mode" (we'll update rules after)
5. Then apply the rules above

### Need Help?
- Check Firebase Console → Realtime Database → Data tab to see if data exists
- Check Firebase Console → Realtime Database → Rules tab to verify rules are correct
- Check browser console for detailed error messages
