
import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Trophy, Clock, Target, Loader2, BarChart2, MessageSquare, Send } from "lucide-react";
import { fetchWithAuth, UnauthorizedError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA & TYPES (can be replaced with real data models) ---
type Course = {
  id: string;
  title: string;
};

type AnalyticsData = {
  course_title: string;
  overall_progress: number;
  quizzes_completed: number;
  total_quizzes: number;
  average_score: number;
  time_spent_hours: number;
  score_over_time: { name: string; score: number }[];
  // Add more fields as per actual API response
};



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  const { toast } = useToast();
  const navigate = useNavigate();

  const [userName, setUserName] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.full_name || 'Student';
  });

  // Fetch user profile to get the most up-to-date name
  useEffect(() => {
    const fetchUserName = async () => {
        try {
            const response = await fetchWithAuth('/api/profile/profile');
            if (!response.ok) return; // Don't bother if it fails
            const data = await response.json();
            if (data.full_name) {
                setUserName(data.full_name);
                // Keep localStorage in sync for other parts of the app
                const userSession = JSON.parse(localStorage.getItem('user') || '{}');
                userSession.full_name = data.full_name;
                localStorage.setItem('user', JSON.stringify(userSession));
            }
        } catch (err) {
            // Silently fail, the initial state from localStorage will be used
            console.error("Could not fetch user name for dashboard:", err);
        }
    };
    fetchUserName();
  }, []);

  // Fetch enrolled courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        // IMPORTANT: Replace with your actual endpoint to get enrolled courses
        const response = await fetchWithAuth('/api/courses/enrolled'); 
        const data = await response.json();
        setCourses(data.courses || []); // Assuming API returns { courses: [...] }
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setError("Could not load your courses. Please try refreshing.");
        if (err instanceof UnauthorizedError) navigate('/login');
      }
      setIsLoadingCourses(false);
    };
    fetchCourses();
  }, [navigate]);

  // Fetch analytics when a course is selected
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setAnalytics(null);
      try {
        const response = await fetchWithAuth(`/api/courses/${selectedCourseId}/analytics`);
        const data = await response.json();
        // Mocking some data if the response is empty, as per user's example
        setAnalytics(data.detail ? createMockAnalytics(selectedCourseId) : data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        toast({ title: "Error", description: "Could not load analytics for this course.", variant: "destructive" });
        if (err instanceof UnauthorizedError) navigate('/login');
      }
      setIsLoadingAnalytics(false);
    };
    fetchAnalytics();
  }, [selectedCourseId, navigate, toast]);

  const handleFeedbackSubmit = async () => {
    if (!selectedCourseId || !feedback) {
      toast({ title: "Missing Information", description: "Please provide your feedback before submitting.", variant: "destructive" });
      return;
    }
    setIsFeedbackSubmitting(true);
    try {
      await fetchWithAuth(`/api/courses/${selectedCourseId}/analytics/feedback`, {
        method: 'POST',
        body: JSON.stringify({ feedback: feedback, improvement_suggestions: improvement })
      });
      toast({ title: "Success", description: "Your feedback has been submitted. Thank you!" });
      setIsFeedbackDialogOpen(false);
      setFeedback('');
      setImprovement('');
    } catch (err) {
      console.error("Failed to submit feedback", err);
      toast({ title: "Error", description: "Could not submit your feedback.", variant: "destructive" });
      if (err instanceof UnauthorizedError) navigate('/login');
    }
    setIsFeedbackSubmitting(false);
  };



  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome back, {userName}! 👋</h1>
        


        {/* Course Analytics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className='flex items-center'><BarChart2 className="mr-2" /> Course Analytics</div>
              <div className="w-full md:w-1/3">
                <Select onValueChange={setSelectedCourseId} disabled={isLoadingCourses}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select a course"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length > 0 ? (
                      courses.map(course => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)
                    ) : (
                      <SelectItem value="no-course" disabled>No courses found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : analytics ? (
              <AnalyticsDisplay analytics={analytics} onFeedbackClick={() => setIsFeedbackDialogOpen(true)} />
            ) : (
              <div className="text-center h-64 flex items-center justify-center"><p className='text-muted-foreground'>Select a course to view your progress and analytics.</p></div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Dialog */}
        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Feedback for {analytics?.course_title || 'this course'}</DialogTitle>
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
const AnalyticsDisplay = ({ analytics, onFeedbackClick }: { analytics: AnalyticsData, onFeedbackClick: () => void }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-start">
      <h2 className="text-2xl font-bold text-primary">{analytics.course_title}</h2>
      <Button onClick={onFeedbackClick}><MessageSquare className="mr-2 h-4 w-4" /> Provide Feedback</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Overall Progress" value={`${analytics.overall_progress}%`} />
      <StatCard title="Quizzes Completed" value={`${analytics.quizzes_completed} / ${analytics.total_quizzes}`} />
      <StatCard title="Average Score" value={`${analytics.average_score}%`} />
      <StatCard title="Time Spent" value={`${analytics.time_spent_hours} hrs`} />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-4">Score Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analytics.score_over_time}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const StatCard = ({ title, value }: { title: string, value: string }) => (
  <Card>
    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader>
    <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
  </Card>
);

// Helper to create mock data if API fails or returns enrollment error
const createMockAnalytics = (courseId: string): AnalyticsData => ({
  course_title: `Sample Course Analytics`,
  overall_progress: 75,
  quizzes_completed: 8,
  total_quizzes: 10,
  average_score: 88,
  time_spent_hours: 42,
  score_over_time: [
    { name: 'Quiz 1', score: 80 },
    { name: 'Quiz 2', score: 92 },
    { name: 'Quiz 3', score: 85 },
    { name: 'Midterm', score: 89 },
    { name: 'Quiz 4', score: 95 },
  ],
});

export default Dashboard;

