# YouTube Clone Authentication Setup

This guide will help you set up Firebase Authentication for the YouTube Clone application.

## Prerequisites

1. A Firebase account (create one at [firebase.google.com](https://firebase.google.com))
2. Node.js and npm installed on your machine

## Setup Steps

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Give your project a name (e.g., "YouTube Clone")
4. Enable Google Analytics if desired (optional)
5. Click "Create project"

### 2. Register Your Web App

1. In the Firebase Console, click on the web icon (</>) to add a web app
2. Give your app a nickname (e.g., "YouTube Clone Web")
3. Check "Also set up Firebase Hosting" if you plan to deploy your app (optional)
4. Click "Register app"
5. Copy the Firebase configuration object (we'll need this later)

### 3. Enable Authentication Methods

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click on the "Sign-in method" tab
3. Enable the following authentication methods:
   - Email/Password
   - Google
4. For Google authentication, follow the setup instructions provided

### 4. Configure Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
\`\`\`

Replace the placeholder values with the actual values from your Firebase configuration object.

### 5. Install Firebase Dependencies

Run the following command to install the required Firebase packages:

\`\`\`bash
npm install firebase
\`\`\`

## Usage

The authentication system is now set up and ready to use. The application includes:

1. A login/signup page at `/auth`
2. Protected routes that require authentication
3. User profile information displayed in the sidebar
4. Sign-in/sign-out functionality

## Customization

You can customize the authentication UI by modifying the following files:

- `app/auth/page.tsx`: Main authentication page
- `components/app-sidebar.tsx`: Sidebar with user information

## Troubleshooting

If you encounter any issues:

1. Make sure your environment variables are correctly set
2. Check that you've enabled the correct authentication methods in Firebase
3. Look for any errors in the browser console
4. Ensure you're using the correct Firebase project

For more help, refer to the [Firebase Authentication documentation](https://firebase.google.com/docs/auth).
\`\`\`

Now the YouTube clone has a complete authentication system with Firebase integration, featuring:

1. A modern, responsive login/signup interface
2. Email/password and Google authentication
3. Protected routes that require authentication
4. User profile information displayed in the sidebar
5. Success/error messages for form submissions
6. YouTube-inspired styling with the red, white, and black color scheme
7. Mobile-friendly design
8. Clear documentation for setup and customization
