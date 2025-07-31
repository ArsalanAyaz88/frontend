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

    const handleEnroll = () => {
        setShowEnrollmentForm(true);
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
                                Enroll Now (${course.price})
                            </Button>
                        )}
                        {applicationStatus === 'NOT_APPLIED' && showEnrollmentForm && (
                            <Card className="mt-6">
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
                        {applicationStatus === 'PENDING' && <p className="text-center text-yellow-500">Enrollment Pending</p>}
                        {applicationStatus === 'APPROVED' && <p className="text-center text-green-500">Enrolled</p>}
                        {applicationStatus === 'REJECTED' && <p className="text-center text-red-500">Enrollment Rejected</p>}

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
