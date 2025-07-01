
import { Button } from "@/components/ui/button";
import { Play, Star, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Master New
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent block">
                Skills Today
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              It is my great honour to INTRODUCE  SABIRY COLOR DOPPPLER ULTRASOUND CENTRE.. we have been conducting a large number of high quality Ultrasound IMAGING FOR THE LAST 23 YEARS. SABIRY COLOR DOPPPLER ULTRASOUND aims at enabling presentation of new results in the sonography information with a focus on execellent resultS. The SABIRY COLOR DOPPPLER ULTRASOUND’s objective is not only to deal with difficult patients but also with proper diagnoses. I would like to take this opportunity to thank all of our colleagues, friends and the Doctors for their support, help, and consistent effort to make SABIRY COLOR DOPPPLER ULTRASOUND a successful center. The experience and efforts of those mentioned above are indeed a great contribution for my success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button className="btn-neon text-lg px-8 py-4">
                  Start Learning
                </Button>
              </Link>
              <Button variant="outline" className="text-lg px-8 py-4 border-primary/50 hover:bg-primary/10">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">500+ Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">4.9 Rating</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="glass-card p-8 rounded-2xl">
              <img 
                src="https://res.cloudinary.com/dcmtpky4i/image/upload/v1751401471/WhatsApp_Image_2025-05-15_at_19.31.00_0a0a9434_vmsfvc.jpg"
                alt="Student learning online"
                className="rounded-xl w-full"
              />
              <div className="absolute -bottom-4 -right-4 glass-card p-4 rounded-xl neon-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Classes Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
