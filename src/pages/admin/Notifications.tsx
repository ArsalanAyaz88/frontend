import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  event_type: string;
  details: string;
  timestamp: string;
}

// Helper function to parse notification details
const parseDetails = (details: string) => {
  if (typeof details !== 'string') {
    return { course: 'N/A', user: 'N/A', email: 'N/A', proofUrl: '#', userId: null, courseId: null };
  }
  const lines = details.split('\n');
  
  const courseLine = lines[0] || '';
  const userLine = lines[1] || '';
  const emailLine = lines[2] || '';
  const proofLine = lines[3] || '';

  // Improved regex to handle course with or without an ID
  let courseMatch = courseLine.match(/course (.*) \(ID: (.*?)\)/);
  let courseName, courseId;

  if (courseMatch) {
      courseName = courseMatch[1].trim();
      courseId = courseMatch[2].trim();
  } else {
      // Fallback to matching just the name if ID is not present
      courseMatch = courseLine.match(/course (.*)\./);
      courseName = courseMatch ? courseMatch[1].trim() : 'N/A';
      courseId = null; // No ID found
  }

  const userMatch = userLine.match(/User: (.*) \(ID: (.*?)\)/);
  const emailMatch = emailLine.match(/Email: (.*)/);
  const proofMatch = proofLine.match(/Proof image: (.*)/);

  return {
    course: courseName,
    courseId: courseId,
    user: userMatch ? userMatch[1].trim() : 'N/A',
    userId: userMatch ? userMatch[2].trim() : null,
    email: emailMatch ? emailMatch[1].trim() : 'N/A',
    proofUrl: proofMatch ? proofMatch[1].trim() : '#',
  };
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth('/api/admin/notifications');
        const data = await handleApiResponse(response);
        setNotifications(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch notifications.');
        toast.error(error.message || 'Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success('Notification dismissed.');
  };

  return (
    <DashboardLayout userType="admin">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Bell className="mr-3 h-8 w-8" />
          Notifications
        </h1>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="bg-destructive/10 border-destructive">
            <CardHeader className="flex flex-row items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>An Error Occurred</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">No New Notifications</h2>
            <p>You're all caught up!</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const { course, user, email, proofUrl, userId, courseId } = parseDetails(notification.details);
              return (
                <Card key={notification.id} className="shadow-md hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="capitalize text-lg font-semibold">{notification.event_type.replace('_', ' ')}</CardTitle>
                        <CardDescription>{new Date(notification.timestamp).toLocaleString()}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(notification.id)} className="text-muted-foreground hover:text-primary">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Course:</strong> <span className="font-medium text-primary">{course}</span></p>
                    <p><strong>User:</strong> {user}</p>
                    <p><strong>Email:</strong> {email}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
                    <a
                      href={proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline inline-flex items-center font-medium"
                    >
                      View Payment Proof <ExternalLink className="ml-1.5 h-4 w-4" />
                    </a>
                    {userId && courseId && notification.event_type === 'new_enrollment' && (
                        <Button asChild size="sm">
                            <Link to={`/admin/enrollments?userId=${userId}&courseId=${courseId}`}>
                                Approve
                            </Link>
                        </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications;
