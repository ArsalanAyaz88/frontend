import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface PurchaseInfo {
  course_title: string;
  course_price: number;
  bank_accounts: {
    bank_name: string;
    account_name: string;
    account_number: string;
  }[];
}

const Payment = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) {
        setError('Course ID is missing from the URL.');
        setLoading(false);
        return;
      }

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('You are not logged in. Please log in to proceed.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [purchaseInfoRes, statusRes] = await Promise.all([
          fetch(`/api/enrollments/courses/${courseId}/purchase-info`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          fetch(`/api/enrollments/enrollments/${courseId}/status`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
        ]);

        if (purchaseInfoRes.ok) {
            const purchaseData = await purchaseInfoRes.json();
            setPurchaseInfo(purchaseData);
        } else {
            const errorData = await purchaseInfoRes.json();
            throw new Error(errorData.detail || 'Failed to fetch purchase information.');
        }

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setEnrollmentStatus(statusData.status);
        } else if (statusRes.status === 404) {
          setEnrollmentStatus(null); // Not enrolled yet
        } else {
            const errorData = await statusRes.json();
            throw new Error(errorData.detail || 'Failed to fetch enrollment status.');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size exceeds 5MB.');
        return;
      }
      if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        toast.error('Invalid file type. Please upload PNG, JPG, or PDF.');
        return;
      }
      setUploadedFile(file);
      toast.success('File selected: ' + file.name);
    }
  };

  const handleSubmitProof = async () => {
    if (!uploadedFile || !courseId) {
      toast.error('Please select a payment proof file.');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      toast.error('Authentication error. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('payment_proof', uploadedFile);

    try {
      const response = await fetch(`/api/enrollments/enrollments/${courseId}/payment-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit payment proof.');
      }

      const result = await response.json();
      toast.success(result.detail || 'Payment proof submitted successfully!');
      setEnrollmentStatus('pending');
      setUploadedFile(null);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaymentForm = () => {
    if (!purchaseInfo) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold">{purchaseInfo.course_title}</h3>
            <p className="text-2xl font-bold text-primary mt-2">
              Price: ${purchaseInfo.course_price.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
            <CardDescription>
              Please transfer the course fee to one of the accounts below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {purchaseInfo.bank_accounts.map((acc, index) => (
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
            <CardDescription>
              Upload a screenshot or receipt of your transaction.
            </CardDescription>
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Proof'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      );
    }

    switch (enrollmentStatus) {
      case 'approved':
        return (
          <Card className="bg-green-100 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="mr-2" /> Enrollment Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your enrollment is complete. You can now access the course materials.</p>
            </CardContent>
          </Card>
        );
      case 'pending':
        return (
          <Card className="bg-yellow-100 border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Clock className="mr-2" /> Payment Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your payment proof has been submitted and is awaiting review. This may take up to 24 hours.</p>
            </CardContent>
          </Card>
        );
      case 'rejected':
        return (
          <Card className="bg-red-100 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <XCircle className="mr-2" /> Enrollment Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your payment proof was rejected. Please check the details and resubmit.</p>
              {renderPaymentForm()}
            </CardContent>
          </Card>
        );
      default:
        return renderPaymentForm();
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">Enrollment & Payment</h1>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default Payment;