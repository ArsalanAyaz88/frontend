import { useEffect, useState, FC } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, CheckCircle, Lock } from 'lucide-react';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// --- TYPE DEFINITIONS ---
interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  order: number;
  is_preview: boolean;
  watched: boolean;
  quiz_status: 'not_taken' | 'passed' | 'failed';
  is_accessible: boolean;
}



// --- MAIN COMPONENT ---
const MyCourseDetail: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();

  // --- State ---
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseVideos = async () => {
      setIsLoading(true);
      try {
        const videoData = await fetchWithAuth(`/api/courses/my-courses/${courseId}/videos-with-progress`).then(res => handleApiResponse<Video[]>(res));
        setVideos(videoData);
        if (videoData.length > 0) {
          const firstAccessibleVideo = videoData.find((v: Video) => v.is_accessible);
          setSelectedVideo(firstAccessibleVideo || videoData[0]);
        }
      } catch (err) {
        console.error('Failed to fetch course videos:', err);
        setError('Failed to load course content.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseVideos();
  }, [courseId]);

  const handleVideoSelect = (video: Video) => {
    if (!video.is_accessible) {
      toast({
        title: 'Video Locked',
        description: 'You must complete the previous video and pass its quiz to unlock this one.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedVideo(video);
  };

  const handleMarkAsComplete = async () => {
    if (!selectedVideo) return;

    try {
      await fetchWithAuth(`/api/courses/videos/${selectedVideo.id}/complete`, { method: 'POST' });
      setVideos(prevVideos =>
        prevVideos.map(v => (v.id === selectedVideo.id ? { ...v, watched: true } : v))
      );
      toast({ title: 'Progress Saved', description: 'Video marked as complete.' });

      // Refresh video accessibility
      const videoData = await fetchWithAuth(`/api/courses/my-courses/${courseId}/videos-with-progress`).then(res => handleApiResponse<Video[]>(res));
      setVideos(videoData);

    } catch (error) {
      console.error('Failed to mark video as complete:', error);
      toast({ title: 'Error', description: 'Could not save your progress.', variant: 'destructive' });
    }
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <DashboardLayout userType="student"><div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin" /></div></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout userType="student"><div className="text-center text-red-500 p-8">{error}</div></DashboardLayout>;
  }

  return (
    <DashboardLayout userType="student">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player and Details */}
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedVideo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg mb-4">
                    <iframe
                      className="w-full h-full"
                      src={selectedVideo.url.replace('watch?v=', 'embed/')}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-muted-foreground mb-4">{selectedVideo.description}</p>
                  <Button onClick={handleMarkAsComplete} disabled={selectedVideo.watched}>
                    {selectedVideo.watched ? <CheckCircle className="mr-2" /> : null}
                    {selectedVideo.watched ? 'Completed' : 'Mark as Complete'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <p>Select a video to start learning.</p>
            )}
          </div>

          {/* Video Playlist */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {videos.map(video => (
                    <li key={video.id}>
                      <Button
                        variant={selectedVideo?.id === video.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start h-auto py-2 px-3 text-left"
                        onClick={() => handleVideoSelect(video)}
                        disabled={!video.is_accessible}
                      >
                        {video.is_accessible ? (
                          video.watched ? (
                            <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                          ) : (
                            <PlayCircle className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                          )
                        ) : (
                          <Lock className="h-5 w-5 mr-3 text-red-500 flex-shrink-0" />
                        )}
                        <span className='flex-grow'>{video.title}</span>
                      </Button>
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
