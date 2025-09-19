# Swachh Bharat PWA

This project is a comprehensive Progressive Web App (PWA) designed to facilitate a nationwide waste management movement in India. It empowers citizens to report waste, educates them on proper disposal, and provides tools for waste workers and administrators to manage the entire lifecycle of waste collection and processing.

## Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit (Google's Generative AI Toolkit)](https://firebase.google.com/docs/genkit)
- **State Management**: React Hooks & Context API

---

## Folder Structure

This project follows a feature-driven structure within the Next.js App Router paradigm.

### `public/`

This directory is not present but would contain static assets that are served directly, such as images, fonts, or `favicon.ico`.

### `src/`

This is the main source code directory for the application.

#### `src/app/`

This directory is the heart of the Next.js application, using the App Router.

- **`globals.css`**: Contains the global styles and Tailwind CSS directives, including the color palette and theme variables for ShadCN.
- **`layout.tsx`**: The root layout for the entire application. It sets up the HTML structure, fonts, and global providers.
- **`page.tsx`**: The main landing and login page for the application.
- **`(main)/`**: This is a route group for all authenticated pages. It shares the `(main)/layout.tsx`.
  - **`layout.tsx`**: The main layout for the authenticated app experience. It includes the `Sidebar` and `Header` and protects routes from unauthenticated access.
  - **`dashboard/page.tsx`**: The main dashboard page, which dynamically renders the correct dashboard based on the user's role.
  - **`course/page.tsx`**: The mandatory training course for all users.
  - **`education/page.tsx`**: A page with articles and resources on waste management.
  - **`facilities/page.tsx`**: A directory to find nearby waste management facilities.
  - **`impact/page.tsx`**: The user's personal impact dashboard, showing points, badges, and rewards.
  - **`leaderboard/page.tsx`**: Displays the leaderboard of top-contributing users.
  - **`report/page.tsx`**: The form for citizens to report unattended waste, featuring AI image classification.
  - **`training/page.tsx`**: The AI-powered training assistant for waste workers and admins.

#### `src/ai/`

This directory contains all the code related to Generative AI features using Genkit.

- **`genkit.ts`**: Initializes and configures the global Genkit `ai` object, setting the default model.
- **`dev.ts`**: The entry point for the local Genkit development server, which imports all the defined flows.
- **`flows/`**: Contains all the server-side AI logic wrapped in Genkit flows.
  - **`waste-image-classification.ts`**: Classifies an uploaded image of waste into 'wet', 'dry', or 'hazardous'.
  - **`training-chatbot-assistance.ts`**: Powers the AI chatbot for training purposes.
  - **`hotspot-prediction.ts`**: Predicts potential waste hotspots based on data.

#### `src/components/`

This directory holds all the reusable React components.

- **`dashboard/`**: Components used specifically on the various dashboards (e.g., `admin-dashboard.tsx`, `waste-chart.tsx`).
- **`education/`**, **`facilities/`**, **`impact/`**, **`leaderboard/`**, **`report/`**, **`training/`**: Components specific to their respective pages.
- **`layout/`**: Components that form the main application layout, like `header.tsx`, `sidebar.tsx`, and `user-nav.tsx`.
- **`ui/`**: The auto-generated ShadCN/UI components (e.g., `button.tsx`, `card.tsx`). These should generally not be modified directly.
- **`icons.tsx`**: Custom SVG icons.
- **`providers.tsx`**: Wraps the application in necessary React Context providers, like `AuthProvider`.

#### `src/hooks/`

Contains custom React hooks for shared logic.

- **`use-auth.tsx`**: Manages user authentication state, including login, logout, and role switching.
- **`use-toast.ts`**: A hook for displaying toast notifications.
- **`use-mobile.tsx`**: A hook to detect if the user is on a mobile device.

#### `src/lib/`

A library for shared utilities, data, types, and server-side logic.

- **`actions.ts`**: Contains all the Next.js Server Actions, which are server-side functions that can be called directly from client components. This is the primary way the client communicates with the Genkit AI flows.
- **`data.ts`**: Holds all the mock data for the application, such as users, leaderboard entries, and articles. This simulates a database for development.
- **`types.ts`**: Defines all the core TypeScript types and interfaces used throughout the project (e.g., `User`, `Facility`).
- **`utils.ts`**: Utility functions, most notably the `cn` function for merging Tailwind CSS classes.

---

## Configuration Files

- **`.env`**: Stores environment variables, such as API keys. **This file should not be committed to version control.**
- **`next.config.ts`**: The configuration file for Next.js.
- **`tailwind.config.ts`**: The configuration file for Tailwind CSS.
- **`tsconfig.json`**: The TypeScript compiler configuration file.
- **`components.json`**: The configuration file for ShadCN/UI.
- **`package.json`**: Lists the project dependencies and scripts.
- **`local.md`**: Instructions for setting up and running the project locally.
- **`.gitignore`**: Specifies which files and folders should be ignored by Git.
