# Google Sign-In Authentication Guide

This guide provides detailed instructions for setting up and troubleshooting Google Sign-In authentication in your YouTube Clone application.

## Prerequisites

1. A Firebase project
2. A Google Cloud Platform project (automatically created with Firebase)
3. Basic understanding of Firebase Authentication

## Step 1: Configure Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Navigate to **Authentication** in the left sidebar
4. Click on the **Sign-in method** tab
5. Enable **Google** as a sign-in provider
   - Click on Google in the list
   - Toggle the "Enable" switch to on
   - Enter your support email
   - Click "Save"

## Step 2: Authorize Domains

1. In the Firebase Console, go to **Authentication**
2. Click on the **Settings** tab
3. Scroll down to the **Authorized domains** section
4. Add the following domains:
   - Your production domain (e.g., `your-app.com`)
   - Your development domain (e.g., `localhost`)
   - Any preview/staging domains (e.g., `your-app.vercel.app`)

> **Note**: Google Sign-In will not work on unauthorized domains. This is a security measure to prevent phishing attacks.

## Step 3: Set Up Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

You can find these values in the Firebase Console:
1. Go to Project Settings (gear icon in the top left)
2. Scroll down to "Your apps" section
3. Select your web app (or create one if needed)
4. Copy the configuration values

## Step 4: Local Development with Firebase Emulator (Optional)

For local development, you can use the Firebase Emulator to avoid domain restrictions:

1. Install the Firebase CLI:
   \`\`\`bash
   npm install -g firebase-tools
   \`\`\`

2. Log in to Firebase:
   \`\`\`bash
   firebase login
   \`\`\`

3. Initialize Firebase in your project:
   \`\`\`bash
   firebase init
   \`\`\`
   - Select "Emulators"
   - Choose "Authentication Emulator"
   - Select default ports or specify your own

4. Add the emulator configuration to your `.env.local`:
   \`\`\`
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
   \`\`\`

5. Start the emulator:
   \`\`\`bash
   firebase emulators:start
   \`\`\`

## Troubleshooting

### "auth/unauthorized-domain" Error

This error occurs when you try to use Google Sign-In on a domain that is not authorized in your Firebase project.

**Solution:**
1. Add the domain to the Authorized domains list in Firebase Authentication settings
2. If using a preview environment (like Vercel previews), consider using email/password authentication instead, or set up the Firebase Emulator

### "auth/configuration-not-found" Error

This error occurs when your Firebase configuration is incorrect or missing.

**Solution:**
1. Verify that all environment variables are correctly set
2. Check that your Firebase project is properly set up
3. Ensure that Google Sign-In is enabled in the Firebase Authentication settings

### "auth/popup-blocked" Error

This error occurs when the browser blocks the Google Sign-In popup.

**Solution:**
1. Ensure that popups are allowed for your domain in the browser settings
2. Try triggering the sign-in from a user interaction (like a button click)

### "auth/cancelled-popup-request" Error

This error occurs when the user closes the Google Sign-In popup before completing the sign-in process.

**Solution:**
This is a normal user behavior. You can handle this error gracefully by showing a message like "Sign-in was cancelled. Please try again."

### "auth/network-request-failed" Error

This error occurs when there's a network issue during the sign-in process.

**Solution:**
1. Check the user's internet connection
2. Verify that your Firebase project is not experiencing outages
3. Try again later

## Security Best Practices

1. **Never hardcode API keys** in your client-side code. Always use environment variables.
2. **Implement proper authentication state management** to prevent unauthorized access.
3. **Use Firebase Security Rules** to protect your data.
4. **Enable MFA** (Multi-Factor Authentication) for sensitive operations.
5. **Regularly audit your authentication logs** in the Firebase Console.
6. **Set up email verification** to ensure users provide valid email addresses.
7. **Implement proper session management** with appropriate token expiration.

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google Sign-In Documentation](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
\`\`\`

Let's also create a component to display the authentication status:
