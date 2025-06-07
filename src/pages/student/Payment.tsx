
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, CreditCard, FileText, CheckCircle, Clock, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const paymentHistory = [
    {
      id: 1,
      course: "Complete Web Development Bootcamp",
      amount: "$89",
      date: "2024-01-01",
      status: "approved",
      transactionId: "TXN-001234",
      paymentMethod: "Bank Transfer"
    },
    {
      id: 2,
      course: "Machine Learning Fundamentals",
      amount: "$129",
      date: "2024-01-05",
      status: "pending",
      transactionId: "TXN-001235",
      paymentMethod: "PayPal"
    },
    {
      id: 3,
      course: "Digital Marketing Mastery",
      amount: "$69",
      date: "2024-01-03",
      status: "rejected",
      transactionId: "TXN-001236",
      paymentMethod: "Credit Card"
    }
  ];

  const pendingCourses = [
    {
      id: 1,
      title: "UI/UX Design Principles",
      price: "$89",
      instructor: "David Kim",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 2,
      title: "Python for Data Science",
      price: "$99",
      instructor: "Dr. Lisa Chen",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=200&q=80"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} is ready to upload.`,
      });
    }
  };

  const handleSubmitProof = () => {
    if (uploadedFile) {
      toast({
        title: "Payment Proof Submitted",
        description: "Your payment proof has been submitted for review.",
      });
      setUploadedFile(null);
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
          <p className="text-muted-foreground">Manage your course payments and upload payment proofs</p>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {paymentHistory.filter(p => p.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {paymentHistory.filter(p => p.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
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
                  {paymentHistory.filter(p => p.status === 'rejected').length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${paymentHistory.filter(p => p.status === 'approved').reduce((sum, p) => sum + parseInt(p.amount.replace('$', '')), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload Payment Proof</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="pending">Pending Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="glass-card p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload Payment Proof</h3>
                  <p className="text-muted-foreground">
                    Upload your payment receipt or transaction proof for course enrollment verification.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="course-select">Select Course</Label>
                      <select className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg">
                        <option value="">Choose a course...</option>
                        {pendingCourses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <select className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg">
                        <option value="">Select payment method...</option>
                        <option value="bank-transfer">Bank Transfer</option>
                        <option value="credit-card">Credit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="crypto">Cryptocurrency</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="transaction-id">Transaction ID</Label>
                      <Input 
                        id="transaction-id"
                        placeholder="Enter transaction ID"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount Paid</Label>
                      <Input 
                        id="amount"
                        placeholder="$0.00"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Upload Receipt/Proof</Label>
                      <div className="mt-1 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                          {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Any additional information about the payment..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Save Draft</Button>
                  <Button className="btn-neon" onClick={handleSubmitProof}>
                    <FileText className="mr-2 h-4 w-4" />
                    Submit Payment Proof
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {paymentHistory.map((payment) => (
              <Card key={payment.id} className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{payment.course}</h3>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span>Amount: <span className="font-medium text-foreground">{payment.amount}</span></span>
                      <span>Date: {new Date(payment.date).toLocaleDateString()}</span>
                      <span>Method: {payment.paymentMethod}</span>
                      <span>ID: {payment.transactionId}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View Receipt</Button>
                    {payment.status === 'rejected' && (
                      <Button size="sm" className="btn-neon">Resubmit</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingCourses.map((course) => (
              <Card key={course.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <img 
                    src={course.image}
                    alt={course.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">by {course.instructor}</p>
                    <p className="text-2xl font-bold text-primary">{course.price}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">View Details</Button>
                    <Button className="btn-neon">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
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

export default Payment;
