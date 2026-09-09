# LearnBuddy

An inclusive, accessibility-first educational platform designed for individuals with 
neurodevelopmental conditions — including Autism, ADHD, Dyslexia, Cerebral Palsy, and 
Sensory Processing differences.

## 🌟 What it does

The platform provides a calm, structured, and adaptive learning experience tailored to 
each learner's specific needs. Through a friendly, low-stimulation interface, learners 
complete a lightweight screening process that assigns them to a condition-specific 
learning track and difficulty level — ensuring content is neither overwhelming nor 
under-challenging.

The platform connects three types of users:

- **Learners** — complete an adaptive screening test and progress through structured, 
  condition-specific levels at their own pace.
- **Mentors** — therapists, educators, and specialists (Speech Therapy, Occupational 
  Therapy, Behavioral Intervention, Special Education, Parent Support, Vocational 
  Training) who support learners through their journey.
- **NGOs/Agencies** — registered organizations that partner with the platform to extend 
  support, resources, and services to learners and their families.
## ♿ Why it's different

- **Neurodivergent-first design**: calm color palettes, minimal on-screen text, 
  audio narration, predictable navigation, and reduced motion by default.
- **Adaptive screening, not diagnosis**: a short, non-clinical assessment personalizes 
  each learner's starting point without labeling or overwhelming them.
- **Role-based, locked access**: learners, mentors, and NGOs each see only what's 
  relevant to them — no clutter, no confusion.
- **Progressive learning**: learners unlock higher levels only after mastering their 
  current one, keeping the experience structured and confidence-building.

## 🛠️ Tech Stack

## Frontend
React 19: Core UI library using functional components and hooks.
TypeScript: End-to-end static type safety across components, screening engines, and curriculum data.
Vite 6: Fast development server, HMR, and production bundler.
Tailwind CSS v4: Utility-first styling with accessible color contrast, sensory palettes, and responsive design.
Motion (motion/react): Smooth transitions, calming micro-animations, and reduced-motion fallbacks.
Lucide React: Clean, accessible iconography throughout the application.
Typography: Specialized accessible fonts loaded via Google Fonts:
Lexend: Designed to reduce visual stress and improve reading speed.
Fredoka: Friendly, high-legibility display font for young learners.
## Backend & APIs
Node.js & Express: Lightweight backend server for API routing and static asset delivery.
tsx & esbuild: Fast TypeScript execution in development and single-bundle CommonJS compilation for production (dist/server.cjs).
Google GenAI SDK (@google/genai): Modern TypeScript SDK configured for server-side Gemini API features.
## Authentication & Persistence
Firebase (v12):
Firebase Authentication: User accounts, credential management, and role-based access.
Cloud Firestore: Cloud database storage for profiles, learning progress, and records.
Local Storage Cache: Fallback offline persistence for rapid resume and demo sessions.
