
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Mail, Eye, MoreHorizontal, Users, UserCheck, UserX, Clock } from "lucide-react";

const AdminStudents = () => {
  const allStudents = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      joinDate: "2023-09-15",
      lastActive: "2024-01-10",
      status: "active",
      courses: [
        { title: "Web Development Bootcamp", progress: 75, status: "in-progress" },
        { title: "Machine Learning Fundamentals", progress: 45, status: "in-progress" }
      ],
      totalCourses: 2,
      completedCourses: 0,
      totalSpent: "$218",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 2,
      name: "Sarah Miller",
      email: "sarah.miller@email.com",
      joinDate: "2023-10-01",
      lastActive: "2024-01-09",
      status: "active",
      courses: [
        { title: "Digital Marketing Mastery", progress: 100, status: "completed" },
        { title: "Web Development Bootcamp", progress: 30, status: "in-progress" }
      ],
      totalCourses: 2,
      completedCourses: 1,
      totalSpent: "$158",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b6242b6c?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      joinDate: "2023-11-15",
      lastActive: "2024-01-08",
      status: "active",
      courses: [
        { title: "Machine Learning Fundamentals", progress: 100, status: "completed" }
      ],
      totalCourses: 1,
      completedCourses: 1,
      totalSpent: "$129",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      joinDate: "2023-12-01",
      lastActive: "2023-12-15",
      status: "inactive",
      courses: [
        { title: "Web Development Bootcamp", progress: 15, status: "in-progress" }
      ],
      totalCourses: 1,
      completedCourses: 0,
      totalSpent: "$89",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-500';
      case 'suspended': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getCourseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500';
      case 'in-progress': return 'bg-blue-500/20 text-blue-500';
      case 'not-started': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const activeStudents = allStudents.filter(student => student.status === 'active');
  const inactiveStudents = allStudents.filter(student => student.status === 'inactive');

  const totalStudents = allStudents.length;
  const totalActiveStudents = activeStudents.length;
  const totalRevenue = allStudents.reduce((sum, student) => 
    sum + parseInt(student.totalSpent.replace(/[$,]/g, '')), 0
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Management</h1>
            <p className="text-muted-foreground">Monitor and manage your students</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalActiveStudents}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <UserX className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inactiveStudents.length}</p>
                <p className="text-sm text-muted-foreground">Inactive Students</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
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
              <Input placeholder="Search students..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Students ({totalStudents})</TabsTrigger>
            <TabsTrigger value="active">Active ({totalActiveStudents})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({inactiveStudents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allStudents.map((student) => (
              <Card key={student.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-start space-x-6">
                  <img 
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">{student.name}</h3>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span>Email: </span>
                        <span className="text-foreground">{student.email}</span>
                      </div>
                      <div>
                        <span>Total Spent: </span>
                        <span className="text-foreground font-medium">{student.totalSpent}</span>
                      </div>
                      <div>
                        <span>Joined: </span>
                        <span className="text-foreground">{new Date(student.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span>Last Active: </span>
                        <span className="text-foreground">{new Date(student.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Enrolled Courses ({student.totalCourses})</h4>
                        <span className="text-sm text-muted-foreground">
                          {student.completedCourses} completed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {student.courses.map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{course.title}</span>
                                <Badge className={getCourseStatusColor(course.status)}>
                                  {course.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Progress value={course.progress} className="h-2 flex-1" />
                                <span className="text-sm text-muted-foreground">{course.progress}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeStudents.map((student) => (
              <Card key={student.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-start space-x-6">
                  <img 
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">{student.name}</h3>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span>Email: </span>
                        <span className="text-foreground">{student.email}</span>
                      </div>
                      <div>
                        <span>Courses: </span>
                        <span className="text-foreground">{student.totalCourses} enrolled</span>
                      </div>
                      <div>
                        <span>Last Active: </span>
                        <span className="text-foreground">{new Date(student.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            {inactiveStudents.map((student) => (
              <Card key={student.id} className="glass-card p-6">
                <div className="flex items-start space-x-6">
                  <img 
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">{student.name}</h3>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Send Reminder</Button>
                        <Button className="btn-neon" size="sm">Re-engage</Button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span>Email: </span>
                        <span className="text-foreground">{student.email}</span>
                      </div>
                      <div>
                        <span>Last Active: </span>
                        <span className="text-foreground">{new Date(student.lastActive).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span>Days Inactive: </span>
                        <span className="text-foreground">
                          {Math.floor((new Date().getTime() - new Date(student.lastActive).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
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

export default AdminStudents;
