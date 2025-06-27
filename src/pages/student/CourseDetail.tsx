import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, PlayCircle, Loader2, Target, BookOpen, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';
import { Badge } from "@/components/ui/badge";

// Types
interface CourseDetailData {
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  difficulty_level: string | null;
  outcomes: string; // Stringified JSON array
  prerequisites: string; // Stringified JSON array
  id: string;
}

interface Video {
  id: string;
  youtube_url: string;
  title: string;
  description: string;
  watched: boolean;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [courseRes, videosRes] = await Promise.all([
          fetchWithAuth(`/api/explore-courses/${courseId}`),
          fetchWithAuth(`/api/my-courses/${courseId}/videos`)
        ]);

        const courseData = await handleApiResponse(courseRes);
        // Videos might not be available if not enrolled, so handle 404 gracefully
        const videosData = videosRes.ok ? await handleApiResponse(videosRes) : [];

        setCourse(courseData);
        setVideos(videosData);

        // Safely parse stringified JSON fields
        try {
          if (courseData.outcomes) setOutcomes(JSON.parse(courseData.outcomes));
          if (courseData.prerequisites) setPrerequisites(JSON.parse(courseData.prerequisites));
        } catch (parseError) {
          console.error("Failed to parse course metadata:", parseError);
          setOutcomes([]);
          setPrerequisites([]);
        }

      } catch (err: any) {
        if (err instanceof UnauthorizedError) {
          toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
          navigate('/login');
        } else {
          setError(err.message);
          toast({ title: "Error", description: err.message, variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, toast]);

  const handleMarkComplete = async (videoId: string) => {
    try {
        const response = await fetchWithAuth(`/api/courses/videos/${videoId}/complete`, {
            method: 'POST',
        });

        await handleApiResponse(response);

        setVideos(videos.map(v => v.id === videoId ? { ...v, watched: true } : v));
        toast({ title: "Success", description: "Video marked as complete!" });
    } catch (err: any) {
        if (err instanceof UnauthorizedError) {
          toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
          navigate('/login');
        } else {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    }
  };

  const handleEnrollNow = () => {
    if (course) {
      navigate(`/student/payment/${course.id}`);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">An Error Occurred</h2>
            <p className="text-muted-foreground">{error || 'Course not found.'}</p>
            <Button onClick={() => window.history.back()} className="mt-4">Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-3xl font-bold">{course.title}</CardTitle>
                    {course.difficulty_level && <Badge variant="secondary">{course.difficulty_level}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mt-2">{course.description}</p>
              </CardContent>
            </Card>

            {outcomes.length > 0 && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center"><Target className="mr-2 h-6 w-6" /> What you'll learn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                            {outcomes.map((outcome, index) => (
                                <li key={index} className="flex items-start">
                                    <Check className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                                    <span>{outcome}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {prerequisites.length > 0 && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center"><BookOpen className="mr-2 h-6 w-6" /> Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                            {prerequisites.map((prereq, index) => (
                                <li key={index}>{prereq}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                {videos.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                    {videos.map((video, index) => (
                        <AccordionItem value={`item-${index}`} key={video.id}>
                        <AccordionTrigger>
                            <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                {video.watched ? (
                                <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                                ) : (
                                <PlayCircle className="h-5 w-5 mr-3 text-muted-foreground" />
                                )}
                                <span>{video.title}</span>
                            </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className="mb-4 text-muted-foreground">{video.description}</p>
                            <div className="aspect-video mb-4">
                                <iframe 
                                    className="w-full h-full rounded-lg"
                                    src={`https://www.youtube.com/embed/${video.youtube_url.split('v=')[1]}`}
                                    title={video.title}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen>
                                </iframe>
                            </div>
                            {!video.watched && (
                            <Button onClick={() => handleMarkComplete(video.id)}>Mark as Complete</Button>
                            )}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                ) : (
                    <p className="text-muted-foreground">Course content is available after enrollment.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
                <img src={course.thumbnail_url || 'https://placehold.co/600x400'} alt={course.title} className="w-full h-auto rounded-t-lg" />
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-3xl font-bold text-center">{course.price > 0 ? `$${course.price}` : 'Free'}</h3>
                    <Button className="w-full btn-neon" onClick={handleEnrollNow}>Enroll Now</Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
