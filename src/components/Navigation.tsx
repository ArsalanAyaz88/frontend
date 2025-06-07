
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { GraduationCap } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            EduVerse
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="#courses" className="nav-link">Courses</Link>
          <Link to="#about" className="nav-link">About</Link>
          <Link to="#contact" className="nav-link">Contact</Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="btn-neon">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
