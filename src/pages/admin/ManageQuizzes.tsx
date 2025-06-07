
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Eye, CheckCircle, Clock, HelpCircle, BarChart3, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

const ManageQuizzes = () => {
  const [activeTab, setActiveTab] = useState("results");
  const form = useForm();

  const quizResults = [
    {
      id: 1,
      studentName: "Alex Johnson",
      studentEmail: "alex@email.com",
      quizTitle: "JavaScript Fundamentals Quiz",
      course: "Complete Web Development Bootcamp",
      completedDate: "2024-01-15",
      completedTime: "14:30",
      score: 85,
      totalQuestions: 15,
      correctAnswers: 12,
      timeSpent: "22 min",
      status: "completed"
    },
    {
      id: 2,
      studentName: "Sarah Miller",
      studentEmail: "sarah@email.com",
      quizTitle: "Machine Learning Basics",
      course: "Machine Learning Fundamentals",
      completedDate: "2024-01-14",
      completedTime: "16:45",
      score: 78,
      totalQuestions: 20,
      correctAnswers: 15,
      timeSpent: "35 min",
      status: "completed"
    },
    {
      id: 3,
      studentName: "Mike Wilson",
      studentEmail: "mike@email.com",
      quizTitle: "React Components Quiz",
      course: "Complete Web Development Bootcamp",
      completedDate: "2024-01-13",
      completedTime: "10:15",
      score: 92,
      totalQuestions: 12,
      correctAnswers: 11,
      timeSpent: "18 min",
      status: "completed"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-500';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-500';
    return 'bg-red-500/20 text-red-500';
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Quizzes</h1>
            <p className="text-muted-foreground">Review quiz results and create new quizzes</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-neon">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <FormControl>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="web-dev">Complete Web Development Bootcamp</SelectItem>
                              <SelectItem value="ml">Machine Learning Fundamentals</SelectItem>
                              <SelectItem value="marketing">Digital Marketing Mastery</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiz Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter quiz title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Quiz description and instructions" {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="passingScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="60" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="attempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Attempts</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Add Questions</h4>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="mb-3">
                          <label className="text-sm font-medium">Question 1</label>
                          <Textarea placeholder="Enter your question here..." className="mt-1" rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Option A" />
                          <Input placeholder="Option B" />
                          <Input placeholder="Option C" />
                          <Input placeholder="Option D" />
                        </div>
                        <div className="mt-2">
                          <Select>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Correct Answer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a">Option A</SelectItem>
                              <SelectItem value="b">Option B</SelectItem>
                              <SelectItem value="c">Option C</SelectItem>
                              <SelectItem value="d">Option D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Add Another Question</Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" className="btn-neon">Create Quiz</Button>
                    <Button type="button" variant="outline">Save as Draft</Button>
                    <Button type="button" variant="outline">Cancel</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Active Quizzes</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quizResults.length}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)}%
                </p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">25</p>
                <p className="text-sm text-muted-foreground">Avg Time (min)</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search quiz results..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter by Course
          </Button>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="results">Quiz Results ({quizResults.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {quizResults.map((result) => (
              <Card key={result.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{result.quizTitle}</h3>
                      <p className="text-muted-foreground mb-1">Course: {result.course}</p>
                      <p className="text-sm">
                        <span className="font-medium">Student:</span> {result.studentName} ({result.studentEmail})
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getScoreBadge(result.score)}>{result.status}</Badge>
                      <p className={`text-3xl font-bold mt-2 ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Correct Answers</p>
                      <p className="font-medium">{result.correctAnswers}/{result.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Spent</p>
                      <p className="font-medium">{result.timeSpent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="font-medium">{new Date(result.completedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{result.completedTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message Student
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">90-100%</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-1/3 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">33%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">80-89%</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-2/3 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">67%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">70-79%</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-0 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">0%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Popular Quizzes</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">JavaScript Fundamentals</span>
                    <Badge>142 attempts</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">React Components</span>
                    <Badge>89 attempts</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">ML Basics</span>
                    <Badge>67 attempts</Badge>
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

export default ManageQuizzes;
