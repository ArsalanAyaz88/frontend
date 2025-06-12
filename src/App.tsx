
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentCourseDetail from "./pages/student/CourseDetail";
import StudentAssignments from "./pages/student/Assignments";
import StudentAssignmentDetail from "./pages/student/AssignmentDetail";
import StudentQuizzes from "./pages/student/Quizzes";
import StudentPayment from "./pages/student/Payment";
import StudentProfile from "./pages/student/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCourses from "./pages/admin/Courses";
import AdminStudents from "./pages/admin/Students";
import AdminEnrollments from "./pages/admin/Enrollments";
import AdminAnalytics from "./pages/admin/Analytics";
import ManageAssignments from "./pages/admin/ManageAssignments";
import ManageQuizzes from "./pages/admin/ManageQuizzes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/assignments/:courseId/:assignmentId" element={<StudentAssignmentDetail />} />
          <Route path="/student/quizzes" element={<StudentQuizzes />} />
          <Route path="/student/payment" element={<StudentPayment />} />
          <Route path="/student/payment/:courseId" element={<StudentPayment />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/enrollments" element={<AdminEnrollments />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/manage-assignments" element={<ManageAssignments />} />
          <Route path="/admin/manage-quizzes" element={<ManageQuizzes />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
