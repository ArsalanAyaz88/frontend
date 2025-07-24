import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';

// --- INTERFACES ---
interface BankAccount {
  id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
}

interface PurchaseInfo {
  course_price: number;
  bank_accounts: BankAccount[];
}

interface StatusResponse {
  status: 'pending' | 'enrolled' | 'rejected' | 'not_enrolled' | 'approved';
}

interface UploadResponse {
  file_url: string;
}

const Payment = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // --- STATE ---
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) {
        setError('No course selected.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const purchaseInfoRes = await fetchWithAuth(`/api/enrollments/courses/${courseId}/purchase-info`);
        const purchaseData = await handleApiResponse<PurchaseInfo>(purchaseInfoRes);
        setPurchaseInfo(purchaseData);
        if (purchaseData.bank_accounts.length > 0) {
          setSelectedBankAccountId(purchaseData.bank_accounts[0].id);
        }

        const statusRes = await fetchWithAuth(`/api/enrollments/${courseId}/status`);
        const statusData = await handleApiResponse<StatusResponse>(statusRes);
        setEnrollmentStatus(statusData.status);

      } catch (err) {
        if (err instanceof UnauthorizedError) {
          toast.error('Session expired. Please log in again.');
          navigate('/auth/login');
        } else if (err instanceof Error) {
          setError(err.message);
          toast.error(err.message);
        } else {
          setError('An unexpected error occurred.');
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate]);

  // --- HANDLERS ---
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
    if (!uploadedFile || !selectedBankAccountId || !transactionId) {
      toast.error('Please fill all fields and select a payment proof file.');
      return;
    }
    if (!courseId) return;

    setIsSubmitting(true);

    try {
      // Step 1: Upload the payment proof file
      const uploadFormData = new FormData();
      uploadFormData.append('file', uploadedFile);
      const uploadRes = await fetchWithAuth('/api/uploads/payment-proof', {
        method: 'POST',
        body: uploadFormData,
      });
      const uploadData = await handleApiResponse<UploadResponse>(uploadRes);
      const proofUrl = uploadData.file_url;

      // Step 2: Submit the proof details with the URL
      const submissionPayload = {
        course_id: courseId,
        bank_account_id: selectedBankAccountId,
        transaction_id: transactionId,
        file_url: proofUrl,
      };

      await fetchWithAuth(`/api/enrollments/submit-payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      toast.success('Payment proof submitted successfully!');
      setEnrollmentStatus('pending'); // Update UI to show pending status
      setUploadedFile(null);
      setTransactionId('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit payment proof.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---
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
      case 'approved':
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
          <div className="ml-3"><p className="text-sm font-medium">{statusText}</p></div>
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
          <CardDescription>To enroll, please transfer {purchaseInfo.course_price} PKR to one of the accounts below and upload your proof of payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Bank Accounts</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              {purchaseInfo.bank_accounts.map(acc => (
                <li key={acc.id}><strong>{acc.bank_name}:</strong> {acc.account_number} (Title: {acc.account_title}, IBAN: {acc.iban})</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-account">Paid To (Bank Account)</Label>
            <Select onValueChange={setSelectedBankAccountId} value={selectedBankAccountId}>
              <SelectTrigger id="bank-account">
                <SelectValue placeholder="Select the bank account you paid to" />
              </SelectTrigger>
              <SelectContent>
                {purchaseInfo.bank_accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.bank_name} - {acc.account_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-id">Transaction ID / Reference No.</Label>
            <Input id="transaction-id" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g., FT23456789" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-proof">Upload Payment Proof</Label>
            <Input id="payment-proof" type="file" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf" />
            <p className="text-xs text-muted-foreground">Accepted formats: PNG, JPG, PDF. Max size: 5MB.</p>
          </div>
          <Button onClick={handleSubmitProof} disabled={isSubmitting || !uploadedFile || !transactionId || !selectedBankAccountId} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Payment Proof
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500"><AlertCircle className="mr-2" /> {error}</div>;

  return (
    <DashboardLayout userType="student">
      <div className="p-6">
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
      </div>
    </DashboardLayout>
  );
};

export default Payment;            