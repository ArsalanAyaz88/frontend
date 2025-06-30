import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Type Definitions ---
interface Course {
  id: string;
  title: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  course_id: string;
  due_date: string | null;
}

const ManageQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

  const fetchQuizzesByCourse = useCallback(async (courseId: string) => {
    if (!courseId) return;
    setLoadingQuizzes(true);
    setQuizzes([]);
    try {
      const response = await fetchWithAuth(`/api/admin/quizzes/courses/${courseId}/quizzes`);
      const data = await handleApiResponse(response);
      setQuizzes(data || []);
    } catch (error) {
      toast.error('Failed to fetch quizzes for the selected course.');
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const response = await fetchWithAuth('/api/admin/courses');
      const data = await handleApiResponse(response);
      setCourses(data || []);
    } catch (error) {
      toast.error('Failed to fetch courses.');
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchQuizzesByCourse(selectedCourseId);
    }
  }, [selectedCourseId, fetchQuizzesByCourse]);

  const handleAdd = () => {
    if (!selectedCourseId) {
      toast.error('Please select a course first to add a quiz.');
      return;
    }
    setCurrentQuiz({
      id: '',
      title: '',
      description: '',
      course_id: selectedCourseId,
      due_date: null,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleDelete = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const response = await fetchWithAuth(`/api/admin/quizzes/${quizId}`, { method: 'DELETE' });
      await handleApiResponse(response);
      toast.success('Quiz deleted successfully!');
      if (selectedCourseId) {
        fetchQuizzesByCourse(selectedCourseId);
      }
    } catch (error) {
      toast.error('Failed to delete quiz.');
    }
  };

  const handleSave = async () => {
    if (!currentQuiz || !currentQuiz.title || !currentQuiz.course_id) {
      toast.error('Title and course are required.');
      return;
    }

    const isEditing = !!currentQuiz.id;
    const url = isEditing
      ? `/api/admin/quizzes/${currentQuiz.id}`
      : `/api/admin/quizzes/courses/${currentQuiz.course_id}/quizzes`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentQuiz.title,
          description: currentQuiz.description,
          due_date: currentQuiz.due_date || null,
        }),
      });
      await handleApiResponse(response);
      toast.success(`Quiz ${isEditing ? 'updated' : 'created'} successfully!`);
      setIsModalOpen(false);
      if (selectedCourseId) {
        fetchQuizzesByCourse(selectedCourseId);
      }
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} quiz.`);
    }
  };

  const handleManageQuestions = (quizId: string) => {
    navigate(`/admin/quizzes/${quizId}/questions`);
  };

  const handleViewSubmissions = (quizId: string) => {
    navigate(`/admin/quizzes/${quizId}/submissions`);
  };

  // --- Render ---
  return (
    <DashboardLayout userType="admin">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Quizzes</h1>
          <div className="flex items-center gap-4">
            <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {loadingCourses ? (
                  <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : (
                  courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={!selectedCourseId}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Quiz
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quizzes for {courses.find(c => c.id === selectedCourseId)?.title || '...'}</CardTitle>
            <CardDescription>A list of all quizzes for the selected course.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            {!selectedCourseId ? (
              <div className="text-center py-8 text-gray-500">Please select a course to view its quizzes.</div>
            ) : loadingQuizzes ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : quizzes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.due_date ? format(new Date(quiz.due_date), 'PPP') : 'No due date'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(quiz)}>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageQuestions(quiz.id)}>Manage Questions</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewSubmissions(quiz.id)}>View Submissions</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(quiz.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">No quizzes found for this course.</div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentQuiz?.id ? 'Edit Quiz' : 'Add Quiz'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" value={currentQuiz?.title || ''} onChange={(e) => setCurrentQuiz({ ...currentQuiz!, title: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" value={currentQuiz?.description || ''} onChange={(e) => setCurrentQuiz({ ...currentQuiz!, description: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">Course</Label>
                <Select
                  value={currentQuiz?.course_id || ''}
                  onValueChange={(value) => setCurrentQuiz({ ...currentQuiz!, course_id: value })}
                  disabled
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due_date" className="text-right">Due Date</Label>
                <Input id="due_date" type="datetime-local" value={currentQuiz?.due_date ? format(new Date(currentQuiz.due_date), "yyyy-MM-dd'T'HH:mm") : ''} onChange={(e) => setCurrentQuiz({ ...currentQuiz!, due_date: e.target.value ? new Date(e.target.value).toISOString() : null })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ManageQuizzes;