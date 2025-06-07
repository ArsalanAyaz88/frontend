
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Edit, Trash2, Users, DollarSign, Play, Eye } from "lucide-react";

const AdminCourses = () => {
  const allCourses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      instructor: "Sarah Johnson",
      students: 1245,
      revenue: "$12,450",
      status: "published",
      category: "Programming",
      rating: 4.9,
      lessons: 45,
      duration: "42 hours",
      createdDate: "2023-09-15",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      instructor: "Dr. Michael Chen",
      students: 890,
      revenue: "$8,900",
      status: "published",
      category: "AI & Data Science",
      rating: 4.8,
      lessons: 32,
      duration: "36 hours",
      createdDate: "2023-10-01",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      instructor: "Emma Williams",
      students: 567,
      revenue: "$5,670",
      status: "published",
      category: "Marketing",
      rating: 4.7,
      lessons: 28,
      duration: "28 hours",
      createdDate: "2023-10-15",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 4,
      title: "Advanced React Patterns",
      instructor: "Sarah Johnson",
      students: 0,
      revenue: "$0",
      status: "draft",
      category: "Programming",
      rating: 0,
      lessons: 0,
      duration: "0 hours",
      createdDate: "2024-01-10",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-500';
      case 'draft': return 'bg-yellow-500/20 text-yellow-500';
      case 'archived': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const publishedCourses = allCourses.filter(course => course.status === 'published');
  const draftCourses = allCourses.filter(course => course.status === 'draft');

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Course Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage your courses</p>
          </div>
          <Button className="btn-neon">
            <Plus className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedCourses.length}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Edit className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{draftCourses.length}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {publishedCourses.reduce((sum, course) => sum + course.students, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${publishedCourses.reduce((sum, course) => sum + parseInt(course.revenue.replace(/[$,]/g, '')), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Courses ({allCourses.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedCourses.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({draftCourses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allCourses.map((course) => (
              <Card key={course.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-center space-x-6">
                  <img 
                    src={course.image}
                    alt={course.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground">by {course.instructor}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Students: </span>
                        <span className="font-medium">{course.students.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue: </span>
                        <span className="font-medium text-green-500">{course.revenue}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating: </span>
                        <span className="font-medium">{course.rating || 'No ratings'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lessons: </span>
                        <span className="font-medium">{course.lessons}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                    </div>

                    {course.status === 'published' && course.students > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Enrollment Progress</span>
                          <span>{Math.round((course.students / 1500) * 100)}%</span>
                        </div>
                        <Progress value={(course.students / 1500) * 100} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="published" className="space-y-4">
            {publishedCourses.map((course) => (
              <Card key={course.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-center space-x-6">
                  <img 
                    src={course.image}
                    alt={course.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground">by {course.instructor}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Students: </span>
                        <span className="font-medium">{course.students.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue: </span>
                        <span className="font-medium text-green-500">{course.revenue}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating: </span>
                        <span className="font-medium">{course.rating}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lessons: </span>
                        <span className="font-medium">{course.lessons}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            {draftCourses.map((course) => (
              <Card key={course.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-center space-x-6">
                  <img 
                    src={course.image}
                    alt={course.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Continue Editing</Button>
                        <Button className="btn-neon" size="sm">Publish Course</Button>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground">by {course.instructor}</p>
                    <p className="text-sm text-muted-foreground">
                      Created on {new Date(course.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminCourses;
