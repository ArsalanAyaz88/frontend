import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, MoreVertical, Edit, Trash2, Loader2, BookOpen, CheckSquare, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
import { Switch } from '@/components/ui/switch';

// --- Type Definitions ---
interface Course {
  id: string;
  title: string;
}

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string | null;
  published: boolean;
}

const ManageQuizzes = () => {
  // --- State Management ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState({ courses: true, quizzes: false });

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Partial<Quiz> | null>(null);

  const navigate = useNavigate();

  // --- Data Fetching ---
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      const response = await fetchWithAuth('/api/admin/courses');
      const data = await handleApiResponse(response);
      setCourses(data || []);
    } catch (error) {
      toast.error('Failed to fetch courses.');
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    if (!selectedCourse) {
      setQuizzes([]);
      return;
    }
    try {
      setLoading(prev => ({ ...prev, quizzes: true }));
      const response = await fetchWithAuth(`/api/admin/quizzes/courses/${selectedCourse}/quizzes`);
      const data = await handleApiResponse(response);
      setQuizzes(data || []);
    } catch (error) {
      toast.error('Failed to fetch quizzes.');
      setQuizzes([]);
    } finally {
      setLoading(prev => ({ ...prev, quizzes: false }));
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // --- Modal and Action Handlers ---
  const openModal = (quiz: Partial<Quiz> | null = null) => {
    if (quiz) {
        // For editing, format due_date if it exists
        const formattedQuiz = {
            ...quiz,
            due_date: quiz.due_date ? format(parseISO(quiz.due_date), "yyyy-MM-dd'T'HH:mm") : ''
        };
        setCurrentQuiz(formattedQuiz);
    } else {
        // For creating
        setCurrentQuiz({ title: '', description: '', due_date: '', published: false });
    }
    setIsModalOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!currentQuiz || !currentQuiz.title || !selectedCourse) {
      toast.error('Quiz title is required.');
      return;
    }

    const isEditing = !!currentQuiz.id;
    const url = isEditing
      ? `/api/admin/quizzes/quizzes/${currentQuiz.id}`
      : `/api/admin/quizzes/courses/${selectedCourse}/quizzes`;
    const method = isEditing ? 'PUT' : 'POST';

    const body = {
      ...currentQuiz,
      due_date: currentQuiz.due_date ? new Date(currentQuiz.due_date).toISOString() : null,
    };

    try {
      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(body),
      });
      await handleApiResponse(response);
      toast.success(`Quiz ${isEditing ? 'updated' : 'created'} successfully!`);
      setIsModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} quiz.`);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;

    try {
      const response = await fetchWithAuth(`/api/admin/quizzes/quizzes/${quizId}`, { method: 'DELETE' });
      await handleApiResponse(response);
      toast.success('Quiz deleted successfully!');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to delete quiz.');
    }
  };

  // --- Placeholder Handlers ---
  const handleManageQuestions = (quizId: string) => {
    navigate(`/admin/quizzes/${quizId}/questions`);
  };

  const handleViewSubmissions = (quizId: string) => {
    navigate(`/admin/quizzes/${quizId}/submissions`);
  };

  // --- Render ---
  return (
    <DashboardLayout userType="admin">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Quizzes</CardTitle>
          <div className="flex gap-4">
            <Select onValueChange={setSelectedCourse} value={selectedCourse}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a Course" />
              </SelectTrigger>
              <SelectContent>
                {loading.courses ? (
                  <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : (
                  courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button onClick={() => openModal()} disabled={!selectedCourse}>
              <Plus className="mr-2 h-4 w-4" /> Create Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading.quizzes ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : quizzes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map(quiz => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.due_date ? format(parseISO(quiz.due_date), 'PPP p') : 'No due date'}</TableCell>
                    <TableCell>{quiz.published ? 'Published' : 'Draft'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openModal(quiz)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageQuestions(quiz.id)}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Manage Questions</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewSubmissions(quiz.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Submissions</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteQuiz(quiz.id)} className="text-red-500">
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
            <div className="text-center py-8 text-gray-500">
              <p>{selectedCourse ? 'No quizzes found for this course.' : 'Please select a course to see its quizzes.'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Quiz Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentQuiz?.id ? 'Edit Quiz Details' : 'Create New Quiz'}</DialogTitle>
          </DialogHeader>
          {currentQuiz && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quizTitle">Quiz Title</Label>
                <Input 
                  id="quizTitle" 
                  value={currentQuiz.title} 
                  onChange={(e) => setCurrentQuiz({ ...currentQuiz, title: e.target.value })}
                  placeholder="e.g., Chapter 1 Review"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quizDesc">Description</Label>
                <Textarea 
                  id="quizDesc" 
                  value={currentQuiz.description}
                  onChange={(e) => setCurrentQuiz({ ...currentQuiz, description: e.target.value })}
                  placeholder="Enter a brief description for the quiz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input 
                  id="dueDate" 
                  type="datetime-local" 
                  value={currentQuiz.due_date || ''}
                  onChange={(e) => setCurrentQuiz({ ...currentQuiz, due_date: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="published" 
                  checked={currentQuiz.published}
                  onCheckedChange={(checked) => setCurrentQuiz({ ...currentQuiz, published: checked })}
                />
                <Label htmlFor="published">Publish Quiz</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveQuiz}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageQuizzes;