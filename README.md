# Mobile Money Tracker

A full-stack web application for tracking daily mobile money earnings and expenses. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- Track daily earnings from MTN and Airtel
- Record bonuses and expenses
- Auto-calculate net profit
- View daily records in a clean table
- Mobile-friendly interface
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm (comes with Node.js)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/mobile-money-tracker
   ```
4. Start the application:
   ```bash
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `POST /api/earnings` - Create a new earnings record
- `GET /api/earnings` - Get all earnings records
- `GET /api/earnings/summary` - Get weekly/monthly summaries

## Project Structure

```
mobile-money-tracker/
├── public/           # Static files (HTML, CSS, client-side JS)
├── src/             # Server-side code
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── server.js    # Express server setup
├── .env             # Environment variables
├── package.json     # Project dependencies
└── README.md        # This file
```

## Technologies Used

- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Backend: Node.js, Express
- Database: MongoDB
- Additional: dotenv for environment variables
