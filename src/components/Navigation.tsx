import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { GraduationCap } from "lucide-react";

const Navigation = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/50 shadow-md backdrop-blur-md bg-background/70">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex flex-col items-start space-y-0">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary drop-shadow" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              SUTI
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium tracking-wide pl-10 -mt-1">
            Sabriy Ultrasound Training Institute
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`nav-link${location.pathname === '/' ? ' text-primary font-bold underline' : ''} transition-colors duration-200`}>
            Home
          </Link>
          <button 
            onClick={() => scrollToSection('courses')} 
            className="nav-link cursor-pointer hover:text-primary transition-colors duration-200"
          >
            Explore Courses
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="nav-link cursor-pointer hover:text-primary transition-colors duration-200"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="nav-link cursor-pointer hover:text-primary transition-colors duration-200"
          >
            Contact
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary hover:bg-muted/60 font-medium transition-colors duration-200"
            >
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-primary text-white shadow px-6 py-2 rounded-full font-semibold text-base hover:bg-primary/90 transition-colors duration-200">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
