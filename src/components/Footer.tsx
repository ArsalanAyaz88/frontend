
import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border/50 py-16 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Sabri Ultrasound Institute
              </span>
            </Link>
            <p className="text-muted-foreground">
              Empowering learners worldwide with premium video courses and expert guidance.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@eduverse.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Courses</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Web Development</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Data Science</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Digital Marketing</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Design</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Community</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Live Chat</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Press</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Sabri Ultrasound Institute. All rights reserved. Made with ❤️ for learners worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
