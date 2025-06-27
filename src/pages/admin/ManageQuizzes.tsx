import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, MoreVertical, Edit, Trash2, Loader2, X } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';

interface Course {
  id: string;
  title: string;
}

interface Option {
  text: string;
  is_correct: boolean;
}

interface Question {
  text: string;
  is_multiple_choice: boolean;
  options: Option[];
}

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string;
  time_limit: number; // in minutes
  due_date: string;
  questions?: Question[];
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
  const [questions, setQuestions] = useState<Question[]>([]);

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
    if (!quizTitle || !quizDesc || !timeLimit || !dueDate || !selectedCourse) {
      toast.error('Please fill all quiz details and select a course.');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question to the quiz.');
      return;
    }

    for (const question of questions) {
      if (!question.text.trim()) {
        toast.error('All questions must have text.');
        return;
      }
      if (question.options.length < 2) {
        toast.error(`Question "${question.text}" must have at least two options.`);
        return;
      }
      if (!question.options.some(opt => opt.is_correct)) {
        toast.error(`A correct answer must be selected for question "${question.text}".`);
        return;
      }
      if (question.options.some(opt => !opt.text.trim())) {
        toast.error(`All options for question "${question.text}" must have text.`);
        return;
      }
    }

    const body = {
      title: quizTitle,
      description: quizDesc,
      time_limit: parseInt(timeLimit, 10),
      due_date: new Date(dueDate).toISOString(),
      questions: questions.map(q => ({
        text: q.text,
        is_multiple_choice: q.is_multiple_choice,
        options: q.options.map(o => ({
          text: o.text,
          is_correct: o.is_correct,
        })),
      })),
    };

    const baseUrl = 'https://student-portal-lms-seven.vercel.app/api';
    const endpoint = editingQuiz
      ? `/admin/courses/${selectedCourse}/quizzes/${editingQuiz.id}`
      : `/admin/courses/${selectedCourse}/quizzes`;

    const method = editingQuiz ? 'PUT' : 'POST';
    const token = localStorage.getItem('admin_access_token');

    try {
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
      toast.error(error.message || `Failed to ${editingQuiz ? 'update' : 'create'} quiz.`);
    }
  };

  // Handle Delete Quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!selectedCourse || !window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetchWithAuth(
        `https://student-portal-lms-seven.vercel.app/api/admin/courses/${selectedCourse}/quizzes/${quizId}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
      );
      await handleApiResponse(response);
      toast.success('Quiz deleted successfully!');
      fetchQuizzes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete quiz.');
    }
  };

  // --- Modal and Question Handlers ---
  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizTitle(quiz.title);
    setQuizDesc(quiz.description || '');
    setTimeLimit(String(quiz.time_limit || 30));
    setDueDate(quiz.due_date ? format(new Date(quiz.due_date), "yyyy-MM-dd'T'HH:mm") : '');
    setQuestions(quiz.questions || []);
    setIsQuizModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingQuiz(null);
    setQuizTitle('');
    setQuizDesc('');
    setTimeLimit('30');
    setDueDate('');
    setQuestions([]);
    setIsQuizModalOpen(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', is_multiple_choice: false, options: [{ text: '', is_correct: true }, { text: '', is_correct: false }] }]);
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  const handleQuestionChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleMultipleChoiceChange = (qIndex: number, isChecked: boolean) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    question.is_multiple_choice = isChecked;
    if (!isChecked) {
      let firstCorrectFound = false;
      question.options.forEach(opt => {
        if (opt.is_correct) {
          if (firstCorrectFound) opt.is_correct = false;
          firstCorrectFound = true;
        }
      });
      if (!firstCorrectFound && question.options.length > 0) {
        question.options[0].is_correct = true;
      }
    }
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(newQuestions);
  };

  const handleOptionTextChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    if (question.is_multiple_choice) {
      question.options[oIndex].is_correct = !question.options[oIndex].is_correct;
    } else {
      question.options.forEach((option, i) => { option.is_correct = i === oIndex; });
    }
    setQuestions(newQuestions);
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Quiz Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Quiz Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quizTitle">Title</Label>
                  <Input id="quizTitle" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Enter quiz title" />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input id="timeLimit" type="number" min="1" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="quizDesc">Description</Label>
                <Textarea id="quizDesc" value={quizDesc} onChange={(e) => setQuizDesc(e.target.value)} placeholder="Enter quiz description" rows={3} />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">Questions</h4>
                <Button size="sm" onClick={addQuestion}><Plus className="mr-2 h-4 w-4" /> Add Question</Button>
              </div>
              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Question {qIndex + 1}</Label>
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)}><X className="h-4 w-4" /></Button>
                    </div>
                    <Textarea
                      value={q.text}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      placeholder={`Enter text for question ${qIndex + 1}`}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`mc-${qIndex}`}
                        checked={q.is_multiple_choice}
                        onCheckedChange={(checked) => handleMultipleChoiceChange(qIndex, !!checked)}
                      />
                      <Label htmlFor={`mc-${qIndex}`}>Allow multiple correct answers</Label>
                    </div>

                    {/* Options Section */}
                    <div className="space-y-2 pl-4">
                      <Label>Options</Label>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <Checkbox
                            checked={opt.is_correct}
                            onCheckedChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                          />
                          <Input
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-grow"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)} disabled={q.options.length <= 2}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addOption(qIndex)}><Plus className="mr-2 h-4 w-4" /> Add Option</Button>
                    </div>
                  </div>
                ))}
              </div>
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