# SedNex Backend API

A robust Node.js backend API for a social platform featuring user authentication, posts, articles, and community interactions.

## 🚀 Quick Overview

**SedNex** is a RESTful API backend that provides:
- 🔐 **Authentication** - Firebase-based user authentication
- 👥 **User Management** - Profile management with role-based access control
- 📝 **Posts** - Create, read, update, delete posts with categories
- 💬 **Comments** - Threaded comments with replies
- ❤️ **Engagement** - Like/love posts and save articles
- 📚 **Articles** - Create and manage long-form content
- 🖼️ **Media Upload** - Cloudinary integration for images

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: Firebase Admin SDK
- **File Storage**: Cloudinary
- **Security**: JWT, bcrypt
- **Validation**: Joi

## ✨ Features

### Authentication & Authorization
- Firebase-based login/register
- JWT token authentication
- Role-based access control (Admin, User, Guest)
- Protected routes with middleware

### User Management
- User profile creation and updates
- Profile image upload
- Bio, location, and contact information
- Admin user role management
- User listing (admin only)

### Posts
- Create posts with categories
- View posts with pagination
- Get posts by category
- Love/unlike posts
- Comment on posts with threading
- Delete posts (admin only)

### Articles
- Create articles with title and description
- Save/unsave articles for later reading
- Category-based organization

### Comments
- Add comments to posts
- Reply to comments (nested threading)
- View all comments on a post
- Get replies for specific comments

## 📋 API Endpoints

### Authentication
```
POST /api/auth/login - Login or register user
```

### Users
```
GET    /api/users              - Get all users (admin only)
PATCH  /api/users/:userId/role - Update user role (admin only)
PATCH  /api/users/:firebaseUid - Update user profile (with image upload)
```

### Posts
```
POST   /api/post                    - Create a new post
GET    /api/post                    - Get all posts (paginated)
GET    /api/post/:postId            - Get post by ID
GET    /api/post/category/:category - Get posts by category
DELETE /api/post/:postId            - Delete post (admin only)
PATCH  /api/post/:postId/love       - Toggle love on a post
POST   /api/post/comment/:postId    - Add comment to post
GET    /api/post/comment/:postId    - Get all comments on post
GET    /api/post/comment/replies/:commentId - Get replies to a comment
```

### Articles
```
POST /api/article                - Create a new article
POST /api/article/:articleId/save - Toggle save article
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Firebase project with Admin SDK
- Cloudinary account

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Afsaruddin12133/SedNex.git
   cd SedNex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Firebase Configuration**
   
   Create `firebasesecret.json` in the root directory with your Firebase Admin SDK credentials:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "your-private-key-id",
     "private_key": "your-private-key",
     "client_email": "your-client-email",
     "client_id": "your-client-id",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "your-cert-url"
   }
   ```

5. **Start the server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Verify installation**
   
   Visit `http://localhost:4000/` - you should see:
   ```json
   {"message": "SedNex API is running"}
   ```

## 🔒 Authentication

All API endpoints (except the root `/` endpoint) require authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## 📝 Usage Examples

### Create a Post
```bash
curl -X POST http://localhost:4000/api/post \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "This is my first post!",
    "category": "technology"
  }'
```

### Get Posts
```bash
curl -X GET http://localhost:4000/api/post \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Love a Post
```bash
curl -X PATCH http://localhost:4000/api/post/POST_ID/love \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Profile with Image
```bash
curl -X PATCH http://localhost:4000/api/users/FIREBASE_UID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profileImage=@/path/to/image.jpg" \
  -F "bio=Software developer" \
  -F "location=New York"
```

## 🗂️ Project Structure

```
SedNex/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── config/                # Configuration files
│   │   ├── db.js              # MongoDB connection
│   │   ├── cloudinary.js      # Cloudinary setup
│   │   └── firebaseAdmin.js   # Firebase Admin setup
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── post.controller.js
│   │   ├── article.controller.js
│   │   ├── comment.controller.js
│   │   └── savedArticle.controller.js
│   ├── models/                # Database models
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Article.model.js
│   │   ├── Comment.js
│   │   └── savedArticle.model.js
│   ├── routes/                # Route definitions
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── post.routes.js
│   │   └── article.routes.js
│   └── middlewares/           # Custom middleware
│       ├── auth.middleware.js
│       ├── admin.middleware.js
│       ├── role.middleware.js
│       └── upload.js
├── package.json
└── .env                       # Environment variables (not committed)
```

## 🔑 Key Concepts

### User Roles
- **Guest**: Limited access
- **User**: Standard user with full post/article creation and interaction
- **Admin**: Full access including user management and post deletion

### Authentication Flow
1. User signs in via Firebase on frontend
2. Firebase returns ID token
3. Token sent to backend in Authorization header
4. Backend verifies token with Firebase Admin SDK
5. User data extracted and used for authorization

### Data Models

**User**: firebaseUid, name, email, gender, country, photo, role, profileImage, bio, phone, location

**Post**: author, description, category, lovedBy[], loveCount, commentsCount

**Article**: category, title, description, author

**Comment**: Nested comments with replies support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Afsaruddin12133

---

**Ready to get started?** Follow the setup instructions above and you'll have the API running in minutes!
