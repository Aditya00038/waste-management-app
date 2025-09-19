# Running the Project Locally

This guide will help you set up and run the Swachh Bharat PWA on your local machine for development purposes.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## 1. Installation

First, install the project dependencies using npm:

```bash
npm install
```

## 2. API Keys and Firebase Configuration

The application uses API keys for its AI features (Gemini) and its backend (Firebase). To enable them, you need to set up your credentials.

### Step 2.1: Gemini API Key (Required for AI Features)

The AI features in this app are powered by Gemini. You need to provide an API key for the server-side Genkit flows to work.

1.  **Create the File**: In the root of your project, create a new file named `.env`.
2.  **Add API Key**: Open `.env` and add your key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```
    # Gemini API Key (for server-side AI)
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

### Step 2.2: Firebase Configuration (Required for Authentication)

**This is the most important step to fix login errors.** You must add your project's Firebase credentials directly into the code.

1.  **Go to Firebase Console**: Open your project in the [Firebase Console](https://console.firebase.google.com/).
2.  **Find Your Config**:
    - Click the gear icon next to "Project Overview" and select **Project settings**.
    - In the "Your apps" card, select your web app.
    - Under "SDK setup and configuration", select the **Config** radio button.
    - You will see a `firebaseConfig` object. **Copy the entire object.**

3.  **Update the Code**:
    - Open the file `src/lib/firebase.ts`.
    - **Replace the entire placeholder `firebaseConfig` object** with the one you copied from the Firebase Console.

    Your `src/lib/firebase.ts` file should look like this, but with your actual values:

    ```typescript
    // ... other imports

    const firebaseConfig = {
      apiKey: "AIzaSy...your_key_here...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef123456"
    };

    // ... rest of the file
    ```

**Important**: After following these steps, your app will be correctly configured to connect to your Firebase project, and the authentication errors will be resolved.

## 3. Running the Development Server

Once the dependencies are installed and your credentials are set, you can start the local development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## Local Development Notes
- **Genkit AI:** The AI flows can be tested and run locally using the Genkit developer UI. To start it, run the following command in a separate terminal:
  ```bash
  npm run genkit:watch
  ```
  This will start the Genkit UI, typically on `http://localhost:4000`.
