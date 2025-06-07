
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, BookOpen, TrendingUp, DollarSign, Play, Eye, MessageCircle, Bell, CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { icon: Users, label: "Total Students", value: "2,847", growth: "+12%", color: "text-blue-500" },
    { icon: BookOpen, label: "Active Courses", value: "24", growth: "+3", color: "text-green-500" },
    { icon: TrendingUp, label: "Completion Rate", value: "87%", growth: "+5%", color: "text-purple-500" },
    { icon: DollarSign, label: "Revenue", value: "$45,230", growth: "+18%", color: "text-yellow-500" }
  ];

  const recentCourses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      students: 1245,
      progress: 89,
      revenue: "$12,450",
      status: "active",
      instructor: "Sarah Johnson"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      students: 890,
      progress: 76,
      revenue: "$8,900",
      status: "active",
      instructor: "Dr. Michael Chen"
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      students: 567,
      progress: 92,
      revenue: "$5,670",
      status: "completed",
      instructor: "Emma Williams"
    }
  ];

  const recentStudents = [
    {
      name: "Alex Johnson",
      email: "alex@email.com",
      joinDate: "2024-01-10",
      courses: 3,
      progress: 75,
      status: "active"
    },
    {
      name: "Sarah Miller",
      email: "sarah@email.com",
      joinDate: "2024-01-09",
      courses: 2,
      progress: 45,
      status: "active"
    },
    {
      name: "Mike Wilson",
      email: "mike@email.com",
      joinDate: "2024-01-08",
      courses: 1,
      progress: 100,
      status: "completed"
    }
  ];

  const notifications = [
    { 
      id: 1,
      type: "assignment", 
      title: "New Assignment Submission",
      message: "Alex Johnson submitted 'React Components Project'", 
      time: "2 min ago",
      priority: "high",
      action: "Review Now"
    },
    { 
      id: 2,
      type: "quiz", 
      title: "Quiz Completed",
      message: "Sarah Miller completed 'JavaScript Fundamentals Quiz' - Score: 85%", 
      time: "15 min ago",
      priority: "medium",
      action: "View Results"
    },
    { 
      id: 3,
      type: "enrollment", 
      title: "New Enrollment Request",
      message: "Mike Wilson requested enrollment in ML Fundamentals", 
      time: "1 hour ago",
      priority: "high",
      action: "Review"
    },
    { 
      id: 4,
      type: "payment", 
      title: "Payment Received",
      message: "Emma Davis paid for Digital Marketing course", 
      time: "2 hours ago",
      priority: "low",
      action: "Confirm"
    },
    { 
      id: 5,
      type: "question", 
      title: "Student Question",
      message: "John Smith asked about React Hooks lesson", 
      time: "3 hours ago",
      priority: "medium",
      action: "Reply"
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return FileText;
      case 'quiz': return CheckCircle;
      case 'enrollment': return Users;
      case 'payment': return DollarSign;
      case 'question': return MessageCircle;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-500/5';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low': return 'border-l-green-500 bg-green-500/5';
      default: return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  const pendingAssignments = 12;
  const pendingQuizzes = 8;
  const pendingEnrollments = 5;
  const unreadNotifications = notifications.filter(n => n.priority === 'high').length;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notifications Icon */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 max-h-96 overflow-y-auto" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <Badge className="bg-red-500/20 text-red-500">
                      {unreadNotifications} urgent
                    </Badge>
                  </div>
                  
                  {notifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <p className="text-sm font-medium">{notification.title}</p>
                          </div>
                          <Badge 
                            variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                          <Button variant="ghost" size="sm" className="text-xs h-6">
                            {notification.action}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Button variant="outline" className="w-full" size="sm">
                    View All Notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Site
            </Button>
            <Button className="btn-neon">
              <BookOpen className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </div>
        </div>

        {/* Priority Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Alert className="border-orange-500/50 bg-orange-500/10">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription>
              <strong>{pendingAssignments}</strong> assignments waiting for review
            </AlertDescription>
          </Alert>
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Clock className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              <strong>{pendingQuizzes}</strong> quiz results to check
            </AlertDescription>
          </Alert>
          <Alert className="border-purple-500/50 bg-purple-500/10">
            <Users className="h-4 w-4 text-purple-500" />
            <AlertDescription>
              <strong>{pendingEnrollments}</strong> enrollment requests pending
            </AlertDescription>
          </Alert>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass-card p-6 hover:neon-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-green-500 mt-1">{stat.growth}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Performance */}
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Course Performance</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{course.title}</h4>
                      <Badge 
                        className={course.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}
                      >
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">by {course.instructor}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Students: </span>
                        <span className="font-medium">{course.students}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue: </span>
                        <span className="font-medium text-green-500">{course.revenue}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Progress: </span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                    </div>
                    <Progress value={course.progress} className="h-2 mt-2" />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Students */}
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Recent Students</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentStudents.map((student, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{student.name}</h4>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-muted-foreground">{student.courses} courses</span>
                      <Badge 
                        className={student.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}
                      >
                        {student.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      Joined {new Date(student.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
