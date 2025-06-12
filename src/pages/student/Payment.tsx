import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, FileText, CheckCircle, Clock, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// Interfaces
interface PurchaseInfo {
  course_title: string;
  course_price: number;
  bank_accounts: {
    bank_name: string;
    account_name: string;
    account_number: string;
  }[];
}

interface Enrollment {
  id: number;
  course_id: number;
  course_title: string;
  status: 'pending' | 'enrolled' | 'rejected' | 'not_enrolled';
}

// Helper for API calls
const handleApiResponse = async (res: Response) => {
  const text = await res.text();
  if (res.ok) {
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`An unexpected server error occurred: ${text}`);
    }
  }
  try {
    const errorData = JSON.parse(text);
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  } catch (e) {
    throw new Error(text || `Request failed with status ${res.status}`);
  }
};

const Payment = () => {
  const { courseId } = useParams<{ courseId: string }>();

  // State
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('You are not logged in. Please log in to proceed.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (courseId) {
          const [purchaseInfoRes, statusRes] = await Promise.all([
            fetch(`/api/enrollments/courses/${courseId}/purchase-info`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
            fetch(`/api/enrollments/enrollments/${courseId}/status`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
          ]);

          const purchaseData = await handleApiResponse(purchaseInfoRes);
          setPurchaseInfo(purchaseData);

          if (statusRes.status === 404) {
            setEnrollmentStatus(null); // Not enrolled yet
          } else {
            const statusData = await handleApiResponse(statusRes);
            setEnrollmentStatus(statusData.status);
          }
        } else {
          // Since there's no direct endpoint to get all enrollments with status,
          // we first get all enrolled courses, then fetch the status for each one.
          const coursesRes = await fetch(`/api/courses/my-courses`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
          const coursesData = await handleApiResponse(coursesRes);

          if (Array.isArray(coursesData) && coursesData.length > 0) {
            const enrollmentsWithStatus = await Promise.all(
              coursesData.map(async (course: any) => {
                const statusRes = await fetch(`/api/enrollments/enrollments/${course.id}/status`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                
                let status: 'pending' | 'rejected' | 'enrolled' | 'not_enrolled' = 'not_enrolled';
                if (statusRes.ok) {
                  const statusData = await handleApiResponse(statusRes);
                  if (statusData.status === 'approved') {
                    status = 'enrolled';
                  } else if (statusData.status === 'rejected' || statusData.status === 'pending') {
                    status = statusData.status;
                  }
                } else if (statusRes.status === 404) {
                  status = 'not_enrolled';
                }

                return {
                  id: course.id,
                  course_title: course.title,
                  enrollment_date: 'N/A', // This info is not available from the /my-courses endpoint
                  status: status,
                  course_id: course.id
                };
              })
            );
            setEnrollments(enrollmentsWithStatus);
          } else {
            setEnrollments([]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        toast.error(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Event Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return toast.error('File size exceeds 5MB.');
      }
      if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        return toast.error('Invalid file type. Please upload PNG, JPG, or PDF.');
      }
      setUploadedFile(file);
      toast.success('File selected: ' + file.name);
    }
  };

  const handleSubmitProof = async () => {
    if (!uploadedFile || !courseId) return toast.error('Please select a payment proof file.');
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return toast.error('Authentication error. Please log in again.');

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('payment_proof', uploadedFile);

    try {
      const res = await fetch(`/api/enrollments/enrollments/${courseId}/payment-proof`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });
      const result = await handleApiResponse(res);
      toast.success(result.detail || 'Payment proof submitted successfully!');
      setEnrollmentStatus('pending');
      setUploadedFile(null);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Functions
  const renderStatus = () => {
    if (!enrollmentStatus) return null;
    let statusIcon, statusText, statusColor;
    switch (enrollmentStatus) {
      case 'pending':
        statusIcon = <Clock className="h-5 w-5" />;
        statusText = 'Your payment is pending verification. This may take up to 24 hours.';
        statusColor = 'bg-yellow-100 border-yellow-400 text-yellow-700';
        break;
      case 'enrolled':
        statusIcon = <CheckCircle className="h-5 w-5" />;
        statusText = 'Payment successful! You are now enrolled in the course.';
        statusColor = 'bg-green-100 border-green-400 text-green-700';
        break;
      case 'rejected':
        statusIcon = <XCircle className="h-5 w-5" />;
        statusText = 'Your payment proof was rejected. Please check the details and submit again.';
        statusColor = 'bg-red-100 border-red-400 text-red-700';
        break;
      default: return null;
    }
    return (
      <div className={`border-l-4 p-4 rounded-md ${statusColor}`} role="alert">
        <div className="flex items-center">
          <div className="py-1">{statusIcon}</div>
          <div className="ml-3">
            <p className="font-bold">Payment Status: {enrollmentStatus.charAt(0).toUpperCase() + enrollmentStatus.slice(1)}</p>
            <p className="text-sm">{statusText}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (!purchaseInfo) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold">{purchaseInfo.course_title}</h3>
            <p className="text-2xl font-bold text-primary mt-2">Price: ${purchaseInfo.course_price ? purchaseInfo.course_price.toFixed(2) : '0.00'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
            <CardDescription>Please transfer the course fee to one of the accounts below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {purchaseInfo.bank_accounts && purchaseInfo.bank_accounts.map((acc, index) => (
              <div key={index} className="p-3 border rounded-md">
                <p><strong>Bank:</strong> {acc.bank_name}</p>
                <p><strong>Account Name:</strong> {acc.account_name}</p>
                <p><strong>Account Number:</strong> {acc.account_number}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Submit Payment Proof</CardTitle>
            <CardDescription>Upload a screenshot or receipt of your transaction.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="payment-proof">Payment Proof (PNG, JPG, PDF)</Label>
                <Input id="payment-proof" type="file" accept="image/png, image/jpeg, application/pdf" onChange={handleFileChange} />
              </div>
              {uploadedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{uploadedFile.name}</span>
                </div>
              )}
              <Button onClick={handleSubmitProof} disabled={!uploadedFile || isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit for Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEnrollmentList = () => (
    <Card>
      <CardHeader>
        <CardTitle>My Enrollments</CardTitle>
        <CardDescription>View your course enrollment status and complete payments.</CardDescription>
      </CardHeader>
      <CardContent>
        {enrollments.length > 0 ? (
          <ul className="space-y-4">
            {enrollments.map(enrollment => (
              <li key={enrollment.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-semibold">{enrollment.course_title}</h3>
                  <p className="text-sm text-muted-foreground">Status: <span className={`font-medium ${enrollment.status === 'enrolled' ? 'text-green-600' : 'text-yellow-600'}`}>{enrollment.status.replace(/_/g, ' ')}</span></p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/student/payment/${enrollment.course_id}`}>
                    {enrollment.status === 'enrolled' ? 'View Details' : 'Complete Payment'}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Courses Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">You have not enrolled in any courses yet.</p>
            <Button asChild className="mt-4">
              <Link to="/student/courses">Explore Courses</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Main Component Return
  return (
    <DashboardLayout userType="student">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Enrollment & Payment</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5" />
              <div className="ml-3">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {courseId ? (
              <>
                {renderStatus()}
                {enrollmentStatus !== 'enrolled' && renderPaymentForm()}
              </>
            ) : (
              renderEnrollmentList()
            )}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default Payment;