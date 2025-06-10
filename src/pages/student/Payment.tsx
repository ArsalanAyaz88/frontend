import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, CreditCard, FileText, CheckCircle, Clock, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const location = useLocation();
  const { courseTitle, coursePrice } = location.state || {}; // Get data from navigation state

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
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6">Payment & Billing</h1>

        {courseTitle && coursePrice !== undefined && (
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Enrollment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-muted-foreground">You are enrolling in:</p>
                  <p className="text-lg font-semibold">{courseTitle}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">Price:</p>
                  <p className="text-2xl font-bold text-primary">{coursePrice > 0 ? `$${coursePrice}` : 'Free'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <Tabs defaultValue="card">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card">Pay with Card</TabsTrigger>
                  <TabsTrigger value="transfer">Bank Transfer</TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Credit/Debit Card Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="**** **** **** 1234" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="expiryMonth">Expiry Month</Label>
                        <Input id="expiryMonth" placeholder="MM" />
                      </div>
                      <div>
                        <Label htmlFor="expiryYear">Expiry Year</Label>
                        <Input id="expiryYear" placeholder="YYYY" />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" />
                      </div>
                    </div>
                    <Button className="w-full">Pay Now</Button>
                  </div>
                </TabsContent>
                <TabsContent value="transfer" className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Bank Transfer Details</h3>
                  <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
                    <p><strong>Bank Name:</strong> EduVerse National Bank</p>
                    <p><strong>Account Name:</strong> EduVerse Inc.</p>
                    <p><strong>Account Number:</strong> 123-456-7890</p>
                    <p><strong>IBAN:</strong> EV12 3456 7890 1234 5678</p>
                    <p><strong>SWIFT Code:</strong> EDUVUS33</p>
                  </div>
                  <div className="mt-6">
                    <Label htmlFor="proof" className="text-base font-semibold">Upload Payment Proof</Label>
                    <div className="mt-2 flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                          {uploadedFile ? (
                            <p className="font-semibold text-primary">{uploadedFile.name}</p>
                          ) : (
                            <>
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, or PDF (MAX. 5MB)</p>
                            </>
                          )}
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                    <Button className="w-full mt-4" onClick={handleSubmitProof} disabled={!uploadedFile}>Submit Proof</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingCourses.map(course => (
                  <div key={course.id} className="flex items-center space-x-4">
                    <img src={course.image} alt={course.title} className="h-16 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.price}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-muted">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Course</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-muted">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{payment.course}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{payment.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{payment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge className={`${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1.5">{payment.status}</span>
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Payment;
