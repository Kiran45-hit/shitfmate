# ShiftMate — Student & Labour Gig Platform

A full-stack gig economy platform connecting students and workers 
with flexible shift-based job opportunities.

## Tech Stack
- Backend: Java, Spring Boot 3.5, Spring Security, JWT
- Frontend: React.js, Vite, Tailwind CSS
- Database: PostgreSQL
- Payment: Razorpay
- Email: Gmail SMTP

## Setup Instructions

### Prerequisites
- JDK 17+
- Node.js 18+
- PostgreSQL
- Maven

### Backend Setup
1. Clone the repository
2. Create PostgreSQL database:
   psql -U postgres
   CREATE DATABASE shiftmate;
3. Copy the example properties file:
   cp src/main/resources/application.properties.example 
      src/main/resources/application.properties
4. Fill in your credentials in application.properties
5. Run the backend:
   cd backend
   mvn spring-boot:run

### Frontend Setup
1. Install dependencies:
   cd frontend
   npm install
2. Run the frontend:
   npm run dev
3. Open http://localhost:5173

### Environment Variables Needed
- PostgreSQL password
- Razorpay API keys (get from razorpay.com)
- Gmail App Password (for email notifications)

### Default Admin Account
After running, create admin:
curl -X POST http://localhost:8081/api/users/register \
-H "Content-Type: application/json" \
-d '{"name":"Admin","email":"admin@shiftmate.com",
     "password":"admin123","phone":"9000000000","role":"ADMIN"}'

## Features
- JWT Authentication with role-based access
- Job posting and application system
- Razorpay payment with escrow
- Real-time notifications
- Email alerts
- Scam Shield protection
- Admin panel
