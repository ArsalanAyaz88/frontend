import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertCircle, Play, Trophy, Target, Loader2 } from "lucide-react";
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';
import { toast } from 'sonner';

// Interfaces
interface Quiz {
  id: string;
  title: string;
  description: string;
  course_id: string;
  course_title: string;
  is_submitted: boolean;
  score: number | null;
  submission_id?: string;
  total_questions: number;
}

interface Course {
  id: string;
  title: string;
}

const Quizzes = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]); // Define interface later
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const coursesRes = await fetchWithAuth('/api/courses/my-courses');
        const enrolledCourses: Course[] = await handleApiResponse(coursesRes);

        if (enrolledCourses.length === 0) {
          setAvailableQuizzes([]);
          setLoading(false);
          return;
        }

        const quizPromises = enrolledCourses.map(async (course) => {
          try {
            const quizzesRes = await fetchWithAuth(`/api/student/courses/${course.id}/quizzes`);
            const courseQuizzes = await handleApiResponse(quizzesRes);
            return courseQuizzes.map((quiz: any) => ({ ...quiz, course_id: course.id, course_title: course.title }));
          } catch (e) {
            console.error(`Failed to fetch quizzes for course ${course.title}`, e);
            return []; // Return empty array if a course's quizzes fail to load
          }
        });

        const quizzesByCourse = await Promise.all(quizPromises);
        const allQuizzes = quizzesByCourse.flat();
        
        const available = allQuizzes.filter((quiz: Quiz) => !quiz.is_submitted);
        const completed = allQuizzes.filter((quiz: Quiz) => quiz.is_submitted);

        setAvailableQuizzes(available);
        setCompletedQuizzes(completed);

      } catch (err: any) {
        if (err instanceof UnauthorizedError) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError('Failed to load quizzes. Please try again later.');
          toast.error(err.message || 'An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [navigate]);

  const renderQuizCard = (quiz: Quiz) => {
    const isCompleted = quiz.is_submitted;

    return (
      <Card key={quiz.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold">{quiz.title}</h3>
            </div>
            <p className="text-muted-foreground">{quiz.course_title}</p>
            <p className="text-foreground">{quiz.description}</p>
          </div>
          <div>
            {isCompleted ? (
              <p className="text-lg font-bold text-right">
                Score: {quiz.score}/{quiz.total_questions}
              </p>
            ) : (
              <Link to={`/student/quizzes/${quiz.course_id}/${quiz.id}/attempt`} className="w-full">
                <Button><Play className="mr-2 h-4 w-4"/>Start Quiz</Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">An Error Occurred</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-500';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-500';
      case 'Advanced': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge and track your progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableQuizzes.length}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedQuizzes.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">N/A</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">N/A</p>
                <p className="text-sm text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Quizzes</TabsTrigger>
            <TabsTrigger value="completed">Completed Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableQuizzes.length > 0 ? (
              availableQuizzes.map(renderQuizCard)
            ) : (
              <p className="text-center text-muted-foreground py-8">No available quizzes at the moment.</p>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedQuizzes.length > 0 ? (
              completedQuizzes.map(renderQuizCard)
            ) : (
              <p className="text-center text-muted-foreground py-8">You have not completed any quizzes yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Quizzes;
