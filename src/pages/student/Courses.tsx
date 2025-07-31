import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play } from 'lucide-react';
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';
import DashboardLayout from "@/components/DashboardLayout";

interface EnrolledCourse {
  id: string;
  title: string;
  instructor?: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  thumbnail_url?: string;
  expiration_date?: string;
}

interface ExploreCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
}

const Courses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [exploreCourses, setExploreCourses] = useState<ExploreCourse[]>([]);
  const [isEnrolledLoading, setIsEnrolledLoading] = useState(true);
  const [isExploreLoading, setIsExploreLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debug: Check authentication status
    const checkAuth = () => {
      const adminToken = localStorage.getItem('admin_access_token');
      const userSessionString = localStorage.getItem('user');
      
      console.log('Auth Debug:', {
        adminToken: adminToken ? 'Present' : 'Not found',
        userSession: userSessionString ? 'Present' : 'Not found'
      });
      
      if (userSessionString) {
        try {
          const userSession = JSON.parse(userSessionString);
          console.log('User session:', {
            email: userSession.email,
            role: userSession.role,
            hasAccessToken: !!userSession.access_token,
            accessTokenLength: userSession.access_token?.length || 0
          });
        } catch (e) {
          console.error('Failed to parse user session:', e);
        }
      }
    };
    
    checkAuth();

    const fetchEnrolledCourses = async () => {
      try {
        setIsEnrolledLoading(true);
        console.log('Fetching enrolled courses...');
        const response = await fetchWithAuth('/api/courses/my-courses');
        console.log('Enrolled courses response:', response);
        const data = await handleApiResponse<EnrolledCourse[]>(response);
        console.log('Enrolled courses data:', data);
        setEnrolledCourses(data);
      } catch (err) {
        console.error('Failed to fetch enrolled courses:', err);
        if (err instanceof UnauthorizedError) {
          setError('Please log in to view your enrolled courses.');
        } else {
          setError('Failed to load enrolled courses.');
        }
      } finally {
        setIsEnrolledLoading(false);
      }
    };

    const fetchExploreCourses = async () => {
      try {
        setIsExploreLoading(true);
        console.log('Fetching explore courses...');
        const response = await fetchWithAuth('/api/courses/explore-courses');
        console.log('Explore courses response:', response);
        const data = await handleApiResponse<ExploreCourse[]>(response);
        console.log('Explore courses data:', data);
        setExploreCourses(data);
      } catch (err) {
        console.error('Failed to fetch explore courses:', err);
        if (err instanceof UnauthorizedError) {
          setError('Please log in to explore courses.');
        } else {
          setError('Failed to load explore courses.');
        }
      } finally {
        setIsExploreLoading(false);
      }
    };

    fetchEnrolledCourses();
    fetchExploreCourses();
  }, []);

  // Debug: Log current state
  console.log('Current state:', {
    enrolledCourses,
    exploreCourses,
    isEnrolledLoading,
    isExploreLoading,
    error
  });

  return (
    <DashboardLayout userType="student">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Courses</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <Tabs defaultValue="enrolled" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>
            <TabsTrigger value="explore">Explore Courses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrolled">
            {isEnrolledLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <Link to={`/student/courses/${course.id}`} key={course.id} className="block hover:no-underline">
                    <Card className="overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl h-full flex flex-col">
                      <img src={course.thumbnail_url || `https://placehold.co/600x400/000000/FFFFFF?text=${course.title.split(' ')[0]}`} alt={course.title} className="w-full h-48 object-cover" />
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold mb-2 h-14">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">By {course.instructor || 'Instructor'}</p>
                        
                        {course.expiration_date && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">Expires on:</p>
                            <p className="text-sm font-medium text-orange-600">
                              {new Date(course.expiration_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-auto">
                          <div className="mb-4">
                              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                  <span>Progress</span>
                                  <span>{course.completedLessons || 0}/{course.totalLessons || 'N/A'} Lessons</span>
                              </div>
                              <Progress value={course.progress || 0} className="w-full" />
                          </div>
                          <div className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium">
                            <Play className="mr-2 h-4 w-4" />
                            Continue Learning
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold">No Enrolled Courses</h3>
                <p className="text-muted-foreground mt-2">Start learning by exploring new courses.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="explore">
             {isExploreLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : exploreCourses.length > 0 ? (
              <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                {exploreCourses.map((course) => (
                  <Link to={`/student/courses/${course.id}`} key={course.id} className="block hover:no-underline">
                    <Card className="overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl h-full flex flex-col">
                      <img src={course.thumbnail_url || `https://placehold.co/600x400/3b82f6/FFFFFF?text=Explore`} alt={course.title} className="w-full h-48 object-cover" />
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold mb-2 h-14">{course.title}</h3>
                        <div className="flex justify-between items-center mt-auto">
                          <Badge variant="outline">Explore</Badge>
                          <span className="text-xl font-bold text-primary">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold">No Courses to Explore</h3>
                <p className="text-muted-foreground mt-2">We're adding new courses all the time. Check back soon!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Courses;