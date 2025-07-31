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


const CourseDetail: FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    // --- STATE ---
    const [course, setCourse] = useState<CourseInfo | null>(null);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatusResponse['status'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const handleEnroll = async () => {
        if (!courseId) return;
        try {
            const response = await fetchWithAuth(`/api/enrollments/apply/${courseId}`, { method: 'POST' });
            await handleApiResponse(response);
            toast.success('Enrollment application submitted successfully!');
            setApplicationStatus('PENDING');
        } catch (error) {
            toast.error('Failed to submit enrollment application.');
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
                        
                        {applicationStatus === 'NOT_APPLIED' && (
                            <Button onClick={handleEnroll} size="lg" className="w-full">
                                Enroll Now (${course.price})
                            </Button>
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
