import { useEffect, useState, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Check, BookOpen, Target, ListVideo, CheckCircle2, Circle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

// --- TYPES ---
interface CourseInfo {
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  difficulty_level: string | null;
  id: string;
}

interface VideoInfo {
  id: string;
  title: string;
  youtube_url: string;
  description: string | null;
  watched: boolean;
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
      const data = await fetcher(courseId);
      console.log('Received course data:', data);
      setContent(data[dataKey]);
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

  const getYouTubeEmbedUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } catch (e) {
        console.error("Invalid YouTube URL", e);
        return '';
    }
  }

  const handleToggleWatched = async (videoId: string) => {
    try {
      await fetchWithAuth(`/api/courses/videos/${videoId}/complete`, { method: 'POST' });
      
      setContent((prevContent: VideoInfo[]) =>
        prevContent.map(v =>
          v.id === videoId ? { ...v, watched: !v.watched } : v
        )
      );

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

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <p className="text-destructive p-4">{error}</p>;
  if (!content || (Array.isArray(content) && content.length === 0)) return <p className="p-4 text-muted-foreground">No information available.</p>;

  if (dataKey === 'videos' && Array.isArray(content)) {
    return (
      <div className="p-4 space-y-6">
        {(content as VideoInfo[]).map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{video.title}</CardTitle>
                  {video.description && <p className="text-muted-foreground text-sm mt-1">{video.description}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleToggleWatched(video.id)} className="shrink-0 ml-4">
                  {video.watched ? <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> : <Circle className="h-5 w-5 mr-2" />}
                  {video.watched ? 'Completed' : 'Mark as Complete'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative">
                <iframe
                  src={getYouTubeEmbedUrl(video.youtube_url)}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </CardContent>
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
const fetchDescription = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/description`).then(handleApiResponse);
const fetchOutcomes = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/outcomes`).then(handleApiResponse);
const fetchPrerequisites = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/prerequisites`).then(handleApiResponse);
const fetchCurriculum = (id: string) => fetchWithAuth(`/api/courses/courses/${id}/curriculum`).then(handleApiResponse);
const fetchVideos = (id: string) => fetchWithAuth(`/api/courses/my-courses/${id}/videos`).then(handleApiResponse);

// --- MAIN COMPONENT ---
const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!courseId) return;
        const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        // Fetch course details
        const courseDataPromise = fetchWithAuth(`/api/courses/explore-courses/${courseId}`).then(handleApiResponse);
        // Fetch enrollment status
        const enrollmentStatusPromise = fetchWithAuth(`/api/courses/my-courses/${courseId}/enrollment-status`).then(handleApiResponse);

        const [courseData, enrollmentStatus] = await Promise.all([
          courseDataPromise,
          enrollmentStatusPromise
        ]);

        console.log('Received course data (initial fetch):', courseData);
        setCourse(courseData);
        setIsEnrolled(enrollmentStatus.is_enrolled);

      } catch (err: any) {
        console.error("Failed to fetch course data", err);
        if (err instanceof UnauthorizedError) {
          navigate('/login');
        } else {
           // It's possible the enrollment check fails for non-enrolled users, which is okay.
           // We'll proceed with just the course data if it's available.
           try {
             const courseData = await fetchWithAuth(`/api/courses/explore-courses/${courseId}`).then(handleApiResponse);
             console.log('Received course data (fallback fetch):', courseData);
             setCourse(courseData);
           } catch (finalErr) {
             setError("Could not load course details. Please try again.");
           }
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
                <Button size="lg" className="w-full font-bold text-lg" onClick={handleEnrollNow}>Enroll Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
