
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
import { Plus, Search, Filter, Eye, CheckCircle, Clock, FileText, Download, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

const ManageAssignments = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const form = useForm();

  const pendingSubmissions = [
    {
      id: 1,
      studentName: "Alex Johnson",
      studentEmail: "alex@email.com",
      assignmentTitle: "React Components Project",
      course: "Complete Web Development Bootcamp",
      submittedDate: "2024-01-15",
      submittedTime: "14:30",
      fileUrl: "#",
      description: "Built a complete todo app with React hooks and context API",
      status: "pending"
    },
    {
      id: 2,
      studentName: "Sarah Miller",
      studentEmail: "sarah@email.com",
      assignmentTitle: "Data Analysis Report",
      course: "Machine Learning Fundamentals",
      submittedDate: "2024-01-14",
      submittedTime: "16:45",
      fileUrl: "#",
      description: "Analyzed customer behavior data using Python and pandas",
      status: "pending"
    }
  ];

  const checkedSubmissions = [
    {
      id: 3,
      studentName: "Mike Wilson",
      studentEmail: "mike@email.com",
      assignmentTitle: "Marketing Campaign Analysis",
      course: "Digital Marketing Mastery",
      submittedDate: "2024-01-12",
      checkedDate: "2024-01-13",
      score: 85,
      feedback: "Great analysis! Consider exploring more demographic data.",
      status: "checked"
    },
    {
      id: 4,
      studentName: "Emma Davis",
      studentEmail: "emma@email.com",
      assignmentTitle: "Portfolio Website",
      course: "Complete Web Development Bootcamp",
      submittedDate: "2024-01-10",
      checkedDate: "2024-01-11",
      score: 92,
      feedback: "Excellent work! Very professional design and clean code.",
      status: "checked"
    }
  ];

  const handleCheckAssignment = (assignmentId: number, score: number, feedback: string) => {
    console.log(`Checking assignment ${assignmentId} with score ${score} and feedback: ${feedback}`);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Assignments</h1>
            <p className="text-muted-foreground">Review submissions and upload new assignments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-neon">
                <Plus className="mr-2 h-4 w-4" />
                Upload Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Assignment</DialogTitle>
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
                        <FormLabel>Assignment Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter assignment title" {...field} />
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
                          <Textarea placeholder="Assignment description and requirements" {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="maxScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Score</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" className="btn-neon">Upload Assignment</Button>
                    <Button type="button" variant="outline">Cancel</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingSubmissions.length}</p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{checkedSubmissions.length}</p>
                <p className="text-sm text-muted-foreground">Checked Today</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search submissions..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({pendingSubmissions.length})</TabsTrigger>
            <TabsTrigger value="checked">Checked ({checkedSubmissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingSubmissions.map((submission) => (
              <Card key={submission.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{submission.assignmentTitle}</h3>
                      <p className="text-muted-foreground mb-1">Course: {submission.course}</p>
                      <p className="text-sm">
                        <span className="font-medium">Student:</span> {submission.studentName} ({submission.studentEmail})
                      </p>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-500">Pending Review</Badge>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Submission Description:</p>
                    <p className="text-sm text-muted-foreground">{submission.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Submitted: {new Date(submission.submittedDate).toLocaleDateString()} at {submission.submittedTime}</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Score (out of 100)</label>
                        <Input type="number" placeholder="85" className="mt-1" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Feedback</label>
                        <Textarea placeholder="Provide feedback to the student..." className="mt-1" rows={2} />
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" className="btn-neon">Submit Review</Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message Student
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="checked" className="space-y-4">
            {checkedSubmissions.map((submission) => (
              <Card key={submission.id} className="glass-card p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{submission.assignmentTitle}</h3>
                      <p className="text-muted-foreground mb-1">Course: {submission.course}</p>
                      <p className="text-sm">
                        <span className="font-medium">Student:</span> {submission.studentName} ({submission.studentEmail})
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500/20 text-green-500 mb-2">Checked</Badge>
                      <p className="text-2xl font-bold text-green-500">{submission.score}/100</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Feedback:</p>
                    <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Submitted: {new Date(submission.submittedDate).toLocaleDateString()}</span>
                    <span>Checked: {new Date(submission.checkedDate).toLocaleDateString()}</span>
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

export default ManageAssignments;
