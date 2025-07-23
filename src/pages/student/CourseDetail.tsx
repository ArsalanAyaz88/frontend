import { useEffect, useState, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Loader2, Check, PlayCircle } from 'lucide-react';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';

// --- TYPE DEFINITIONS ---
// --- TYPE DEFINITIONS ---
interface VideoPreview {
  title: string;
  duration: number | null;
  is_preview: boolean;
}

interface CourseInfo {
  id: string;
  title: string;
  description: string;
  price: number;
  outcomes: string[] | string;
  curriculum: string[] | string;
  prerequisites: string[] | string;
  videos: VideoPreview[];
}

interface EnrollmentStatus {
  is_enrolled: boolean;
}

interface ApplicationStatusResponse {
  status: 'pending' | 'approved' | 'rejected';
}

// --- HELPER COMPONENT for rendering list content ---
const ContentRenderer: FC<{ content: any }> = ({ content }) => {
  if (!content) {
    return <p className="p-4 text-muted-foreground">No information provided.</p>;
  }

  const items = Array.isArray(content) ? content : String(content).split(/\r\n|\n|\r/);

  return (
    <ul className="space-y-3 p-4">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <Check className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
          <span>{typeof item === 'object' ? JSON.stringify(item) : item}</span>
        </li>
      ))}
    </ul>
  );
};

// --- MAIN COMPONENT ---
const CourseDetail: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // --- State ---
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'pending' | 'approved' | 'rejected' | 'not_applied' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const coursePromise = fetchWithAuth(`/api/courses/explore-courses/${courseId}`).then((res: Response) => handleApiResponse<CourseInfo>(res));
        const enrollmentPromise = fetchWithAuth(`/api/courses/my-courses/${courseId}/enrollment-status`).then((res: Response) => handleApiResponse<EnrollmentStatus>(res)).catch(() => ({ is_enrolled: false }));
        const applicationStatusPromise = fetchWithAuth(`/api/enrollments/application-status/${courseId}`)
          .then((res: Response) => handleApiResponse<ApplicationStatusResponse>(res))
          .catch((err: Error) => {
            if (err instanceof Error && err.message.includes('404')) {
              return { status: 'not_applied' as const };
            }
            throw err;
          });

        const [courseData, enrollmentData, applicationData] = await Promise.all([
          coursePromise,
          enrollmentPromise,
          applicationStatusPromise
        ]);

        setCourse(courseData);
        setIsEnrolled(enrollmentData.is_enrolled);
        setApplicationStatus(applicationData.status);

      } catch (err) {
        console.error("Failed to fetch course page data:", err);
        if (err instanceof Error && err.message.includes('401')) {
            navigate('/auth/login');
        }
        setError('Failed to load course details. Please try again later.');
        setApplicationStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [courseId, navigate]);

  // --- Render Logic for Enrollment Button/Status ---
  const renderEnrollmentAction = () => {
    if (isEnrolled) {
      return <p className="font-semibold text-center p-3 bg-green-100 text-green-700 rounded-md">You are enrolled in this course.</p>;
    }

    switch (applicationStatus) {
      case 'pending':
        return <p className="font-semibold text-center p-3 bg-yellow-100 text-yellow-700 rounded-md">Your application is under review.</p>;
      case 'rejected':
        return <p className="font-semibold text-center p-3 bg-red-100 text-red-700 rounded-md">Your application was not approved.</p>;
      case 'approved':
        return <Button onClick={() => navigate(`/payment/${courseId}`)} className="w-full font-bold py-3 text-lg">Enroll Now</Button>;
      case 'not_applied':
        return <Button onClick={() => navigate(`/enroll/${courseId}`)} className="w-full font-bold py-3 text-lg">Apply for Course</Button>;
      case 'error':
        return <p className="font-semibold text-center p-3 bg-red-100 text-red-700 rounded-md">Could not load application status.</p>;
      default:
        return <div className="h-[52px]"></div>; // Placeholder for button height
    }
  };

  // --- Early returns for loading/error states ---
  if (isLoading) {
    return <DashboardLayout userType="student"><div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin" /></div></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout userType="student"><div className="text-center text-red-500 p-8">{error}</div></DashboardLayout>;
  }

  if (!course) {
    return <DashboardLayout userType="student"><div className="text-center p-8">Course not found.</div></DashboardLayout>;
  }

  // --- Main Component Render ---
  return (
    <DashboardLayout userType="student">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{course.title}</h1>
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="outcomes">What You'll Learn</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-lg text-muted-foreground">{course.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="outcomes" className="mt-4">
                <Card>
                  <CardContent>
                    <ContentRenderer content={course.outcomes} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="curriculum" className="mt-4">
                <Card>
                  <CardContent>
                    <ContentRenderer content={course.curriculum} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="prerequisites" className="mt-4">
                <Card>
                  <CardContent>
                    <ContentRenderer content={course.prerequisites} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="videos" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    {course.videos && course.videos.length > 0 ? (
                      <ul className="space-y-4">
                        {course.videos.map((video, index) => (
                          <li key={index} className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center">
                              <PlayCircle className="h-5 w-5 mr-3 text-gray-400" />
                              <span className="font-medium">{video.title}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              {video.is_preview && (
                                <span className="text-xs font-semibold text-white bg-blue-500 px-2 py-1 rounded-full">
                                  Preview
                                </span>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {video.duration ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}` : 'N/A'}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No video previews available for this course.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Course Enrollment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-5xl font-bold">${course.price}</p>
                </div>
                <div className="mt-4">
                  {renderEnrollmentAction()}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
