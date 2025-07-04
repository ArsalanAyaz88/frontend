import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Progress } from "@/components/ui/progress";
import { Loader2, MessageSquare, Download } from "lucide-react";
import { fetchWithAuth, UnauthorizedError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// --- DATA TYPES ---
type AnalyticsData = {
  course_id: string;
  course: {
    title: string;
    description: string;
  };
  videos: {
    total: number;
    watched: number;
  };
  assignments: {
    total: number;
    submitted: number;
  };
  quizzes: {
    total: number;
    attempted: number;
  };
  progress: number;
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  const [allAnalytics, setAllAnalytics] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState('');
  const [improvement, setImprovement] = useState('');
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isCertificateLoading, setIsCertificateLoading] = useState<Record<string, boolean>>({});
  const [feedbackCourse, setFeedbackCourse] = useState<AnalyticsData | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const [userName, setUserName] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.full_name && user.full_name.toLowerCase() !== 'string' ? user.full_name : 'Student';
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch user name if not available
        if (userName === 'Student') {
          const response = await fetchWithAuth('/api/profile/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.full_name && data.full_name.toLowerCase() !== 'string') {
              setUserName(data.full_name);
              const userSession = JSON.parse(localStorage.getItem('user') || '{}');
              userSession.full_name = data.full_name;
              localStorage.setItem('user', JSON.stringify(userSession));
            }
          }
        }

        // Fetch all analytics
        const analyticsResponse = await fetchWithAuth('/api/student/dashboard/all-analytics');
        const analyticsData = await analyticsResponse.json();
        setAllAnalytics(analyticsData);

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setError("Could not load your dashboard. Please try again later.");
        if (err instanceof UnauthorizedError) navigate('/login');
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, [navigate]);

  const handleGetCertificate = async (courseId: string) => {
    setIsCertificateLoading(prev => ({ ...prev, [courseId]: true }));
    try {
        const response = await fetchWithAuth(`/api/courses/courses/${courseId}/certificate`);
        const data = await response.json();
        if (response.ok) {
            window.open(data.certificate_url, '_blank');
            toast({ title: 'Success', description: 'Certificate is being downloaded!' });
        } else {
            throw new Error(data.detail || 'Failed to get certificate');
        }
    } catch (err: any) {
        console.error('Certificate download error:', err);
        toast({ variant: 'destructive', title: 'Error', description: err.message || 'An error occurred.' });
    }
    setIsCertificateLoading(prev => ({ ...prev, [courseId]: false }));
  };

  const handleOpenFeedbackDialog = (analytics: AnalyticsData) => {
    setFeedbackCourse(analytics);
    setIsFeedbackDialogOpen(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackCourse || !feedback) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide feedback before submitting.' });
      return;
    }
    setIsFeedbackSubmitting(true);
    try {
      const response = await fetchWithAuth(`/api/student/dashboard/courses/${feedbackCourse.course_id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ feedback, improvement_suggestions: improvement }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Thank you for your feedback!' });
        setIsFeedbackDialogOpen(false);
        setFeedback('');
        setImprovement('');
        setFeedbackCourse(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit feedback.');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
    setIsFeedbackSubmitting(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex justify-center items-center h-[calc(100vh-8rem)]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
        
        {allAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {allAnalytics.map(analytics => (
              <Card key={analytics.course_id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{analytics.course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <AnalyticsDisplay 
                    analytics={analytics} 
                    onFeedbackClick={() => handleOpenFeedbackDialog(analytics)}
                    onGetCertificate={() => handleGetCertificate(analytics.course_id)}
                    isCertificateLoading={!!isCertificateLoading[analytics.course_id]}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <p className='text-muted-foreground'>You are not enrolled in any courses yet. Explore our courses to get started!</p>
          </div>
        )}

        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Feedback for {feedbackCourse?.course.title || 'this course'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea placeholder="What did you like or find helpful?" value={feedback} onChange={e => setFeedback(e.target.value)} rows={4}/>
              <Textarea placeholder="What could be improved? (Optional)" value={improvement} onChange={e => setImprovement(e.target.value)} rows={4}/>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleFeedbackSubmit} disabled={isFeedbackSubmitting}>
                {isFeedbackSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Feedback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

// --- HELPER COMPONENTS ---
const AnalyticsDisplay = ({ analytics, onFeedbackClick, onGetCertificate, isCertificateLoading }: { analytics: AnalyticsData, onFeedbackClick: () => void, onGetCertificate: () => void, isCertificateLoading: boolean }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold text-primary">{analytics.course.title}</h2>
        <p className="text-muted-foreground mt-1">{analytics.course.description}</p>
      </div>
      <div className="flex items-center gap-2">
        {analytics.progress === 100 && (
          <Button onClick={onGetCertificate} disabled={isCertificateLoading}>
            {isCertificateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
            Get Certificate
          </Button>
        )}
        <Button onClick={onFeedbackClick}><MessageSquare className="mr-2 h-4 w-4" /> Provide Feedback</Button>
      </div>
    </div>

    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">Overall Progress</span>
        <span className="text-sm font-bold">{analytics.progress}%</span>
      </div>
      <Progress value={analytics.progress} className="w-full" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Videos Watched" value={`${analytics.videos.watched} / ${analytics.videos.total}`} />
      <StatCard title="Assignments Submitted" value={`${analytics.assignments.submitted} / ${analytics.assignments.total}`} />
      <StatCard title="Quizzes Attempted" value={`${analytics.quizzes.attempted} / ${analytics.quizzes.total}`} />
    </div>
  </div>
);

const StatCard = ({ title, value }: { title: string, value: string }) => (
  <Card>
    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader>
    <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
  </Card>
);

export default Dashboard;
