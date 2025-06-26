import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"student" | "admin">("student");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let response, data;
    try {
      const body = new URLSearchParams();
      body.append('username', email);
      body.append('password', password);

      const url = userType === "admin"
        ? 'https://student-portal-lms-seven.vercel.app/api/auth/admin-login'
        : 'https://student-portal-lms-seven.vercel.app/api/auth/token';

      response = await fetch(url, {
        method: 'POST',
        body: body, // Send cookies with the request
      });
      data = await response.json();

      if (response.ok) {
        // The access token is now handled by HttpOnly cookies set by the backend.
        // We no longer need to store it in localStorage.

        // Store user session data
        const userSession = {
          email: email,
          role: userType,
          full_name: data.full_name || email.split('@')[0], // Fallback to email prefix if no full_name
        };
        localStorage.setItem('user', JSON.stringify(userSession));

        if (userType === 'admin' && data.access_token) {
          localStorage.setItem('admin_access_token', data.access_token);
        }

        toast({
          title: "Login Successful!",
          description: data.message || `Welcome back to EduVerse!`,
        });
        
        const enrollCourseId = localStorage.getItem('enrollCourseId');
        if (enrollCourseId) {
          localStorage.removeItem('enrollCourseId');
          navigate(`/student/payment?course_id=${enrollCourseId}`);
        } else {
          // Redirect based on user type
          if (userType === 'admin') {
            navigate("/admin/dashboard");
          } else {
            navigate("/student/dashboard");
          }
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.detail || data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              EduVerse
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue your learning journey</p>
        </div>

        <Card className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={userType === "student" ? "default" : "outline"}
                  onClick={() => setUserType("student")}
                  className="flex-1"
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={userType === "admin" ? "default" : "outline"}
                  onClick={() => setUserType("admin")}
                  className="flex-1"
                >
                  Admin
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full btn-neon" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
