
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email) {
      toast({
        title: "Reset Link Sent!",
        description: "Check your email for password reset instructions.",
      });
      setIsSubmitted(true);
    } else {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
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
          <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
          <p className="text-muted-foreground">
            {isSubmitted 
              ? "We've sent you a reset link" 
              : "Enter your email to reset your password"
            }
          </p>
        </div>

        <Card className="glass-card p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full btn-neon">
                Send Reset Link
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground mb-4">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <div className="space-y-4">
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="outline"
                  className="w-full"
                >
                  Try Different Email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
