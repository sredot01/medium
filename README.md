# TechBlog - A Professional Blogging Platform

A full-featured blogging platform built with React.js, Node.js, Express, and SQLite, inspired by Medium's design and functionality.

## 🚀 Features

### Real-Time Features
- **User Authentication**: JWT-based secure authentication with login/signup
- **Real-time Likes**: Like and unlike posts with instant count updates
- **Real-time Comments**: Add, view, and delete comments on posts
- **Live Search**: Search posts by title, content, author, tags, and categories
- **Follow System**: Follow/unfollow users and see follower/following counts
- **Bookmark System**: Bookmark posts for later reading
- **Featured Posts**: Feature/unfeature posts with star icon (real-time toggle)
- **User Profiles**: View user profiles with post counts and activity
- **Dynamic Content**: All data is fetched from the database in real-time

### User Management
- Secure user registration and login
- JWT authentication with HTTP-only cookies
- Profile management with bio and avatar support
- Password encryption with bcryptjs
- Persistent sessions

### Content Creation
- Rich text editor (React Quill) for creating posts
- Cover image support (file system selection)
- Automatic slug generation
- Tags and categories
- Automatic read time calculation
- Post excerpts
- Draft and publish workflow

### Social Features
- Like/unlike posts
- Comment on posts
- Reply to comments
- Follow/unfollow authors
- Bookmark posts
- Feature/unfeature posts (star icon)
- View follower and following lists
- User activity tracking

### UI/UX
- Medium-inspired clean design
- Responsive layout
- Collapsible sidebar navigation
- Real-time search with instant results
- Loading states and error handling
- Smooth animations and transitions

## 📁 Project Structure

```
Blogging/
├── backend/                    # Node.js + Express backend
│   ├── config/
│   │   └── database.js        # SQLite database configuration
│   ├── controllers/           # Business logic
│   │   ├── authController.js  # Authentication logic
│   │   ├── postController.js  # Post CRUD operations
│   │   ├── likeController.js  # Like management
│   │   ├── commentController.js
│   │   ├── followController.js
│   │   ├── bookmarkController.js
│   │   └── userController.js
│   ├── models/                # Database models
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Like.js
│   │   ├── Comment.js
│   │   ├── Follow.js
│   │   └── Bookmark.js
│   ├── routes/                # API routes
│   │   ├── index.js           # Main router
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── likeRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── userRoutes.js
│   │   └── bookmarkRoutes.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── errorHandler.js   # Global error handler
│   ├── scripts/
│   │   └── seed.js            # Database seeding script
│   ├── server.js              # Express app entry point
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                  # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js         # Axios API client
│   │   ├── components/
│   │   │   ├── Header.js      # Navigation header
│   │   │   ├── Sidebar.js     # Left sidebar
│   │   │   ├── RightSidebar.js
│   │   │   ├── BlogCard.js
│   │   │   ├── AuthModal.js
│   │   │   └── RichTextEditor.js
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── pages/
│   │   │   ├── Landing.js     # Landing page with trending posts
│   │   │   ├── Home.js        # Main feed
│   │   │   ├── CreatePost.js  # Post creation
│   │   │   ├── EditPost.js    # Post editing
│   │   │   ├── ViewPost.js    # Post view with comments
│   │   │   ├── Stories.js     # User's own posts
│   │   │   ├── Profile.js     # User profile
│   │   │   ├── Followers.js
│   │   │   └── Following.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml         # Docker orchestration
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite (sql.js)** - Lightweight database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cookie-parser** - Cookie handling
- **slugify** - URL slug generation

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Quill** - Rich text editor
- **date-fns** - Date formatting
- **Tailwind CSS** - Utility-first CSS

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Static file serving (frontend)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
   ```powershell
   git clone <repository-url>
   cd Blogging
   ```

2. **Backend Setup**
   ```powershell
   cd backend
   npm install
   
   # Seed the database with sample data
   node scripts/seed.js
   
   # Start the backend server
   npm start
   # or for development with auto-reload
   npm run dev
   ```
   
   Backend will run on `http://localhost:5000`

3. **Frontend Setup**
   ```powershell
   cd frontend
   npm install
   
   # Start the development server
   npm start
   ```
   
   Frontend will run on `http://localhost:3000`

### Docker Setup

1. **Build and run with Docker Compose**
   ```powershell
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 🔑 Test Accounts

After seeding the database, you can use these test accounts:

- **Email**: `john@example.com` | **Password**: `password123`
- **Email**: `sarah@example.com` | **Password**: `password123`
- **Email**: `mike@example.com` | **Password**: `password123`
- **Email**: `emma@example.com` | **Password**: `password123`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password

### Posts
- `GET /api/posts` - Get all posts (with optional filters)
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts` - Create new post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### Likes
- `GET /api/posts/:postId/likes` - Get post likes
- `POST /api/posts/:postId/like` - Like a post (protected)
- `DELETE /api/posts/:postId/like` - Unlike a post (protected)

### Comments
- `GET /api/posts/:postId/comments` - Get post comments
- `POST /api/posts/:postId/comments` - Create comment (protected)
- `PUT /api/posts/comments/:id` - Update comment (protected)
- `DELETE /api/posts/comments/:id` - Delete comment (protected)

### Users
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/:userId/posts` - Get user posts
- `POST /api/users/:userId/follow` - Follow user (protected)
- `DELETE /api/users/:userId/follow` - Unfollow user (protected)
- `GET /api/users/:userId/followers` - Get user followers
- `GET /api/users/:userId/following` - Get users being followed
- `GET /api/users/:userId/is-following` - Check if following (protected)

### Bookmarks
- `POST /api/posts/:postId/bookmark` - Bookmark post (protected)
- `DELETE /api/posts/:postId/bookmark` - Remove bookmark (protected)
- `GET /api/posts/bookmarks` - Get user bookmarks (protected)
- `GET /api/posts/:postId/bookmark/check` - Check if bookmarked (protected)

### Categories & Tags
- `GET /api/categories` - Get all categories
- `GET /api/tags` - Get all tags

## 🎨 Key Features Explained

### Authentication Flow
1. Users sign up with email, name, and password
2. Password is hashed using bcryptjs
3. JWT token is generated and sent as HTTP-only cookie
4. Frontend stores token in localStorage and includes it in API requests
5. Protected routes verify token using middleware

### Real-Time Interactions
- **Likes**: Click the heart icon to like/unlike posts; count updates immediately
- **Comments**: Submit comments and see them appear instantly
- **Follow**: Follow users and see updated follower counts in real-time
- **Bookmarks**: Save posts for later and access them from your profile
- **Search**: Type in the header search bar for instant filtered results

### Content Management
- **Create**: Use the rich text editor with formatting options
- **Edit**: Update your own posts from the Stories page
- **Delete**: Remove posts you've created
- **Cover Images**: Select images from your file system

### User Profiles
- View any user's profile by clicking their name or avatar
- See their post count, followers, and following
- View all posts by that user
- Follow/unfollow from their profile

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- HTTP-only cookies for token storage
- Protected API routes
- Input validation
- SQL injection prevention (parameterized queries)
- CORS configuration

## 🚦 Running in Production

1. Set environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   REACT_APP_API_URL=https://your-api-domain.com/api
   ```

2. Build frontend:
   ```powershell
   cd frontend
   npm run build
   ```

3. Serve frontend static files with Nginx or similar

4. Run backend with PM2 or similar process manager

## 🐛 Troubleshooting

### Backend Issues
- **Port already in use**: Kill existing Node processes or change port
  ```powershell
  taskkill /F /IM node.exe
  ```
- **Database locked**: Make sure only one instance of the backend is running
- **Module not found**: Run `npm install` in the backend directory

### Frontend Issues
- **API connection failed**: Ensure backend is running on port 5000
- **Authentication errors**: Clear localStorage and cookies, then re-login
- **Build errors**: Delete `node_modules` and run `npm install` again

## 📝 Development Notes

- The database file (`blog.db`) is created automatically on first run
- To reset the database, delete `blog.db` and run `node scripts/seed.js`
- The seed script creates sample users, posts, likes, and comments
- All dates are stored in ISO format and formatted on the frontend
- Images are stored as base64 or data URLs (consider cloud storage for production)

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Built with ❤️ using React.js and Node.js**
