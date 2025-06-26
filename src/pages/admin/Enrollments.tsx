import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AdminEnrollments = () => {
  const [searchParams] = useSearchParams();

  // State for Approve Enrollment form
  const [approveUserId, setApproveUserId] = useState('');
  const [approveCourseId, setApproveCourseId] = useState('');
  const [durationMonths, setDurationMonths] = useState('4');
  const [loadingApprove, setLoadingApprove] = useState(false);

  // State for Test Expiration form
  const [testUserId, setTestUserId] = useState('');
  const [testCourseId, setTestCourseId] = useState('');
  const [loadingTest, setLoadingTest] = useState(false);

  useEffect(() => {
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    if (userId) {
      setApproveUserId(userId);
    }
    if (courseId) {
      setApproveCourseId(courseId);
    }
  }, [searchParams]);

  const handleApproveEnrollment = async () => {
    if (!approveUserId || !approveCourseId || !durationMonths) {
      toast.error('Please fill all fields for approval.');
      return;
    }
    setLoadingApprove(true);
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetchWithAuth(
        `https://student-portal-lms-seven.vercel.app/api/admin/enrollments/approve?user_id=${approveUserId}&course_id=${approveCourseId}&duration_months=${durationMonths}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const result = await handleApiResponse(response);
      toast.success(result.detail || 'Enrollment approved successfully!');
      // Clear fields on success
      setApproveUserId('');
      setApproveCourseId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve enrollment.');
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleTestExpiration = async () => {
    if (!testUserId || !testCourseId) {
      toast.error('Please fill all fields for testing expiration.');
      return;
    }
    setLoadingTest(true);
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetchWithAuth(
        `https://student-portal-lms-seven.vercel.app/api/admin/enrollments/test-expiration?user_id=${testUserId}&course_id=${testCourseId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const result = await handleApiResponse(response);
      toast.info(result.detail || 'Expiration test completed.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to test enrollment expiration.');
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Enrollments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Approve Enrollment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Approve Enrollment</CardTitle>
              <CardDescription>Manually approve a student's enrollment for a course.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approve-user-id">User ID</Label>
                <Input
                  id="approve-user-id"
                  placeholder="Enter user ID"
                  value={approveUserId}
                  onChange={(e) => setApproveUserId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approve-course-id">Course ID</Label>
                <Input
                  id="approve-course-id"
                  placeholder="Enter course ID"
                  value={approveCourseId}
                  onChange={(e) => setApproveCourseId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Months)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Enter duration in months"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleApproveEnrollment} disabled={loadingApprove}>
                {loadingApprove && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve Enrollment
              </Button>
            </CardFooter>
          </Card>

          {/* Test Enrollment Expiration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Test Enrollment Expiration</CardTitle>
              <CardDescription>Check if an enrollment has expired for a specific user and course.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-user-id">User ID</Label>
                <Input
                  id="test-user-id"
                  placeholder="Enter user ID"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-course-id">Course ID</Label>
                <Input
                  id="test-course-id"
                  placeholder="Enter course ID"
                  value={testCourseId}
                  onChange={(e) => setTestCourseId(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleTestExpiration} disabled={loadingTest} variant="secondary">
                {loadingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Expiration
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEnrollments;
