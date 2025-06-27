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
type Course = {
  course_id: string;
  title: string;
};

type AnalyticsData = {
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState('');
  const [improvement, setImprovement] = useState('');
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isCertificateLoading, setIsCertificateLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const [userName, setUserName] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.full_name && user.full_name.toLowerCase() !== 'string') {
      return user.full_name;
    }
    return 'Student';
  });

  useEffect(() => {
    const fetchUserName = async () => {
        try {
            const response = await fetchWithAuth('/api/profile/profile');
            if (!response.ok) return;
            const data = await response.json();
            if (data.full_name && data.full_name.toLowerCase() !== 'string') {
                setUserName(data.full_name);
                const userSession = JSON.parse(localStorage.getItem('user') || '{}');
                userSession.full_name = data.full_name;
                localStorage.setItem('user', JSON.stringify(userSession));
            } else {
                const userSession = JSON.parse(localStorage.getItem('user') || '{}');
                if (userSession.full_name && userSession.full_name.toLowerCase() === 'string') {
                    delete userSession.full_name;
                    localStorage.setItem('user', JSON.stringify(userSession));
                }
            }
        } catch (err) {
            console.error("Could not fetch user name for dashboard:", err);
        }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await fetchWithAuth('/api/courses/my-courses');
        const data = await response.json();
        console.log("Raw API data for courses:", data);
        const rawCourses = Array.isArray(data) ? data : data.courses || [];
        const formattedCourses = rawCourses.map((course: any) => ({
          course_id: String(course.course_id || course.id || course._id),
          title: String(course.title || course.name),
        }));
        console.log("Formatted courses for selector:", formattedCourses);
        setCourses(formattedCourses);
      } catch (err) {
        console.error("Failed to fetch enrolled courses", err);
        setError("Could not load your courses. Please try refreshing.");
        if (err instanceof UnauthorizedError) navigate('/login');
      }
      setIsLoadingCourses(false);
    };
    fetchCourses();
  }, [navigate]);

  const fetchAnalytics = async (courseId: string) => {
    if (!courseId) return;
    setSelectedCourseId(courseId);
    setIsLoadingAnalytics(true);
    setAnalytics(null);
    try {
      const response = await fetchWithAuth(`/api/student/dashboard/courses/${courseId}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error(`Failed to fetch analytics for course ${courseId}`, err);
      setError("Could not load analytics for this course.");
      if (err instanceof UnauthorizedError) navigate('/login');
    }
    setIsLoadingAnalytics(false);
  };

  const handleGetCertificate = async (courseId: string) => {
    if (!analytics) return;
    setIsCertificateLoading(true);
    try {
      const response = await fetchWithAuth(`/api/courses/courses/${courseId}/certificate`);
      if (!response.ok) {
        throw new Error('Failed to download certificate. Please try again later.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analytics.course.title}-certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Certificate download started." });
    } catch (err) {
      console.error("Failed to get certificate", err);
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
    setIsCertificateLoading(false);
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedCourseId || !feedback) {
      toast({ title: "Feedback Required", description: "Please provide some feedback before submitting.", variant: "destructive" });
      return;
    }
    setIsFeedbackSubmitting(true);
    try {
      const response = await fetchWithAuth(`/api/student/dashboard/courses/${selectedCourseId}/analytics/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, improvement }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit feedback');

      toast({ title: "Feedback Submitted", description: "Thank you for your feedback!" });
      setIsFeedbackDialogOpen(false);
      setFeedback('');
      setImprovement('');
    } catch (err) {
      console.error("Feedback submission failed", err);
      toast({ title: "Submission Error", description: (err as Error).message, variant: "destructive" });
    }
    setIsFeedbackSubmitting(false);
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
        
        {error && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/50 rounded-lg">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>My Analytics Dashboard</span>
              <div className="w-full md:w-1/3">
                <Select
                  value={selectedCourseId || ''}
                  onValueChange={fetchAnalytics}
                  disabled={isLoadingCourses || courses.length === 0}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : courses.length === 0 ? "No courses found" : "Select an enrolled course"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.course_id} value={course.course_id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : analytics ? (
              <AnalyticsDisplay 
                analytics={analytics} 
                onFeedbackClick={() => setIsFeedbackDialogOpen(true)}
                onGetCertificate={() => handleGetCertificate(selectedCourseId!)}
                isCertificateLoading={isCertificateLoading}
              />
            ) : (
              <div className="text-center h-64 flex items-center justify-center"><p className='text-muted-foreground'>Select one of your enrolled courses to view your progress and analytics.</p></div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Feedback for {analytics?.course.title || 'this course'}</DialogTitle>
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
