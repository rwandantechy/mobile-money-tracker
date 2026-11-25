# Mobile Money Tracker

A web application for tracking mobile money transactions and managing finances.

## Features

- User authentication with email verification
- Track mobile money transactions
- View transaction history
- Generate reports and analytics
- Restricted administrator overview with aggregated platform analytics
- Responsive design for mobile and desktop

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- Email Service: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rwandantechy/mobile-money-tracker.git
cd mobile-money-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
PORT=6000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SMTP_EMAIL=your_email
SMTP_PASS=your_email_app_password
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
mobile-money-tracker/
├── api/               # Vercel serverless entry point
├── public/             # Static files
│   ├── css/           # Shared design system and page styles
│   ├── js/            # Client-side scripts, including admin analytics
│   └── images/        # Image assets
├── src/               # Server-side code
│   ├── controllers/   # Request handlers and business logic
│   ├── middleware/    # Authentication and authorization
│   ├── models/        # Database models
│   ├── routes/        # API route modules
│   ├── utils/         # Shared infrastructure helpers
│   ├── views/         # Protected server-rendered pages
│   └── server.js      # Express application and local entry point
├── vercel.json        # Serverless routing and file inclusion
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
