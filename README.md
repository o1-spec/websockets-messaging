# Real-Time Messaging Platform

A full-stack real-time messaging application built with Next.js, Express, MongoDB, and Socket.IO.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using WebSocket (Socket.IO)
- **User Authentication**: Secure JWT-based authentication
- **Online Status**: See who's online in real-time
- **Typing Indicators**: Know when someone is typing
- **Notifications**: Real-time push notifications
- **User Search**: Find and connect with other users
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean and intuitive interface with Tailwind CSS

## 📁 Project Structure

```
websocket-messaging/
├── messaging-backend/      # Express.js backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── socket/        # Socket.IO handlers
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── server.ts      # Main server file
│   └── package.json
│
└── messaging-frontend/     # Next.js frontend
    ├── src/
    │   ├── app/           # Next.js app router pages
    │   ├── components/    # React components
    │   ├── context/       # React context providers
    │   ├── hooks/         # Custom React hooks
    │   ├── lib/           # Utility libraries
    │   ├── types/         # TypeScript types
    │   └── config/        # Configuration
    └── package.json
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **TypeScript** - Type safety

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd websocket-messaging
```

### 2. Backend Setup

```bash
cd messaging-backend
npm install
```

Create `.env` file:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:5001`

### 3. Frontend Setup

```bash
cd ../messaging-frontend
npm install
```

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

Start the frontend server:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?query=` - Search users
- `GET /api/users/online` - Get online users
- `PATCH /api/users/profile` - Update user profile

### Messages
- `POST /api/messages/send` - Send a message
- `GET /api/messages/conversation/:id` - Get conversation messages
- `PATCH /api/messages/:id/read` - Mark message as read

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔌 Socket Events

### Client → Server
- `conversation:join` - Join a conversation room
- `conversation:leave` - Leave a conversation room
- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `notification:send` - Send a notification

### Server → Client
- `message:receive` - Receive a new message
- `typing:user` - User is typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline
- `notification:receive` - Receive a notification

## 🎨 Features in Detail

### Real-time Messaging
Messages are delivered instantly using WebSocket connections. The app maintains persistent connections between clients and the server.

### Authentication
JWT tokens are used for secure authentication. Tokens are stored in localStorage and automatically attached to API requests.

### Online Status
Socket.IO tracks user connections and broadcasts online/offline status to all connected clients.

### Typing Indicators
When a user types, a typing event is emitted to other participants in the conversation.

### Notifications
Users receive real-time notifications for new messages, friend requests, and other events.

## 🚀 Deployment

### Backend (Railway/Render/Heroku)

1. Set environment variables in your hosting platform
2. Deploy from GitHub repository
3. Update `CLIENT_URL` to your frontend URL

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOCKET_URL`
3. Deploy

## 📝 Development Scripts

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build TypeScript
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5001
kill -9 $(lsof -ti:5001)
```

### MongoDB Connection Failed
- Check your MongoDB URI
- Ensure MongoDB is running
- Check network connectivity

### Socket Connection Failed
- Verify backend is running
- Check CORS settings
- Ensure URLs match in .env files

## 📄 License

MIT License

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Next.js team for the amazing framework
- MongoDB for the database
- Tailwind CSS for styling utilities
