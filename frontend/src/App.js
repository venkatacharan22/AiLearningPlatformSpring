import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import TakeQuiz from './pages/TakeQuiz';
import CreateCourse from './pages/CreateCourse';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentList from './pages/AssignmentList';
import InstructorAssignments from './pages/InstructorAssignments';
import TakeAssignment from './pages/TakeAssignment';
import LessonViewer from './pages/LessonViewer';
import IQTest from './pages/IQTest';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/course/:courseId/quiz" element={<TakeQuiz />} />

            {/* Student Routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/iq-test" element={<IQTest />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/assignments/:assignmentId" element={<TakeAssignment />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewer />} />

            {/* Instructor Routes */}
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/courses/:courseId/create-assignment" element={<CreateAssignment />} />
            <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
            <Route path="/instructor/courses/:courseId/assignments" element={<InstructorAssignments />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
