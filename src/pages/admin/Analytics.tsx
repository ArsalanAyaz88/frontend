
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Users, BookOpen, DollarSign, Clock, Download, Filter } from "lucide-react";

const Analytics = () => {
  const overviewStats = [
    {
      title: "Total Revenue",
      value: "$127,430",
      change: "+18.2%",
      trend: "up",
      period: "vs last month"
    },
    {
      title: "Active Students",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      period: "vs last month"
    },
    {
      title: "Course Completion",
      value: "87.3%",
      change: "+5.1%",
      trend: "up",
      period: "vs last month"
    },
    {
      title: "Avg. Study Time",
      value: "4.2 hrs",
      change: "-2.3%",
      trend: "down",
      period: "vs last month"
    }
  ];

  const topCourses = [
    {
      title: "Complete Web Development Bootcamp",
      students: 1245,
      revenue: "$124,500",
      completion: 89,
      rating: 4.9
    },
    {
      title: "Machine Learning Fundamentals",
      students: 890,
      revenue: "$89,000",
      completion: 76,
      rating: 4.8
    },
    {
      title: "Digital Marketing Mastery",
      students: 567,
      revenue: "$56,700",
      completion: 92,
      rating: 4.7
    },
    {
      title: "UI/UX Design Principles",
      students: 423,
      revenue: "$42,300",
      completion: 81,
      rating: 4.9
    }
  ];

  const recentActivity = [
    { action: "New student enrollment", course: "Web Development Bootcamp", time: "2 min ago" },
    { action: "Course completed", course: "Digital Marketing", time: "15 min ago" },
    { action: "Payment received", course: "Machine Learning", time: "1 hour ago" },
    { action: "New course published", course: "Advanced React", time: "3 hours ago" },
    { action: "Student feedback submitted", course: "UI/UX Design", time: "5 hours ago" }
  ];

  const monthlyData = [
    { month: "Jan", revenue: 85000, students: 450, courses: 12 },
    { month: "Feb", revenue: 92000, students: 520, courses: 14 },
    { month: "Mar", revenue: 78000, students: 480, courses: 13 },
    { month: "Apr", revenue: 105000, students: 680, courses: 16 },
    { month: "May", revenue: 118000, students: 750, courses: 18 },
    { month: "Jun", revenue: 127000, students: 820, courses: 20 }
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Monitor your platform's performance and insights</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button className="btn-neon">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat) => (
            <Card key={stat.title} className="glass-card p-6 hover:neon-glow transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <div className="flex items-center space-x-1">
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.period}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="students">Student Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Revenue Chart Placeholder */}
              <div className="lg:col-span-2">
                <Card className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Revenue Trend</h3>
                    <Badge variant="outline">Last 6 months</Badge>
                  </div>
                  <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Revenue Chart Visualization</p>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.course}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Top Performing Courses</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{course.title}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{course.students}</span>
                          </span>
                        </div>
                        <div>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{course.revenue}</span>
                          </span>
                        </div>
                        <div>
                          <span>{course.completion}% completion</span>
                        </div>
                        <div>
                          <span>★ {course.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Student Engagement</h3>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Student Engagement Chart</p>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Course Completion Rate</span>
                    <span className="text-sm font-medium">87.3%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '87.3%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assignment Submission</span>
                    <span className="text-sm font-medium">92.1%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92.1%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quiz Performance</span>
                    <span className="text-sm font-medium">78.9%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78.9%' }} />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                <div className="space-y-3">
                  {monthlyData.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{month.month}</span>
                      <div className="text-right">
                        <p className="font-medium">${month.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{month.students} students</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Course Sales</span>
                    <span className="text-sm font-medium">$98,340 (77%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '77%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Subscriptions</span>
                    <span className="text-sm font-medium">$21,290 (17%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '17%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Certifications</span>
                    <span className="text-sm font-medium">$7,800 (6%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '6%' }} />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
