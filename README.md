# Event Registration and Authentication System

A full-fledged event registration and authentication system with QR code-based check-ins, mobile number verification, and role-based features.

## Features

### User Roles
- **Admin**: Manage events, view statistics, and handle user registrations
- **Authenticator**: Verify attendees via QR code or phone number, register on-spot users
- **Attendee/User**: Register for events, receive QR code, no login required

### Main Components
- Dynamic event page with registration form
- QR code generation and verification
- Admin dashboard with statistics
- Authenticator interface for check-ins
- Mobile-responsive design

## Tech Stack

### Frontend
- React.js
- TailwindCSS
- ShadCN/UI components
- Responsive design

### Backend
- Node.js + Express.js
- MongoDB
- JWT Authentication

## Project Structure

```
├── frontend/         # React frontend application
└── backend/          # Node.js backend API
```

## Getting Started

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```