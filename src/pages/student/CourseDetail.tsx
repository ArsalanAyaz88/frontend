import { useState, useEffect, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { fetchWithAuth, handleApiResponse, UnauthorizedError } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';

// --- INTERFACES ---
interface CourseInfo {
    id: string;
    title: string;
    description: string;
    price: number;
    instructor_name: string;
    image_url: string;
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

const CourseDetail: FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    // --- STATE ---
    const [course, setCourse] = useState<CourseInfo | null>(null);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatusResponse['status'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchAllData = async () => {
            if (!courseId) {
                setError('Course ID is missing.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const coursePromise = fetchWithAuth(`/api/courses/explore-courses/${courseId}`).then(res => handleApiResponse<CourseInfo>(res));
                
                const applicationStatusPromise = fetchWithAuth(`/api/enrollments/${courseId}/status`)
                    .then(res => handleApiResponse<ApplicationStatusResponse>(res))
                    .catch(() => ({ status: 'NOT_APPLIED' as const })); // Default status on error

                const [courseData, statusData] = await Promise.all([coursePromise, applicationStatusPromise]);

                setCourse(courseData);
                setApplicationStatus(statusData.status);

            } catch (err) {
                console.error('Failed to fetch course details:', err);
                if (err instanceof UnauthorizedError) {
                    toast.error('Session expired. Please log in again.');
                    navigate('/auth/login');
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [courseId, navigate]);

    // --- RENDER LOGIC ---
    const renderEnrollmentAction = () => {
        if (!applicationStatus) return null; // Don't render until status is known

        switch (applicationStatus) {
            case 'PENDING':
                return <p className="text-yellow-600 font-semibold">Your application is pending review.</p>;
            case 'REJECTED':
                return <p className="text-red-600 font-semibold">Your application has been rejected.</p>;
            case 'APPROVED':
                return (
                    <Button onClick={() => navigate(`/student/payment/${courseId}`)} className="w-full bg-green-600 hover:bg-green-700">
                        Enroll Now (Proceed to Payment)
                    </Button>
                );
            case 'NOT_APPLIED':
            default:
                return (
                    <Button onClick={() => navigate(`/student/enroll/${courseId}`)} className="w-full">
                        Apply for Enrollment
                    </Button>
                );
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500"><AlertCircle className="mr-2" /> {error}</div>;
    }

    if (!course) {
        return <div className="flex justify-center items-center h-screen">Course not found.</div>;
    }

    return (
        <DashboardLayout userType='student'>
            <div className="container mx-auto p-4 md:p-6">
                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                        <img src={course.image_url} alt={course.title} className="w-full h-48 md:h-64 object-cover" />
                        <div className="p-6">
                            <CardTitle className="text-2xl md:text-3xl font-bold">{course.title}</CardTitle>
                            <CardDescription className="text-lg text-muted-foreground">Taught by {course.instructor_name}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-semibold mb-2">Course Description</h3>
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />

                            <h3 className="text-xl font-semibold mt-6 mb-2">Course Content</h3>
                            <div className="space-y-4">
                                {course.sections.map(section => (
                                    <div key={section.id} className="border rounded-lg p-4">
                                        <h4 className="font-semibold">{section.title}</h4>
                                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                            {section.videos.map(video => <li key={video.id}>{video.title}</li>)}
                                            {section.quizzes.map(quiz => <li key={quiz.id}>{quiz.title} (Quiz)</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-1 space-y-4">
                            <Card className="bg-slate-50">
                                <CardHeader>
                                    <CardTitle>Price: ${course.price}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderEnrollmentAction()}
                                </CardContent>
                            </Card>
                            <Button variant="outline" className="w-full" onClick={() => navigate('/student/courses')}>Back to Courses</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CourseDetail;
