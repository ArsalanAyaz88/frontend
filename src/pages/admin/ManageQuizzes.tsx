import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, MoreVertical, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Course {
  id: string;
  title: string;
}

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string;
  time_limit: number; // in minutes
  due_date: string;
}

const ManageQuizzes = () => {
  // State Management
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState({ courses: true, quizzes: false });

  // Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');
  const [dueDate, setDueDate] = useState('');

  // Fetch Courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      const token = localStorage.getItem('admin_access_token');
      const response = await fetchWithAuth('https://student-portal-lms-seven.vercel.app/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await handleApiResponse(response);
      setCourses(data || []);
    } catch (error) {
      toast.error('Failed to fetch courses.');
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  }, []);

  // Fetch Quizzes
  const fetchQuizzes = useCallback(async () => {
    if (!selectedCourse) {
      setQuizzes([]);
      return;
    }
    try {
      setLoading(prev => ({ ...prev, quizzes: true }));
      const token = localStorage.getItem('admin_access_token');
      const response = await fetchWithAuth(
        `https://student-portal-lms-seven.vercel.app/api/admin/courses/${selectedCourse}/quizzes`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await handleApiResponse(response);
      setQuizzes(data || []);
    } catch (error) {
      toast.error('Failed to fetch quizzes.');
      setQuizzes([]);
    } finally {
      setLoading(prev => ({ ...prev, quizzes: false }));
    }
  }, [selectedCourse]);

  // Handle Save Quiz
  const handleSaveQuiz = async () => {
    if (!quizTitle || !quizDesc || !timeLimit || !dueDate) {
      toast.error('Please fill all fields.');
      return;
    }
    
    const body = {
      title: quizTitle,
      description: quizDesc,
      time_limit: parseInt(timeLimit),
      due_date: new Date(dueDate).toISOString(),
      course_id: selectedCourse
    };

    const baseUrl = 'https://student-portal-lms-seven.vercel.app/api';
    const endpoint = editingQuiz
      ? `/admin/courses/${selectedCourse}/quizzes/${editingQuiz.id}`
      : `/admin/courses/${selectedCourse}/quizzes`;
      
    const method = editingQuiz ? 'PUT' : 'POST';
    const token = localStorage.getItem('admin_access_token');

    try {
      console.log('Sending request to:', `${baseUrl}${endpoint}`);
      console.log('Request body:', body);
      
      const response = await fetchWithAuth(`${baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      await handleApiResponse(response);
      toast.success(`Quiz ${editingQuiz ? 'updated' : 'created'} successfully!`);
      setIsQuizModalOpen(false);
      fetchQuizzes();
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast.error(error.message || `Failed to ${editingQuiz ? 'update' : 'create'} quiz.`);
    }
  };

  // Handle Delete Quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetchWithAuth(
        `https://student-portal-lms-seven.vercel.app/api/admin/courses/${selectedCourse}/quizzes/${quizId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      await handleApiResponse(response);
      toast.success('Quiz deleted successfully!');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to delete quiz.');
    }
  };

  // Open Edit Modal
  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizTitle(quiz.title);
    setQuizDesc(quiz.description);
    setTimeLimit(quiz.time_limit.toString());
    setDueDate(quiz.due_date);
    setIsQuizModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingQuiz(null);
    setQuizTitle('');
    setQuizDesc('');
    setTimeLimit('30');
    setDueDate('');
    setIsQuizModalOpen(true);
  };

  // Fetch data on component mount and when selected course changes
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Quizzes</h1>
          <Button onClick={openCreateModal} disabled={!selectedCourse || loading.quizzes}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
        
        <Card>
          <CardHeader><CardTitle>Select a Course</CardTitle></CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedCourse} value={selectedCourse} disabled={loading.courses}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder={loading.courses ? "Loading courses..." : "Select a course"} />
              </SelectTrigger>
              <SelectContent className="max-h-56 custom-scrollbar">
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourse && (
          <Card>
            <CardHeader><CardTitle>Quizzes</CardTitle></CardHeader>
            <CardContent>
              {loading.quizzes ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : quizzes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Time Limit (min)</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes.map(quiz => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">{quiz.title}</TableCell>
                        <TableCell>{quiz.time_limit}</TableCell>
                        <TableCell>{new Date(quiz.due_date).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditModal(quiz)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-500" 
                                onClick={() => handleDeleteQuiz(quiz.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No quizzes have been added for this course yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quiz Modal */}
      <Dialog open={isQuizModalOpen} onOpenChange={setIsQuizModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quizTitle" className="text-right">Title</Label>
              <Input 
                id="quizTitle"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter quiz title"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="quizDesc" className="text-right mt-2">Description</Label>
              <Textarea
                id="quizDesc"
                value={quizDesc}
                onChange={(e) => setQuizDesc(e.target.value)}
                className="col-span-3"
                placeholder="Enter quiz description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeLimit" className="text-right">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveQuiz}>
              {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageQuizzes;
