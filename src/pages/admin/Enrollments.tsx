
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Check, X, Clock, User, BookOpen, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminEnrollments = () => {
  const { toast } = useToast();

  const pendingEnrollments = [
    {
      id: 1,
      studentName: "John Smith",
      studentEmail: "john.smith@email.com",
      course: "Complete Web Development Bootcamp",
      requestDate: "2024-01-15",
      paymentProof: "payment_receipt_001.pdf",
      amount: "$89",
      studentAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 2,
      studentName: "Emma Wilson",
      studentEmail: "emma.wilson@email.com",
      course: "Machine Learning Fundamentals",
      requestDate: "2024-01-14",
      paymentProof: "payment_receipt_002.pdf",
      amount: "$129",
      studentAvatar: "https://images.unsplash.com/photo-1494790108755-2616b6242b6c?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 3,
      studentName: "David Brown",
      studentEmail: "david.brown@email.com",
      course: "Digital Marketing Mastery",
      requestDate: "2024-01-13",
      paymentProof: "payment_receipt_003.pdf",
      amount: "$69",
      studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
    }
  ];

  const recentEnrollments = [
    {
      id: 4,
      studentName: "Sarah Johnson",
      studentEmail: "sarah.johnson@email.com",
      course: "Complete Web Development Bootcamp",
      enrolledDate: "2024-01-12",
      status: "approved",
      amount: "$89",
      studentAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 5,
      studentName: "Mike Davis",
      studentEmail: "mike.davis@email.com",
      course: "Machine Learning Fundamentals",
      enrolledDate: "2024-01-11",
      status: "approved",
      amount: "$129",
      studentAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 6,
      studentName: "Lisa Anderson",
      studentEmail: "lisa.anderson@email.com",
      course: "Digital Marketing Mastery",
      enrolledDate: "2024-01-10",
      status: "rejected",
      amount: "$69",
      reason: "Invalid payment proof",
      studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
    }
  ];

  const handleApproveEnrollment = (enrollmentId: number, studentName: string) => {
    toast({
      title: "Enrollment Approved",
      description: `${studentName}'s enrollment request has been approved.`,
    });
  };

  const handleRejectEnrollment = (enrollmentId: number, studentName: string) => {
    toast({
      title: "Enrollment Rejected",
      description: `${studentName}'s enrollment request has been rejected.`,
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Enrollments</h1>
            <p className="text-muted-foreground">Manage student enrollment requests and approvals</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingEnrollments.length}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {recentEnrollments.filter(e => e.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">Approved Today</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {recentEnrollments.filter(e => e.status === 'rejected').length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected Today</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {pendingEnrollments.length + recentEnrollments.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search enrollments..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingEnrollments.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent Actions ({recentEnrollments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-start space-x-6">
                  <img 
                    src={enrollment.studentAvatar}
                    alt={enrollment.studentName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold">{enrollment.studentName}</h3>
                        <p className="text-muted-foreground">{enrollment.studentEmail}</p>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-500">
                        Pending Review
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{enrollment.course}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Requested: {new Date(enrollment.requestDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount: </span>
                        <span className="font-medium text-green-500">{enrollment.amount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Payment Proof:</span>
                        <Button variant="link" className="p-0 h-auto text-primary">
                          {enrollment.paymentProof}
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRejectEnrollment(enrollment.id, enrollment.studentName)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          className="btn-neon" 
                          size="sm"
                          onClick={() => handleApproveEnrollment(enrollment.id, enrollment.studentName)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {recentEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="glass-card p-6">
                <div className="flex items-start space-x-6">
                  <img 
                    src={enrollment.studentAvatar}
                    alt={enrollment.studentName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold">{enrollment.studentName}</h3>
                        <p className="text-muted-foreground">{enrollment.studentEmail}</p>
                      </div>
                      <Badge className={getStatusColor(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{enrollment.course}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Processed: {new Date(enrollment.enrolledDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount: </span>
                        <span className="font-medium text-green-500">{enrollment.amount}</span>
                      </div>
                    </div>

                    {enrollment.status === 'rejected' && enrollment.reason && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-sm text-red-400">
                          <strong>Rejection Reason:</strong> {enrollment.reason}
                        </p>
                      </div>
                    )}
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

export default AdminEnrollments;
