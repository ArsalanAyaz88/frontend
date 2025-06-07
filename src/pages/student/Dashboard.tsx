
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Clock, Target, Play, Star } from "lucide-react";

const Dashboard = () => {
  const enrolledCourses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      progress: 75,
      nextLesson: "React Hooks Deep Dive",
      instructor: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals", 
      progress: 45,
      nextLesson: "Neural Networks Introduction",
      instructor: "Dr. Michael Chen",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&q=80"
    }
  ];

  const stats = [
    { icon: BookOpen, label: "Courses Enrolled", value: "3", color: "text-blue-500" },
    { icon: Trophy, label: "Certificates Earned", value: "2", color: "text-yellow-500" },
    { icon: Clock, label: "Hours Learned", value: "127", color: "text-green-500" },
    { icon: Target, label: "Assignments Done", value: "24", color: "text-purple-500" }
  ];

  const upcomingAssignments = [
    { title: "React Component Project", course: "Web Development", dueDate: "2 days", priority: "high" },
    { title: "ML Algorithm Analysis", course: "Machine Learning", dueDate: "5 days", priority: "medium" },
    { title: "Marketing Case Study", course: "Digital Marketing", dueDate: "1 week", priority: "low" }
  ];

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Alex! 👋</h1>
          <p className="text-muted-foreground">Continue your learning journey and achieve your goals.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass-card p-6 hover:neon-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold">Continue Learning</h2>
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={course.image}
                      alt={course.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Next: {course.nextLesson}
                      </p>
                    </div>
                    <Button className="btn-neon">
                      <Play className="mr-2 h-4 w-4" />
                      Continue
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Assignments */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Assignments</h3>
              <div className="space-y-3">
                {upcomingAssignments.map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">{assignment.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Due in</p>
                      <p className={`text-sm font-medium ${
                        assignment.priority === 'high' ? 'text-red-500' :
                        assignment.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {assignment.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievement Spotlight */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Achievement</h3>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-semibold">JavaScript Master</h4>
                  <p className="text-sm text-muted-foreground">Completed all JavaScript fundamentals</p>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
