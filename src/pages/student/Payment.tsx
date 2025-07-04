import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Clock, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';

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
  status: 'pending' | 'enrolled' | 'rejected' | 'not_enrolled' | 'approved';
}

interface Course {
  id: number;
  title: string;
}

interface StatusResponse {
  status: 'pending' | 'enrolled' | 'rejected' | 'not_enrolled' | 'approved';
}

interface SubmissionResponse {
  detail: string;
}

const Payment = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // State
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (courseId) {
          // Fetch purchase info first, as it's required to render the form.
          const purchaseInfoRes = await fetchWithAuth(`/api/enrollments/api/enrollments/courses/${courseId}/purchase-info`);
          const purchaseData = await handleApiResponse<PurchaseInfo>(purchaseInfoRes);
          setPurchaseInfo(purchaseData);

          // Then, fetch the enrollment status, which might not exist yet.
          try {
            const statusRes = await fetchWithAuth(`/api/enrollments/${courseId}/status`);
            if (statusRes.ok) {
              const statusData = await handleApiResponse<StatusResponse>(statusRes);
              setEnrollmentStatus(statusData.status);
            } else {
              // A 404 or other non-ok status means not enrolled or no status yet.
              setEnrollmentStatus(null);
            }
          } catch (statusError) {
            // If fetching status fails, we assume the user is not enrolled and can proceed.
            if (statusError instanceof Error) {
              console.warn(`Could not fetch enrollment status: ${statusError.message}`);
            } else {
              console.warn("Could not fetch enrollment status, assuming not enrolled:", statusError);
            }
            setEnrollmentStatus(null);
          }
        } else {
          const coursesRes = await fetchWithAuth(`/api/courses/my-courses`);
          const coursesData = await handleApiResponse<Course[]>(coursesRes);

          if (Array.isArray(coursesData) && coursesData.length > 0) {
            const enrollmentsWithStatus = await Promise.all(
              coursesData.map(async (course: Course): Promise<Enrollment> => {
                try {
                  const statusRes = await fetchWithAuth(`/api/enrollments/${course.id}/status`);
                  let status: Enrollment['status'] = 'not_enrolled';
                  if (statusRes.ok) {
                    const statusData = await handleApiResponse<StatusResponse>(statusRes);
                    status = statusData.status;
                  } // 404 is handled as 'not_enrolled'

                  return {
                    id: course.id,
                    course_title: course.title,
                    status: status,
                    course_id: course.id
                  };
                } catch (e) {
                  if (e instanceof UnauthorizedError) throw e;
                  if (e instanceof Error) {
                    console.error(`Failed to fetch status for course ${course.id}: ${e.message}`);
                  } else {
                    console.error(`Failed to fetch status for course ${course.id}:`, e);
                  }
                  return {
                    id: course.id,
                    course_title: course.title,
                    status: 'not_enrolled',
                    course_id: course.id
                  };
                }
              })
            );
            setEnrollments(enrollmentsWithStatus);
          } else {
            setEnrollments([]);
          }
        }
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          toast.error('Session expired. Please log in again.');
          navigate('/auth/login');
        } else if (err instanceof Error) {
          setError(err.message);
          toast.error(err.message);
        } else {
          const errorMessage = 'An unexpected error occurred.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

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
    if (!uploadedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!courseId) {
      toast.error('Course ID is missing from the URL.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    // The backend expects the file under the field name 'file'.
    formData.append('file', uploadedFile);
    formData.append('course_id', courseId);

    try {
      // The endpoint uses the courseId from the URL.
          const res = await fetchWithAuth(`/api/enrollments/api/enrollments/${courseId}/payment-proof`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await handleApiResponse<SubmissionResponse>(res);
      toast.success(result.detail || 'Payment proof submitted successfully!');
      // Update UI to show pending status
      setEnrollmentStatus('pending');
      setUploadedFile(null);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to submit payment proof.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      case 'approved': // Treat 'approved' as 'enrolled'
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
            <p className="text-sm font-medium">{statusText}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (!purchaseInfo) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Enrollment</CardTitle>
          <CardDescription>To enroll in "{purchaseInfo.course_title}", please transfer ${purchaseInfo.course_price} to one of the accounts below and upload your proof of payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Bank Accounts</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {purchaseInfo.bank_accounts.map(acc => (
                <li key={acc.account_number}><strong>{acc.bank_name}:</strong> {acc.account_number} (A/N: {acc.account_name})</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-proof">Upload Payment Proof</Label>
            <Input id="payment-proof" type="file" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf" />
            <p className="text-xs text-muted-foreground">Accepted formats: PNG, JPG, PDF. Max size: 5MB.</p>
          </div>
          <Button onClick={handleSubmitProof} disabled={isSubmitting || !uploadedFile} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Payment Proof
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  const getStatusColor = (status: Enrollment['status']) => {
    switch (status) {
      case 'enrolled':
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const renderEnrollmentList = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Enrollments</CardTitle>
          <CardDescription>Here is the status of all your course enrollments.</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <ul className="space-y-4">
              {enrollments.map(enrollment => (
                <li key={enrollment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-medium">{enrollment.course_title}</span>
                  </div>
                  <div className="flex items-center">
                    {enrollment.status !== 'not_enrolled' && (
                      <span className={`text-sm font-semibold capitalize mr-4 ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status.replace('_', ' ')}
                      </span>
                    )}
                    <Link to={`/student/courses/${enrollment.course_id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground">You have no active enrollments.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500"><AlertCircle className="mr-2" /> {error}</div>;

  return (
    <DashboardLayout userType="student">
      <div className="p-6">
        {courseId ? (
          <div className="space-y-4">
            {enrollmentStatus && renderStatus()}
            {enrollmentStatus !== 'enrolled' && enrollmentStatus !== 'approved' && enrollmentStatus !== 'pending' && renderPaymentForm()}
            {(enrollmentStatus === 'enrolled' || enrollmentStatus === 'approved') && (
              <div className="text-center p-8 bg-green-50 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Enrollment Confirmed</h2>
                <p className="text-muted-foreground">You can now access all materials for this course.</p>
                <Link to={`/student/courses/${courseId}`}>
                  <Button className="mt-4">Go to Course</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          renderEnrollmentList()
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payment;            