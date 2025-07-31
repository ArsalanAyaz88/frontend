import { useState, useEffect, FC, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Upload } from 'lucide-react';
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';

// --- INTERFACES ---
interface CourseInfo {
    id: string;
    title: string;
    description: string;
    price: number;
    instructor_name: string;
    image_url: string; // This can be kept for fallback or removed if unused
    sections: {
        id: string;
        title: string;
        videos: { id: string; title: string; }[];
        quizzes: { id:string; title: string; }[];
    }[];
}

interface ApplicationStatusResponse {
    status: 'NOT_APPLIED' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface PurchaseInfo {
    course_title: string;
    course_price: number;
    bank_accounts: {
        bank_name: string;
        account_name: string;
        account_number: string;
    }[];
}

interface EnrollmentFormData {
    first_name: string;
    last_name: string;
    qualification: string;
    ultrasound_experience: string;
    contact_number: string;
    qualification_certificate: File | null;
}

const CourseDetail: FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE ---
    const [course, setCourse] = useState<CourseInfo | null>(null);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatusResponse['status'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enrollmentForm, setEnrollmentForm] = useState<EnrollmentFormData>({
        first_name: '',
        last_name: '',
        qualification: '',
        ultrasound_experience: '',
        contact_number: '',
        qualification_certificate: null
    });
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const paymentFileInputRef = useRef<HTMLInputElement>(null);
    const paymentSectionRef = useRef<HTMLDivElement>(null);
    const enrollmentFormRef = useRef<HTMLDivElement>(null);
    const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
    const [isLoadingPurchaseInfo, setIsLoadingPurchaseInfo] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);

    useEffect(() => {
        const fetchCourseAndStatus = async () => {
            if (!courseId) {
                setError("Course ID is missing.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch main course details and status in parallel.
                const coursePromise = fetchWithAuth(`/api/courses/explore-courses/${courseId}`);
                const statusPromise = fetchWithAuth(`/api/courses/my-courses/${courseId}/enrollment-status`);

                const [courseResponse, statusResponse] = await Promise.all([
                    handleApiResponse<CourseInfo>(await coursePromise),
                    handleApiResponse<ApplicationStatusResponse>(await statusPromise),
                ]);

                setCourse(courseResponse);
                setApplicationStatus(statusResponse.status);

            } catch (err) {
                if (err instanceof UnauthorizedError) {
                    navigate('/login');
                } else {
                    setError("Failed to load course details. Please try again later.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseAndStatus();
    }, [courseId, navigate]);

    // Auto-scroll to payment section when application is approved
    useEffect(() => {
        if (applicationStatus === 'APPROVED' && paymentSectionRef.current) {
            setTimeout(() => {
                paymentSectionRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 500); // Small delay to ensure the component is rendered
        }
    }, [applicationStatus]);

    const handleEnroll = () => {
        setShowEnrollmentForm(true);
        
        // Scroll to enrollment form after a short delay to ensure it's rendered
        setTimeout(() => {
            enrollmentFormRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId) return;

        // Validate form
        if (!enrollmentForm.first_name || !enrollmentForm.last_name || !enrollmentForm.qualification || 
            !enrollmentForm.ultrasound_experience || !enrollmentForm.contact_number) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (!enrollmentForm.qualification_certificate) {
            toast.error('Please upload your qualification certificate.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Create form data with required fields
            const formData = new FormData();
            formData.append('first_name', enrollmentForm.first_name);
            formData.append('last_name', enrollmentForm.last_name);
            formData.append('qualification', enrollmentForm.qualification);
            formData.append('ultrasound_experience', enrollmentForm.ultrasound_experience);
            formData.append('contact_number', enrollmentForm.contact_number);
            formData.append('course_id', courseId);
            formData.append('qualification_certificate', enrollmentForm.qualification_certificate);
            
            const response = await fetchWithAuth(`/api/enrollments/apply`, { 
                method: 'POST',
                body: formData,
            });
            await handleApiResponse(response);
            toast.success('Enrollment application submitted successfully!');
            setApplicationStatus('PENDING');
            setShowEnrollmentForm(false);
        } catch (error) {
            toast.error('Failed to submit enrollment application.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof EnrollmentFormData, value: string | File | null) => {
        setEnrollmentForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleInputChange('qualification_certificate', file);
        }
    };

    const handlePaymentProofSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !paymentFile) return;

        setIsSubmittingPayment(true);
        
        try {
            const formData = new FormData();
            formData.append('file', paymentFile);
            
            const response = await fetchWithAuth(`/api/enrollments/${courseId}/payment-proof`, { 
                method: 'POST',
                body: formData,
            });
            await handleApiResponse(response);
            toast.success('Payment proof submitted successfully!');
            setShowPaymentForm(false);
            setPaymentFile(null);
            setPaymentSubmitted(true);
        } catch (error) {
            toast.error('Failed to submit payment proof.');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const handlePaymentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPaymentFile(file);
        }
    };

    const fetchPurchaseInfo = async () => {
        if (!courseId) return;
        
        setIsLoadingPurchaseInfo(true);
        try {
            const response = await fetchWithAuth(`/api/enrollments/courses/${courseId}/purchase-info`);
            const data = await handleApiResponse<PurchaseInfo>(response);
            setPurchaseInfo(data);
        } catch (error) {
            toast.error('Failed to load payment information.');
        } finally {
            setIsLoadingPurchaseInfo(false);
        }
    };

    const handleShowPaymentForm = async () => {
        if (!purchaseInfo) {
            await fetchPurchaseInfo();
        }
        setShowPaymentForm(true);
        
        // Scroll to payment form after a short delay to ensure it's rendered
        setTimeout(() => {
            paymentSectionRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="student">
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout userType="student">
                <div className="flex flex-col justify-center items-center h-screen">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <p className="mt-4 text-red-500">{error}</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!course) {
        return (
            <DashboardLayout userType="student">
                <div className="text-center py-10">Course not found.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="student">
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        {course.image_url ? (
                            <img src={course.image_url} alt={course.title} className="w-full h-64 object-cover rounded-t-lg" />
                        ) : (
                            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-t-lg">
                                <span className="text-gray-500">No Image Available</span>
                            </div>
                        )}
                        <CardTitle className="text-3xl font-bold mt-4">{course.title}</CardTitle>
                        <CardDescription>Taught by: {course.instructor_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground mb-6">{course.description}</p>
                        
                        {applicationStatus === 'NOT_APPLIED' && !showEnrollmentForm && (
                            <Button onClick={handleEnroll} size="lg" className="w-full">
                                Enroll Request Application (${course.price})
                            </Button>
                        )}
                        {applicationStatus === 'NOT_APPLIED' && showEnrollmentForm && (
                            <Card className="mt-6" ref={enrollmentFormRef}>
                                <CardHeader>
                                    <CardTitle>Enrollment Application</CardTitle>
                                    <CardDescription>Please fill in your details to apply for this course.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleFormSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="first_name">First Name *</Label>
                                                <Input
                                                    id="first_name"
                                                    value={enrollmentForm.first_name}
                                                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="last_name">Last Name *</Label>
                                                <Input
                                                    id="last_name"
                                                    value={enrollmentForm.last_name}
                                                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="qualification">Qualification *</Label>
                                            <Input
                                                id="qualification"
                                                value={enrollmentForm.qualification}
                                                onChange={(e) => handleInputChange('qualification', e.target.value)}
                                                placeholder="e.g., Bachelor's in Medical Imaging"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="ultrasound_experience">Ultrasound Experience *</Label>
                                            <Textarea
                                                id="ultrasound_experience"
                                                value={enrollmentForm.ultrasound_experience}
                                                onChange={(e) => handleInputChange('ultrasound_experience', e.target.value)}
                                                placeholder="Describe your experience with ultrasound technology"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="contact_number">Contact Number *</Label>
                                            <Input
                                                id="contact_number"
                                                value={enrollmentForm.contact_number}
                                                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                                placeholder="+1234567890"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="qualification_certificate">Qualification Certificate *</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="qualification_certificate"
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={handleFileChange}
                                                    ref={fileInputRef}
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {enrollmentForm.qualification_certificate && (
                                                <p className="text-sm text-green-600 mt-1">
                                                    File selected: {enrollmentForm.qualification_certificate.name}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit Application'
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowEnrollmentForm(false)}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                        {applicationStatus === 'PENDING' && <p className="text-center text-yellow-500">Enrollment Request Application is pending</p>}
                        {applicationStatus === 'APPROVED' && !showPaymentForm && !paymentSubmitted && (
                            <div className="text-center">
                                <Button 
                                    onClick={handleShowPaymentForm} 
                                    size="lg" 
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    disabled={isLoadingPurchaseInfo}
                                >
                                    {isLoadingPurchaseInfo ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading Payment Info...
                                        </>
                                    ) : (
                                        'Submit Payment Proof'
                                    )}
                                </Button>
                            </div>
                        )}
                        {applicationStatus === 'APPROVED' && showPaymentForm && !paymentSubmitted && (
                            <Card className="mt-6" ref={paymentSectionRef}>
                                <CardHeader>
                                    <CardTitle>Payment Information</CardTitle>
                                    <CardDescription>Please make the payment and upload your proof of payment.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {purchaseInfo && (
                                        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg shadow-lg">
                                            <h3 className="text-xl font-bold mb-4 text-purple-800">Payment Details</h3>
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-300">
                                                    <p className="text-lg mb-2"><span className="font-semibold text-purple-800">Course:</span> <span className="text-gray-800 font-medium">{purchaseInfo.course_title}</span></p>
                                                    <p className="text-lg"><span className="font-semibold text-purple-800">Amount:</span> <span className="text-green-700 font-bold text-xl">${purchaseInfo.course_price.toLocaleString()}</span></p>
                                                </div>
                                                
                                                <div className="mt-4">
                                                    <h4 className="font-bold mb-3 text-purple-800">Bank Account Details:</h4>
                                                    {purchaseInfo.bank_accounts.map((account, index) => (
                                                        <div key={index} className="p-4 bg-gradient-to-r from-white to-purple-50 rounded-lg border-2 border-purple-300 shadow-md">
                                                            <p className="mb-2"><span className="font-semibold text-purple-800">Bank:</span> <span className="text-gray-800 font-medium">{account.bank_name}</span></p>
                                                            <p className="mb-2"><span className="font-semibold text-purple-800">Account Name:</span> <span className="text-gray-800 font-medium">{account.account_name}</span></p>
                                                            <p><span className="font-semibold text-purple-800">Account Number:</span> <span className="font-mono bg-purple-200 text-purple-900 px-3 py-1 rounded-md border border-purple-400 font-bold">{account.account_number}</span></p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handlePaymentProofSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="payment_file">Payment Proof *</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="payment_file"
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={handlePaymentFileChange}
                                                    ref={paymentFileInputRef}
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => paymentFileInputRef.current?.click()}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {paymentFile && (
                                                <p className="text-sm text-green-600 mt-1">
                                                    File selected: {paymentFile.name}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 mt-1">
                                                Please upload a screenshot or photo of your payment receipt/confirmation.
                                            </p>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            <Button
                                                type="submit"
                                                disabled={isSubmittingPayment}
                                                className="flex-1"
                                            >
                                                {isSubmittingPayment ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit Payment Proof'
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowPaymentForm(false);
                                                    setPaymentFile(null);
                                                }}
                                                disabled={isSubmittingPayment}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                        {applicationStatus === 'REJECTED' && <p className="text-center text-red-500">Enrollment Rejected</p>}
                        
                        {paymentSubmitted && (
                            <Card className="mt-6 border-green-200 bg-green-50">
                                <CardContent className="p-6">
                                    <div className="text-center">
                                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-green-800 mb-2">
                                            Payment Proof Submitted Successfully!
                                        </h3>
                                        <p className="text-green-700 mb-4">
                                            Your enrollment is being processed. Our admin team will review your payment proof and approve your enrollment within 24 hours.
                                        </p>
                                        <div className="bg-white rounded-lg p-4 border border-green-200">
                                            <p className="text-sm text-green-600">
                                                <strong>What happens next?</strong>
                                            </p>
                                            <ul className="text-sm text-green-600 mt-2 space-y-1">
                                                <li>• Admin will verify your payment proof</li>
                                                <li>• You'll receive confirmation within 24 hours</li>
                                                <li>• Once approved, you'll have full access to the course</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mt-8">
                            <h3 className="text-2xl font-bold mb-4">Course Content</h3>
                            {course.sections.map(section => (
                                <div key={section.id} className="mb-4">
                                    <h4 className="text-xl font-semibold">{section.title}</h4>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        {section.videos.map(video => <li key={video.id}>{video.title}</li>)}
                                        {section.quizzes.map(quiz => <li key={quiz.id}>{quiz.title} (Quiz)</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/student/courses')}>Back to Courses</Button>
            </div>
        </DashboardLayout>
    );
};

export default CourseDetail;
