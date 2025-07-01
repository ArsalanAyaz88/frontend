import { Card } from "@/components/ui/card";
import { Quote, Linkedin, Twitter, Mail } from "lucide-react";

const CEOSection = () => {
  return (
    <section id="about" className="py-20 px-6 bg-muted/20">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Meet Our <span className="text-primary">CEO</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Passionate about democratizing education and empowering learners worldwide.
            </p>
          </div>
          
          <Card className="glass-card p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Quote className="h-12 w-12 text-primary mb-6" />
                <blockquote className="text-lg leading-relaxed mb-6">
                  "Education is the most powerful tool we can use to change the world. At EduVerse, 
                  we're committed to making quality education accessible to everyone, everywhere. 
                  Our mission is to break down barriers and create opportunities for lifelong learning."
                </blockquote>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Dr. Alexandra Rivera</h3>
                    <p className="text-primary font-medium mb-1">Chief Executive Officer</p>
                    <p className="text-muted-foreground">
                      Former Stanford Professor | EdTech Pioneer | 15+ Years in Education
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="glass-card p-4 rounded-2xl">
                    <img 
                      src="https://res.cloudinary.com/dcmtpky4i/image/upload/v1751401299/WhatsApp_Image_2025-06-30_at_09.07.46_9dbdb99e_rdbnwq.jpg"
                      alt="CEO Alexandra Rivera"
                      className="rounded-xl w-full"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 glass-card p-4 rounded-xl neon-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">500K+</div>
                      <div className="text-sm text-muted-foreground">Lives Impacted</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CEOSection;
