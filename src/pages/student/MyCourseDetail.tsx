import { useEffect, useState, FC } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlayCircle, Lock, CheckCircle } from 'lucide-react';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';

// --- INTERFACES ---
interface Course {
  id: number;
  title: string;
  description: string;
}

interface Video {
  id: string;
  cloudinary_url: string;
  title: string;
  description: string;
  watched: boolean;
}

// --- MAIN COMPONENT ---
const MyCourseDetail: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // --- STATE ---
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // --- EFFECTS ---
  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        
        // Check if videos data was passed via navigation state
        const stateVideos = location.state?.videos as Video[];
        
        if (stateVideos && Array.isArray(stateVideos)) {
          // Use videos data from navigation state
          setVideos(stateVideos);
          if (stateVideos.length > 0) {
            setSelectedVideo(stateVideos[0]);
          }
        } else {
          // Fetch videos with checkpoint data using the new API endpoint
          const response = await fetchWithAuth(`/api/courses/my-courses/${courseId}/videos-with-checkpoint`);
          const videosData = await handleApiResponse<Video[]>(response);
          
          setVideos(videosData);
          
          // Set the first video as selected if available
          if (videosData.length > 0) {
            setSelectedVideo(videosData[0]);
          }
        }
        
        // For now, we'll create a basic course object since the API doesn't return course details
        // You might want to fetch course details from a separate endpoint if needed
        setCourse({
          id: parseInt(courseId),
          title: `Course ${courseId}`,
          description: 'Course description will be loaded from a separate endpoint if needed.'
        });
        
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, location.state]);

  useEffect(() => {
    if (!courseId) return;

    const fetchEnrollmentStatus = async () => {
      try {
        setStatusLoading(true);
        const response = await fetchWithAuth(`/api/courses/my-courses/${courseId}/enrollment-status`);
        const data = await handleApiResponse<{ status: string }>(response);
        setEnrollmentStatus(data.status);
      } catch (error) {
        console.error('Error fetching enrollment status:', error);
        // If the endpoint doesn't exist or returns 404, assume NOT_APPLIED
        setEnrollmentStatus('NOT_APPLIED');
      } finally {
        setStatusLoading(false);
      }
    };

    fetchEnrollmentStatus();
  }, [courseId]);

  // --- HANDLERS ---
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleMarkAsComplete = async () => {
    if (!selectedVideo) return;
    toast({ title: "Success", description: `${selectedVideo.title} marked as complete.` });
  };
  
  const apply_for_enrollment = () => {
      navigate(`/student/enrollment-application/${courseId}`);
  };

  // --- RENDER LOGIC ---
  const renderEnrollmentButton = () => {
    if (statusLoading) {
      return <div className="text-center"><Loader2 className="h-6 w-6 animate-spin inline-block" /></div>;
    }

    switch (enrollmentStatus) {
      case 'APPROVED':
        return (
          <Button onClick={() => navigate(`/student/payment/${courseId}`)} className="w-full bg-green-600 hover:bg-green-700">
            Enroll Now (Proceed to Payment)
          </Button>
        );
      case 'PENDING':
        return <p className="text-center font-semibold text-yellow-600">Your application is pending review.</p>;
      case 'REJECTED':
        return <p className="text-center font-semibold text-red-600">Your application has been rejected.</p>;
      case 'NOT_APPLIED':
      default:
        return (
          <Button onClick={apply_for_enrollment} className="w-full">
            Apply for Enrollment
          </Button>
        );
    }
  };

  if (isLoading) {
    return <DashboardLayout userType="student"><div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout userType="student"><div className="text-red-500 text-center p-8">{error}</div></DashboardLayout>;
  }

  return (
    <DashboardLayout userType="student">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {selectedVideo ? (
                  <div className="aspect-video">
                    <video
                      key={selectedVideo.id}
                      className="w-full h-full"
                      controls
                      src={selectedVideo.cloudinary_url}
                      title={selectedVideo.title}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <p>Select a video to begin.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-6">
                <h2 className="text-2xl font-bold mb-2">{selectedVideo?.title || course?.title}</h2>
                <p className="text-muted-foreground">{selectedVideo?.description || 'Select a video to see its description.'}</p>
                {selectedVideo && (
                    <Button onClick={handleMarkAsComplete} disabled={selectedVideo.watched} className="mt-4">
                        {selectedVideo.watched ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                        {selectedVideo.watched ? 'Completed' : 'Mark as Complete'}
                    </Button>
                )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{course?.title}</CardTitle>
                <p className="text-muted-foreground pt-1">{course?.description}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                    {renderEnrollmentButton()}
                </div>
                <h3 className="font-semibold mb-3">Course Content</h3>
                <ul className="space-y-2">
                  {videos.map((video) => (
                    <li
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedVideo?.id === video.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      {video.watched ? (
                        <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <PlayCircle className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="flex-grow">{video.title}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyCourseDetail;