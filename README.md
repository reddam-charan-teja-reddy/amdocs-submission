# PathLearn

## Description

PathLearn is an intelligent learning path management application that helps users create and follow personalized learning roadmaps. It uses AI to generate customized learning paths based on users' goals, skills, interests, and educational background. The application breaks down complex learning objectives into achievable milestones, providing curated resources, courses, and activities for each step of the journey.

## Key Features

-  🎯 AI-powered personalized learning roadmaps
-  🗺️ Interactive milestone tracking and progress visualization
-  📚 Curated learning resources and materials
-  🔄 Real-time progress tracking
-  🤝 Google authentication
-  💡 Customizable learning paths
-  🎓 Educational resource recommendations
-  ✨ Modern, responsive UI

## Technologies Used

### Frontend

-  Next.js (React framework)
-  TypeScript
-  Redux (State management)
-  NextUI (UI components)
-  Framer Motion (Animations)
-  CSS Modules (Styling)
-  React Icons
-  React Hot Toast (Notifications)

### Backend

-  Next.js API Routes
-  MongoDB (Database)
-  Google Cloud AI (for roadmap generation)

### Authentication

-  Google Authentication

## Setup Instructions

### Prerequisites

-  Node.js (v18 or higher)
-  npm or yarn
-  MongoDB database
-  Google Cloud account with Generative AI API enabled
-  Google OAuth credentials

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd pathlearn
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Configure environment variables
   Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Google Cloud
GOOGLE_API_KEY=your_gemini_api_key
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Application Workflow

1. **User Authentication**

   -  Users sign in using their Google account
   -  User profile and preferences are stored in the database

2. **Creating Learning Paths**

   -  Users input their learning goals
   -  AI generates personalized roadmaps based on user input
   -  Roadmaps are broken down into milestones with specific outcomes

3. **Learning Journey**

   -  Users follow their personalized roadmap
   -  Track progress through interactive milestone completion
   -  Access curated resources for each milestone
   -  Provide feedback and get roadmap adjustments

4. **Progress Tracking**
   -  Visual progress indicators
   -  Milestone completion tracking
   -  Learning history and achievements

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   └── ...             # Page routes
├── components/         # React components
├── hooks/             # Custom hooks
├── models/            # Database models
├── store/             # Redux store
├── styles/            # CSS modules
└── utils/             # Utility functions
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

### License Terms Overview:

-  ✅ Permissions:

   -  Modification and distribution allowed
   -  Private use
   -  Patent use

-  ⚠️ Conditions:

   -  Source code must be made available when the software is distributed
   -  A copy of the license and copyright notice must be included with the software
   -  Modifications must be released under the same license
   -  Changes made to the code must be documented
   -  Network use is considered distribution

-  ❌ Limitations:
   -  Commercial use without explicit permission is prohibited
   -  No liability
   -  No warranty

This license ensures that PathLearn remains open source and freely available for educational and non-commercial purposes while preventing unauthorized commercial exploitation.
