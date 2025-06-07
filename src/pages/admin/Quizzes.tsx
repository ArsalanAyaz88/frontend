
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
import { Plus, Search, Filter, Edit, Trash2, Clock, Users, CheckCircle, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

const AdminQuizzes = () => {
  const [activeTab, setActiveTab] = useState("quizzes");
  const form = useForm();

  const quizzes = [
    {
      id: 1,
      title: "JavaScript Fundamentals Quiz",
      course: "Complete Web Development Bootcamp",
      questions: 15,
      duration: 30,
      attempts: 142,
      avgScore: 78,
      status: "published",
      createdDate: "2024-01-10"
    },
    {
      id: 2,
      title: "Machine Learning Basics",
      course: "Machine Learning Fundamentals",
      questions: 20,
      duration: 45,
      attempts: 89,
      avgScore: 82,
      status: "published",
      createdDate: "2024-01-08"
    },
    {
      id: 3,
      title: "React Components Quiz",
      course: "Complete Web Development Bootcamp",
      questions: 12,
      duration: 25,
      attempts: 0,
      avgScore: 0,
      status: "draft",
      createdDate: "2024-01-15"
    }
  ];

  const assignments = [
    {
      id: 1,
      title: "Build a Todo App",
      course: "Complete Web Development Bootcamp",
      submissions: 98,
      pending: 15,
      avgScore: 85,
      status: "published",
      dueDate: "2024-02-15"
    },
    {
      id: 2,
      title: "Data Analysis Project",
      course: "Machine Learning Fundamentals",
      submissions: 67,
      pending: 8,
      avgScore: 88,
      status: "published",
      dueDate: "2024-02-20"
    },
    {
      id: 3,
      title: "Marketing Campaign Analysis",
      course: "Digital Marketing Mastery",
      submissions: 45,
      pending: 12,
      avgScore: 79,
      status: "published",
      dueDate: "2024-02-10"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-500';
      case 'draft': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quizzes & Assignments</h1>
            <p className="text-muted-foreground">Create and manage course assessments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-neon">
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create Assessment</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="assignment">Assignment</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter title" {...field} />
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
                          <Textarea placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-2">
                    <Button type="submit" className="btn-neon">Create</Button>
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
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quizzes.length}</p>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">Assignments</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {assignments.reduce((sum, assignment) => sum + assignment.pending, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assessments..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="quizzes">Quizzes ({quizzes.length})</TabsTrigger>
            <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold">{quiz.title}</h3>
                      <Badge className={getStatusColor(quiz.status)}>
                        {quiz.status}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground">Course: {quiz.course}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Questions: </span>
                        <span className="font-medium">{quiz.questions}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="font-medium">{quiz.duration} min</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Attempts: </span>
                        <span className="font-medium">{quiz.attempts}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Score: </span>
                        <span className="font-medium">{quiz.avgScore}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created: </span>
                        <span className="font-medium">{new Date(quiz.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold">{assignment.title}</h3>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground">Course: {assignment.course}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Submissions: </span>
                        <span className="font-medium">{assignment.submissions}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pending: </span>
                        <span className="font-medium text-orange-500">{assignment.pending}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Score: </span>
                        <span className="font-medium">{assignment.avgScore}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due Date: </span>
                        <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status: </span>
                        <span className="font-medium text-green-500">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Review Submissions</Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default AdminQuizzes;
