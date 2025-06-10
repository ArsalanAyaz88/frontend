''
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Play, Search, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define types for our data
interface EnrolledCourse {
  id: string;
  title: string;
  // Assuming the API might not send these, making them optional
  instructor?: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  thumbnail_url?: string;
}

// Corrected type to match API response
interface ExploreCourse {
  id: string;
  title: string;
  price: number;
  thumbnail_url: string | null;
}

const Courses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [exploreCourses, setExploreCourses] = useState<ExploreCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [enrolledRes, exploreRes] = await Promise.all([
          fetch('/api/courses/my-courses', { headers }),
          fetch('/api/courses/explore-courses', { headers }),
        ]);

        if (!enrolledRes.ok) {
          const errorData = await enrolledRes.json();
          throw new Error(`Failed to fetch enrolled courses: ${errorData.detail || enrolledRes.statusText}`);
        }
        if (!exploreRes.ok) {
            const errorData = await exploreRes.json();
            throw new Error(`Failed to fetch explore courses: ${errorData.detail || exploreRes.statusText}`);
        }

        const enrolledData = await enrolledRes.json();
        const exploreData = await exploreRes.json();

        setEnrolledCourses(enrolledData);
        setExploreCourses(exploreData);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: err.message || "Could not fetch course data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  if (isLoading) {
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

  return (
    <DashboardLayout userType="student">
      <div className="px-4 py-6 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Courses</h1>
          <div className="flex space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search courses..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>
            <TabsTrigger value="explore">Explore Courses</TabsTrigger>
          </TabsList>
          <TabsContent value="enrolled">
            {enrolledCourses.length > 0 ? (
              <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl">
                    <Link to={`/student/courses/${course.id}`}>
                      <img src={course.thumbnail_url || `https://placehold.co/600x400/000000/FFFFFF?text=${course.title.split(' ')[0]}`} alt={course.title} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2 h-14">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">By {course.instructor || 'Instructor'}</p>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{course.completedLessons || 0}/{course.totalLessons || 'N/A'} Lessons</span>
                            </div>
                            <Progress value={course.progress || 0} className="w-full" />
                        </div>
                        <Button className="w-full btn-neon">
                          <Play className="mr-2 h-4 w-4" />
                          Continue Learning
                        </Button>
                      </div>
                    </Link>
                  </Card>
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
             {exploreCourses.length > 0 ? (
              <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                {exploreCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl">
                     <Link to={`/student/courses/${course.id}`}>
                      <img src={course.thumbnail_url || `https://placehold.co/600x400/3b82f6/FFFFFF?text=Explore`} alt={course.title} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2 h-14">{course.title}</h3>
                        <div className="flex justify-between items-center mt-4">
                          <Badge variant="outline">Explore</Badge>
                          <span className="text-xl font-bold text-primary">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                        </div>
                      </div>
                    </Link>
                  </Card>
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
