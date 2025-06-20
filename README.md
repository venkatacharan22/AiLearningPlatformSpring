# 🎓 AI Learning Platform

A comprehensive learning management system built with **Spring Boot** and **React**, featuring AI-powered course generation, intelligent learning paths, and modern educational tools.

## 🚀 Latest Updates (v2.0)

### ✅ **AI Course Generation Fixed**
- 🔧 **Resolved Authentication Issues**: Fixed JWT filter blocking AI endpoints
- 🎯 **Working Course Creation**: Instructors can now successfully generate AI courses
- 🤖 **Mock AI Integration**: Realistic AI responses for testing and development
- 📊 **Enhanced Debugging**: Comprehensive logging for troubleshooting
- 🔐 **Improved Security**: Better public endpoint detection and authentication flow

### 🎉 **New Features**
- ✨ **Instructor Dashboard**: Fully functional course creation interface
- 🎥 **YouTube Integration**: AI finds relevant educational videos for courses
- 📝 **Dynamic Course Generation**: AI creates complete course structures with lessons
- 🔍 **Advanced Search**: Enhanced course discovery and filtering
- 📱 **Responsive Design**: Modern UI optimized for all devices

## ✨ Features

### 🔐 Authentication & Role Management
- JWT-based authentication
- Three user roles: **Admin**, **Instructor**, **Student**
- Role-based access control and dashboards

### 📚 Course Management
- **Instructors** can create, edit, and publish courses
- Upload course materials and videos
- Course categorization and difficulty levels
- Student enrollment and progress tracking

### 🤖 AI-Powered Features
- **AI Quiz Generator**: Automatically generate MCQ quizzes from course content
- **Course Summarizer**: AI-generated course summaries for quick revision
- **IQ Estimator**: Pattern and logic-based assessment tool
- **Smart Recommendations**: Personalized course suggestions based on performance

### 📊 Analytics & Progress Tracking
- Real-time progress monitoring
- Course completion tracking
- Performance analytics for instructors
- Student engagement metrics

## 🛠️ Technology Stack

### 🔧 Backend
- **Spring Boot 3.2.0** - Main framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **H2 Database** - In-memory database for development
- **JWT** - Token-based authentication
- **Maven** - Dependency management
- **Hibernate** - ORM framework

### 🎨 Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Router** - Navigation
- **Context API** - State management
- **Modern ES6+** - JavaScript features

### 🤖 AI Integration
- **Google Gemini API** - AI content generation (ready for integration)
- **Mock AI Responses** - Current testing implementation
- **YouTube API Integration** - Educational video discovery
- **Course Generation** - Automated content creation
- **Quiz Generation** - Intelligent assessment creation

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-learning-platform
   ```

2. **Configure Gemini API**
   - Update `src/main/resources/application.properties`
   - Set your Gemini API key: `gemini.api.key=YOUR_API_KEY`

3. **Run the Spring Boot application**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   
   The frontend will start on `http://localhost:3000`

## 👥 Demo Users

The application comes with pre-configured demo users:

### 👨‍🏫 Instructors
- **Username**: `instructor` / **Password**: `instructor123`
- **Username**: `sarah_wilson` / **Password**: `instructor123`
- **Username**: `mike_chen` / **Password**: `instructor123`

### 👨‍🎓 Students
- **Username**: `student` / **Password**: `student123`
- **Username**: `alex_johnson` / **Password**: `student123`
- **Username**: `emma_davis` / **Password**: `student123`
- **Username**: `ryan_martinez` / **Password**: `student123`
- **Username**: `sophia_brown` / **Password**: `student123`
- **Username**: `lucas_garcia` / **Password**: `student123`

### 👨‍💼 Admin
- **Username**: `admin` / **Password**: `admin123`

## 🤖 AI Course Generation

### 🎯 How It Works
Instructors can generate AI-powered courses by:
1. 🔑 Logging in as an instructor
2. 🧭 Navigating to "Create Course"
3. 🤖 Using the AI course generation feature
4. 📝 Providing topic and difficulty level
5. ✨ AI generates complete course structure with lessons

### 🔥 Current AI Capabilities
- **📋 Course Structure Generation**: Creates course outlines and lesson plans
- **📝 Content Generation**: Generates lesson content and descriptions
- **⚡ Difficulty Adaptation**: Adjusts content based on selected difficulty level
- **🎥 Video Integration**: Finds relevant YouTube educational content
- **🧪 Mock Integration**: Currently uses mock responses for testing (ready for real AI integration)

### 🔮 Latest Fixes (v2.0)
- ✅ **Fixed Authentication**: Resolved JWT authentication issues for AI endpoints
- ✅ **Enhanced Security**: Improved public endpoint detection
- ✅ **Better Error Handling**: Comprehensive error logging and debugging
- ✅ **Mock AI Responses**: Working AI course generation with realistic mock data
- ✅ **Instructor Dashboard**: Fully functional course creation interface

## 📁 Project Structure

```
ai-learning-platform/
├── src/main/java/com/learningplatform/
│   ├── config/          # Security and web configuration
│   ├── controller/      # REST API controllers
│   ├── model/          # Data models
│   ├── repository/     # Data access layer
│   ├── security/       # JWT security components
│   └── service/        # Business logic
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API service layer
│   │   └── context/    # React context providers
│   └── public/         # Static assets
├── data/               # JSON data storage
└── uploads/            # File uploads storage
```

## 🔧 Configuration

### Backend Configuration (`application.properties`)
```properties
# Server Configuration
server.port=8081

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000

# Gemini API Configuration
gemini.api.key=your-gemini-api-key

# File Storage
app.data.path=./data
app.uploads.path=./uploads
```

### Frontend Configuration
- API base URL is configured in `src/services/api.js`
- Tailwind CSS configuration in `tailwind.config.js`

## 🎯 Key Features Walkthrough

### For Students
1. **Browse Courses**: Explore available courses by category and difficulty
2. **Enroll & Learn**: Enroll in courses and track progress
3. **Take Quizzes**: Complete AI-generated assessments
4. **IQ Assessment**: Take pattern recognition tests
5. **Get Recommendations**: Receive personalized course suggestions

### For Instructors
1. **Create Courses**: Build comprehensive course content
2. **AI Quiz Generation**: Generate quizzes automatically from course material
3. **Course Summarization**: Create AI-powered course summaries
4. **Student Analytics**: Monitor student progress and engagement
5. **Material Management**: Upload and organize course resources

### For Admins
1. **User Management**: Manage all users and roles
2. **Course Oversight**: Monitor and manage all courses
3. **System Analytics**: View platform-wide statistics
4. **Content Moderation**: Publish/unpublish courses

## 🤖 AI Features in Detail

### Quiz Generation
- Input course content or topic
- AI generates 3-5 multiple choice questions
- Includes explanations for correct answers
- Automatic scoring and feedback

### Course Summarization
- Analyzes course content and structure
- Generates concise key takeaways
- Helps students with quick revision
- Maintains focus on learning objectives

### IQ Assessment
- Pattern recognition questions
- Logical reasoning challenges
- Mathematical and spatial problems
- Provides estimated IQ score for course recommendations

### Smart Recommendations
- Analyzes student performance and interests
- Considers completed courses and IQ level
- Suggests appropriate difficulty levels
- Personalized learning paths

## 📊 Data Storage

The application uses file-based storage for simplicity:

- **Users**: `data/users.json`
- **Courses**: `data/courses.json`
- **Progress**: `data/progress.json`
- **Uploads**: `uploads/` directory

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password encryption with BCrypt
- CORS configuration for frontend integration
- Secure file upload handling

## 🚀 Deployment

### Production Build

1. **Backend**
   ```bash
   ./mvnw clean package
   java -jar target/ai-learning-platform-0.0.1-SNAPSHOT.jar
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm run build
   # Serve the build folder with a web server
   ```

### Environment Variables
Set the following environment variables for production:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: Strong secret key for JWT signing
- `SERVER_PORT`: Backend server port (default: 8080)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

## 🎉 Acknowledgments

- **Google Gemini API** for AI capabilities
- **Spring Boot** for the robust backend framework
- **React** for the dynamic frontend
- **Tailwind CSS** for beautiful styling
- **Heroicons** for the icon set
