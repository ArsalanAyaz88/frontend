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
import { fetchWithAuth } from "@/lib/api";

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
  const [isEnrolledLoading, setIsEnrolledLoading] = useState(false);

  // Fetch explore courses on initial load
  useEffect(() => {
    const fetchExploreCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth('/api/courses/explore-courses');
        const data = await res.json();
        setExploreCourses(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: "Could not fetch courses to explore. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExploreCourses();
  }, [toast]);

  const fetchEnrolledCourses = async () => {
    // Prevent re-fetching if data already exists or is currently loading
    if (enrolledCourses.length > 0 || isEnrolledLoading) return;

    setIsEnrolledLoading(true);
    try {
      const res = await fetchWithAuth('/api/courses/my-courses');
      const data = await res.json();
      setEnrolledCourses(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Could not fetch your enrolled courses.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolledLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'enrolled') {
      fetchEnrolledCourses();
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

        <Tabs defaultValue="explore" onValueChange={handleTabChange} className="w-full">
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
                        <p className="text-sm text-muted-foreground mb-4">By {course.instructor || 'Instructor'}</p>
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
             {exploreCourses.length > 0 ? (
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
