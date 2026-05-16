# Food Rescue & Redistribution Platform

A full-stack MERN application that connects food donors (restaurants, supermarkets) with NGOs and shelters to redistribute surplus food efficiently using geolocation.

## Core Features
- **Role-Based Authentication**: Secure login for Donors and NGOs utilizing JWT.
- **Geolocation Matching**: Leaflet-based interactive maps for NGOs to find nearby donations using MongoDB's `$nearSphere` geospatial queries.
- **Dynamic Dashboard**: Dedicated dashboard for donors to post food and NGOs to track accepted donations.
- **Modern UI**: Tailored with Tailwind CSS v4, Framer Motion for animations, and Lucide icons for a premium, accessible feel.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, React-Leaflet, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt.js, Rate Limiting.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL (pre-configured in this repository's `.env`)

### 1. Installation
Clone or navigate to this repository root, then install both backend and frontend dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables
The application uses two sets of environment variables. They have been pre-configured for review purposes.

#### Server (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://<USER>:<PASS>@cluster0.h0og7fr.mongodb.net/FoodRescueDB
JWT_SECRET=your_jwt_secret
```

#### Client (`client/.env`)
The client comes pre-configured via `vite.config.js` and `src/api.js` proxy defaults. If needed, you can declare:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Run Commands (Development Use)

Start the Node.js backend:
```bash
cd server
npm install -g nodemon # If not already installed
npx nodemon server.js
# Runs on http://localhost:5000
```

Start the Vite React frontend (in a new terminal):
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

## Deployment Guide

### Backend Deployment (Render / Heroku)
1. Push the repository to GitHub.
2. Link the repository to your hosting provider (e.g. Render).
3. Set the Root Directory to `server/`.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `node server.js`.
6. Add all the variables from `server/.env` into the Environment Variables settings.

### Frontend Deployment (Vercel / Netlify)
1. Link your repository to Vercel/Netlify.
2. Set the Root Directory to `client/`.
3. Set the Build Command to `npm run build`.
4. Set the Output Directory to `dist`.
5. Ensure `VITE_API_BASE_URL` is set to the deployed backend URL.
6. Click Deploy.

## Notes
- Ensure geolocation permissions are allowed in your browser when creating an account or viewing the Map Directory.
- To simulate an end-to-end transaction, create one user with the `donor` role and another with the `ngo` role.
