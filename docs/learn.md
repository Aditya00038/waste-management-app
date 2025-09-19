# Swachh Bharat PWA: A Deep Dive

This document provides a comprehensive overview of the Swachh Bharat PWA, a feature-rich application designed to create a complete digital ecosystem for waste management in India.

## 1. Vision & Core Principles

The project's vision is to implement a strict, digitally-monitored system to address India's waste management challenges from the ground up. The core principles are:

1.  **Mandatory Training:** Educating every citizen and waste worker on proper waste segregation and management.
2.  **Decentralized Monitoring:** Empowering local "Green Champions" to monitor and verify waste management activities in their areas.
3.  **Incentives & Gamification:** Encouraging consistent participation through points, rewards, and daily challenges.
4.  **Community Participation:** Providing digital tools for citizens to report issues and organize community-driven events.
5.  **Penalization:** Establishing a system to hold bulk waste generators accountable for non-compliance.
6.  **Technology as an Enabler:** Using AI, real-time data, and a mobile-first PWA to make the entire system efficient and transparent.

---

## 2. Key Features Implemented

The application is built around a set of powerful, interconnected features that bring the core principles to life.

### Role-Based Access Control & Features Per Role
The app supports five distinct user roles, each with a unique dashboard and set of permissions. This section details what each role can see and do.

#### **Citizen**
The primary user of the application, focused on participation and education.
- **Dashboard:**
  - View personal stats (points, rank, badges).
  - Engage with a gamified "Daily Streak" challenge to earn bonus points.
  - See real-time status updates on their recently submitted waste reports.
  - View a mini-leaderboard.
- **Report Waste:** Upload an image of uncollected waste, which is automatically classified by AI (Wet, Dry, Hazardous) and submitted to authorities.
- **My Impact:** Track total points, badges earned, and progress toward the next achievement tier. Redeem points for rewards in the marketplace.
- **Community Hub:** View and join local events like cleanup drives and workshops.
- **Shop:** Purchase subsidized waste management items like dustbins and compost kits.
- **Wall of Worth:** Donate or request used items, with AI assistance for creating listings.
- **Leaderboard:** View the full leaderboard of top-contributing users.
- **Training Course:** Complete a mandatory introductory course on waste management.

#### **Green Champion**
A community leader with all Citizen privileges, plus monitoring responsibilities.
- **Enhanced Dashboard:**
  - **Community Actions:** View and verify waste reports submitted by citizens in their assigned zone.
  - **Bulk Producer Compliance:** Monitor and flag non-compliance issues from bulk waste generators (e.g., hotels, businesses) for admin review.
- **Community Hub:** In addition to joining events, Green Champions can *create and schedule* new events like Cleanup Drives, Workshops, and Swachh Camps.

#### **Waste Worker**
Focused on operational efficiency and on-the-ground tasks.
- **Specialized Dashboard:**
  - **Route Map:** View an optimized collection route for the day.
  - **Route Progress:** See a checklist of stops and update their status (Pending, Collected).
  - **Vehicle Details:** View vehicle number and status.
  - **Safety Check:** A mandatory daily check-in to confirm they have the required safety gear.
- **AI Training Assistant:** Access a specialized chatbot for instant answers to questions about safety and handling procedures.
- **Specialized Training Course:** A more advanced, phase-wise training program covering professional protocols, safety, and vehicle operations.

#### **Admin**
Has a high-level, system-wide overview with powerful management tools.
- **Comprehensive Dashboard:**
  - **Analytics:** View key metrics like total reports, compliance rates, user activity charts, and waste category distribution.
  - **Vehicle Tracking:** See a live status of all collection vehicles.
  - **Hotspot Map:** View a map of areas with a high density of waste reports.
  - **AI-Predicted Hotspots:** Proactively view areas that AI predicts will become future waste hotspots, and dispatch teams accordingly.
  - **Kit Distribution:** Monitor the real-time progress of dustbin and compost kit distribution.
- **User Management:** View a table of all users, with the ability to promote or change user roles.
- **Shop Management:** Add new products to the e-commerce store.

#### **Bulk Producer**
A commercial or institutional entity focused on compliance.
- **Compliance Dashboard:**
  - **Compliance Status:** View their current status (e.g., "Certified Compliant" or "Action Required").
  - **Outstanding Fines:** See a clear summary of any fines imposed for non-compliance.
  - **Compliance Reports:** Review detailed reports of non-compliance filed by Green Champions and upload evidence of corrective action.
  - **Best Practices:** Access a guide on how to maintain compliance.


### Mandatory Training Course
- **Enforced Learning:** Citizens must complete a mandatory training course before they can access core features like reporting waste or earning rewards.
- **Role-Specific Content:** The training course content is dynamically adapted based on the user's role. Waste Workers receive a more advanced, phase-wise training program covering safety and operational procedures.
- **Interactive Modules:** The course includes video simulations, reading materials, and interactive quizzes to ensure comprehension.

### AI-Powered Systems
The application leverages Google's Genkit for several AI features:
- **Waste Reporting:** When a citizen uploads an image of uncollected waste, an AI model automatically classifies it into **Wet, Dry, or Hazardous**, providing authorities with immediate, actionable data.
- **Donation Classification:** On the "Wall of Worth," users can upload an image of an item they wish to donate. The AI analyzes the image and suggests a **category and title**, streamlining the donation process.
- **Hotspot Prediction:** The Admin dashboard features an AI model that analyzes reporting data to **predict future waste hotspots**, allowing for proactive resource allocation.
- **AI Training Assistant:** Waste Workers and Admins have access to an AI chatbot for instant answers to questions about waste management procedures.

### Community Hub & Gamification
- **Event Management:** The "Community Hub" allows Admins and Green Champions to schedule physical events like **Cleanup Drives, Workshops, and Swachh Camps**. Citizens can then register and participate.
- **Daily Streaks & Challenges:** To encourage daily engagement, the Citizen dashboard includes a gamified "streak" feature (inspired by Duolingo) that rewards users for logging daily tasks like waste segregation.
- **Points & Rewards:** Users earn points for activities like reporting waste and completing training. These points can be redeemed for rewards in the "My Impact" section.

### E-Commerce & Donations
- **Swachh Store:** A fully functional e-commerce section where users can purchase subsidized waste management utilities like color-coded dustbins and compost kits. It includes a shopping cart and a secure checkout process.
- **Wall of Worth:** A digital platform for the circular economy, allowing users to donate and request usable second-hand items like books, clothes, and furniture.

---

## 3. Technology Stack & Architecture

The application is a modern Progressive Web App (PWA) built with a robust, scalable tech stack.

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [ShadCN/UI](https://ui.shadcn.com/) for components.
- **AI Integration:** [Genkit (Google's Generative AI Toolkit)](https://firebase.google.com/docs/genkit).
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore for real-time data, and Storage for images).
- **State Management:** React Hooks & Context API, with real-time listeners (`onSnapshot`) for dynamic updates.

### Folder Structure Overview

- **`src/app/`**: The core of the Next.js application, containing all pages and layouts.
  - **`(main)/`**: A route group for all authenticated pages, protected by a layout that enforces login and mandatory training completion.
  - **`page.tsx`**: The main landing and authentication page.
- **`src/ai/`**: Contains all server-side AI logic using Genkit.
  - **`flows/`**: Each file defines a specific AI capability (e.g., `waste-image-classification.ts`).
- **`src/components/`**: Reusable React components, organized by feature (e.g., `dashboard`, `report`, `shop`).
- **`src/hooks/`**: Custom React hooks for managing global state like authentication (`use-auth`), language (`use-language`), and the shopping cart (`use-cart`).
- **`src/lib/`**: Contains shared business logic, data-fetching functions, type definitions, and Firebase configuration.
  - **`actions.ts`**: Next.js Server Actions that securely connect client components to server-side AI flows and database operations.
  - **`data.ts`**: Functions for fetching and creating data in Firestore.
  - **`firebase.ts`**: Initializes the connection to Firebase services using environment variables.
- **`src/locales/`**: JSON files for internationalization (i18n), providing support for English, Hindi, and Marathi.
