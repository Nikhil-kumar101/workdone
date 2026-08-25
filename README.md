# Video Meeting Platform

A full-stack real-time video meeting platform built with React, Node.js, Express, MongoDB, LiveKit, and Cloudinary.

## Features

- User registration and login
- JWT authentication
- Protected routes
- Meeting creation
- Meeting joining
- Real-time video and audio
- Participant grid
- Camera and microphone controls
- Screen sharing
- Raise hand
- Real-time chat
- File sharing
- Cloudinary file storage
- Host authorization
- Meeting moderation
- Rate limiting
- Room ID validation
- Responsive UI

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- LiveKit Components

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Express Rate Limit

### Services

- LiveKit
- Cloudinary
- MongoDB Atlas

## Project Structure

```text
video-meeting-platform/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── package.json
│   └── .env
│
└── README.md