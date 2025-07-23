import { useEffect, useState, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Check, BookOpen, Target, ListVideo, CheckCircle2, Circle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import Quiz from '@/components/Quiz';
import EducationForm from './EducationForm';

// --- TYPES ---
interface CourseInfo {
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  difficulty_level: string | null;
  id: string;
}

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface VideoInfo {
  id: string;
  title: string;
  url: string; // Changed from cloudinary_url
  description: string | null;
  order: number;
  watched: boolean; // Changed from completed
  is_accessible: boolean;
  quiz: QuizData | null;
  quiz_status: 'passed' | 'failed' | 'not_taken' | null;
}

interface EnrollmentStatus {
  is_enrolled: boolean;
}

interface TabContentProps {
  courseId: string;
  fetcher: (id: string) => Promise<any>;
  dataKey: string;
}

// --- DYNAMIC TAB COMPONENT ---
const DynamicTabContent: FC<TabContentProps> = ({ courseId, fetcher, dataKey }) => {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetcher(courseId);
      const data = await handleApiResponse(response);
      // The videos endpoint returns an array directly, not an object with a 'videos' key.
      const contentData = dataKey === 'videos' ? data : (data as Record<string, any>)[dataKey];
      setContent(contentData);
    } catch (err: any) {
      setError('Failed to load content. Please try refreshing.');
      console.error(`Failed to fetch ${dataKey}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [courseId, fetcher, dataKey]);



  const handleQuizSubmitSuccess = () => {
    toast({
      title: "Success",
      description: "Quiz submitted successfully! Your progress has been updated.",
    });
    loadContent(); // This is the key change: reload videos to unlock the next one
  };

  const handleToggleWatched = async (videoId: string) => {
    try {
      await fetchWithAuth(`/api/courses/videos/${videoId}/complete`, { method: 'POST' });
      
      // Reload content to get updated progress and accessibility
      loadContent();

      toast({
        title: "Success",
        description: "Video status updated.",
      });
    } catch (error) {
      console.error("Failed to update video status", error);
      toast({
        title: "Error",
        description: "Failed to update video status.",
        variant: "destructive",
      });
    }
  };

  const handleVideoSelect = (video: VideoInfo) => {
    if (!video.is_accessible) {
      toast({
        title: "Video Locked",
        description: "You must pass the previous quiz to unlock this video.",
        variant: "destructive",
      });
      return;
    }
    // setSelectedVideo(video);
    if (video.quiz) {
      console.log("This video has a quiz.");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <p className="text-destructive p-4">{error}</p>;
  if (!content || (Array.isArray(content) && content.length === 0)) return <p className="p-4 text-muted-foreground">No information available.</p>;

  if (dataKey === 'videos' && Array.isArray(content)) {
    return (
      <div className="p-4 space-y-6">
        {(content as VideoInfo[]).map((video) => (
          <Card key={video.id} className={`overflow-hidden ${!video.is_accessible ? 'bg-muted/50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {!video.is_accessible && <Lock className="h-6 w-6 mr-3 text-muted-foreground" />}
                  <div>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        {!video.is_accessible && <Lock className="h-5 w-5 mr-2 text-muted-foreground" />}
                        <span className={`text-xl font-semibold ${!video.is_accessible ? 'text-muted-foreground' : ''}`}>{video.title}</span>
                      </div>
                      {video.is_accessible && (
                        <button 
                          onClick={() => handleToggleWatched(video.id)} 
                          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          {video.watched ? 
                            <CheckCircle2 className="h-5 w-5 mr-1 text-green-500" /> : 
                            <Circle className="h-5 w-5 mr-1" />
                          }
                          {video.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
                        </button>
                      )}
                    </CardTitle>
                    {video.description && <p className="text-muted-foreground text-sm mt-1">{video.description}</p>}
                  </div>
                </div>
                {video.is_accessible && (
                  <Button variant="ghost" size="sm" onClick={() => handleVideoSelect(video)} className="shrink-0 ml-4">
                    Watch Video
                  </Button>
                )}
              </div>
            </CardHeader>
            {video.is_accessible && (
              <CardContent>
                <div className="mt-4 prose max-w-none prose-sm text-muted-foreground">
                  <p>{video.description}</p>
                </div>

                {/* Quiz Section */}
                {video.is_accessible && video.quiz && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2">Quiz: {video.quiz.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{video.quiz.description}</p>
                    <Quiz quiz={video.quiz} onQuizComplete={handleQuizSubmitSuccess} />
                  </div>
                )}
                {video.quiz_status === 'passed' && 
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Quiz Passed</Badge>
                }
                {video.quiz_status === 'failed' && 
                  <Badge variant="destructive">Quiz Failed - Retake available</Badge>
                }
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  }

  // Render content based on its type
  if (typeof content === 'string') {
    return <div className="p-4 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
  }
  if (Array.isArray(content)) {
    return (
      <ul className="space-y-3 p-4">
        {content.map((item, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
            <span>{typeof item === 'object' ? JSON.stringify(item) : item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="p-4 text-muted-foreground">Unsupported content format.</p>;
};

// --- API FETCHERS ---
const fetchDescription = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/description`);
const fetchOutcomes = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/outcomes`);
const fetchPrerequisites = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/prerequisites`);
const fetchCurriculum = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/curriculum`);
const fetchVideos = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/videos`);

const CourseDetail: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);

  // Check if user has already applied for this course (on mount)
  useEffect(() => {
    if (!courseId) return;
    const checkApplication = async () => {
      setCheckingApplication(true);
      try {
        const res = await fetch(`/api/apply/${courseId}`, { method: 'GET', credentials: 'include' });
        if (res.ok) {
          // User has already applied (API returns application)
          setHasApplied(true);
        } else {
          const data = await res.json().catch(() => ({}));
          if (res.status === 400 && (data.detail || '').includes('already applied')) {
            setHasApplied(true);
          } else {
            setHasApplied(false);
          }
        }
      } catch {
        setHasApplied(false);
      } finally {
        setCheckingApplication(false);
      }
    };
    checkApplication();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        // Fetch course details and explicitly type the response
        const courseDataPromise = fetchWithAuth(`/api/courses/explore-courses/${courseId}`)
          .then(res => handleApiResponse<CourseInfo>(res));

        // Fetch enrollment status and explicitly type the response
        const enrollmentStatusPromise = fetchWithAuth(`/api/courses/my-courses/${courseId}/enrollment-status`)
          .then(res => handleApiResponse<EnrollmentStatus>(res))
          .catch(error => {
            // If the enrollment status endpoint fails (e.g., 404 for non-enrolled user),
            // we'll assume the user is not enrolled and log the error.
            console.warn("Enrollment status check failed (this is expected if not enrolled):", error);
            return { is_enrolled: false }; // Ensure this matches the EnrollmentStatus structure
          });

        const [courseData, enrollmentStatus] = await Promise.all([
          courseDataPromise,
          enrollmentStatusPromise
        ]);

        setCourse(courseData);
        setIsEnrolled(enrollmentStatus.is_enrolled);

      } catch (err: any) {
        console.error("Failed to fetch course data", err);
        if (err instanceof UnauthorizedError) {
          navigate('/login');
        } else {
          setError("Could not load course details. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  const handleEnrollNow = () => {
    if (course) navigate(`/student/payment/${course.id}`);
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  if (error) return <div className="text-center py-10"><p className="text-destructive">{error}</p></div>;
  if (!course) return <div className="text-center py-10"><p>Course not found.</p></div>;

  return (
    <DashboardLayout userType="student">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Education Form Section */}
        {!isEnrolled && !hasApplied && !checkingApplication && (
          <EducationForm courseId={courseId!} onSuccess={() => setHasApplied(true)} />
        )}
        {!isEnrolled && hasApplied && (
          <div className="mb-6 p-4 border rounded-lg bg-green-50 text-green-800 font-semibold">
            Your application has been submitted and is pending approval.
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8 overflow-hidden">
              <CardHeader className="bg-muted/30 p-6">
                <Badge variant="outline" className="mb-2">{course.difficulty_level || 'All Levels'}</Badge>
                <CardTitle className="text-4xl font-extrabold tracking-tight">{course.title}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-5 rounded-none rounded-t-lg">
                  <TabsTrigger value="description"><BookOpen className="mr-2 h-4 w-4"/>Description</TabsTrigger>
                  <TabsTrigger value="outcomes"><Target className="mr-2 h-4 w-4"/>Outcomes</TabsTrigger>
                  <TabsTrigger value="prerequisites"><Check className="mr-2 h-4 w-4"/>Prerequisites</TabsTrigger>
                  <TabsTrigger value="curriculum"><ListVideo className="mr-2 h-4 w-4"/>Curriculum</TabsTrigger>
                  <TabsTrigger value="videos"><ListVideo className="mr-2 h-4 w-4"/>Videos</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <DynamicTabContent courseId={courseId!} fetcher={fetchDescription} dataKey="description" />
                </TabsContent>
                <TabsContent value="outcomes">
                  <DynamicTabContent courseId={courseId!} fetcher={fetchOutcomes} dataKey="outcomes" />
                </TabsContent>
                <TabsContent value="prerequisites">
                  <DynamicTabContent courseId={courseId!} fetcher={fetchPrerequisites} dataKey="prerequisites" />
                </TabsContent>
                <TabsContent value="curriculum">
                  <DynamicTabContent courseId={courseId!} fetcher={fetchCurriculum} dataKey="curriculum" />
                </TabsContent>
                <TabsContent value="videos">
                  {isEnrolled ? (
                    <DynamicTabContent courseId={courseId!} fetcher={fetchVideos} dataKey="videos" />
                  ) : (
                    <div className="p-8 text-center">
                      <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">Videos Locked</h3>
                      <p className="mt-2 text-sm text-muted-foreground">You must enroll in this course to access the videos.</p>
                      <Button className="mt-6" onClick={handleEnrollNow}>Enroll Now</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <img src={course.thumbnail_url ? course.thumbnail_url : 'https://placehold.co/600x400'} alt={course.title} className="w-full h-auto rounded-t-lg" />
              
              <CardContent className="p-6 space-y-4">
                <h3 className="text-4xl font-bold text-center text-primary">{course.price > 0 ? `$${course.price}` : 'Free'}</h3>
                {isEnrolled ? (
                  <div className="flex items-center justify-center font-bold text-lg bg-green-100 text-green-800 p-3 rounded-md">
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                    Enrolled
                  </div>
                ) : (
                  <Button size="lg" className="w-full font-bold text-lg" onClick={handleEnrollNow}>Enroll Now</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
