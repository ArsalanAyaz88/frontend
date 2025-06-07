
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, TrendingUp, DollarSign, Play, Eye, MessageCircle } from "lucide-react";

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
    { type: "payment", message: "New payment received from Alex Johnson", time: "2 min ago" },
    { type: "review", message: "New 5-star review on ML Fundamentals course", time: "15 min ago" },
    { type: "question", message: "Student question on React Components lesson", time: "1 hour ago" },
    { type: "enrollment", message: "5 new students enrolled today", time: "2 hours ago" }
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="flex space-x-3">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Performance */}
          <div className="lg:col-span-2 space-y-6">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Students
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Check Messages
                </Button>
              </div>
            </Card>

            {/* Recent Notifications */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
