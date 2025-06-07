
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, CheckCircle, AlertTriangle } from "lucide-react";

const Assignments = () => {
  const pendingAssignments = [
    {
      id: 1,
      title: "React Component Project",
      course: "Complete Web Development Bootcamp",
      description: "Build a responsive portfolio website using React components",
      dueDate: "2024-01-15",
      priority: "high",
      estimatedTime: "4 hours",
      type: "Project"
    },
    {
      id: 2,
      title: "ML Algorithm Analysis",
      course: "Machine Learning Fundamentals",
      description: "Compare and analyze different machine learning algorithms",
      dueDate: "2024-01-18",
      priority: "medium",
      estimatedTime: "3 hours",
      type: "Report"
    },
    {
      id: 3,
      title: "CSS Grid Layout Exercise",
      course: "Complete Web Development Bootcamp",
      description: "Create responsive layouts using CSS Grid",
      dueDate: "2024-01-20",
      priority: "low",
      estimatedTime: "2 hours",
      type: "Exercise"
    }
  ];

  const submittedAssignments = [
    {
      id: 4,
      title: "JavaScript Functions Workshop",
      course: "Complete Web Development Bootcamp",
      submittedDate: "2024-01-10",
      grade: "A",
      feedback: "Excellent work! Your code is clean and well-documented.",
      type: "Exercise"
    },
    {
      id: 5,
      title: "Data Visualization Project",
      course: "Machine Learning Fundamentals",
      submittedDate: "2024-01-08",
      grade: "B+",
      feedback: "Good analysis, could improve chart readability.",
      type: "Project"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-500 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade.startsWith('B')) return 'text-blue-500';
    if (grade.startsWith('C')) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assignments</h1>
          <p className="text-muted-foreground">Track your assignments and submissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submittedAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
            </div>
          </Card>
          
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingAssignments.length + submittedAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Assignments</TabsTrigger>
            <TabsTrigger value="submitted">Submitted Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.map((assignment) => {
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;

              return (
                <Card key={assignment.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">{assignment.title}</h3>
                        <Badge variant="outline">{assignment.type}</Badge>
                        <Badge className={getPriorityColor(assignment.priority)}>
                          {assignment.priority}
                        </Badge>
                        {(isOverdue || isDueSoon) && (
                          <Badge variant="destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {isOverdue ? 'Overdue' : 'Due Soon'}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground">{assignment.course}</p>
                      <p className="text-foreground">{assignment.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Est. {assignment.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline">View Details</Button>
                      <Button className="btn-neon">Start Assignment</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold">{assignment.title}</h3>
                      <Badge variant="outline">{assignment.type}</Badge>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Submitted
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground">{assignment.course}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {new Date(assignment.submittedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Grade:</span>
                        <span className={`font-semibold ${getGradeColor(assignment.grade)}`}>
                          {assignment.grade}
                        </span>
                      </div>
                    </div>
                    
                    {assignment.feedback && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-1">Feedback:</p>
                        <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline">View Submission</Button>
                    <Button variant="outline">Download</Button>
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

export default Assignments;
