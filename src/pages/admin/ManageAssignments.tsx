import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, MoreVertical, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
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

// --- Type Definitions ---
interface Course {
  id: string;
  title: string;
}

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
}

interface Submission {
  id: string;
  student: { id: string; name: string; };
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
}

// --- Main Component ---
const ManageAssignments = () => {
  // --- State Management ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState({ courses: true, assignments: false, submissions: false });

  // Modals State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  
  // Submissions Data
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Form State
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  // --- API Calls ---
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      const response = await fetchWithAuth('/api/admin/courses');
      const data = await handleApiResponse(response);
      setCourses(data || []); // Correctly handle direct array response
    } catch (error) {
      toast.error('Failed to fetch courses.');
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    if (!selectedCourse) {
      setAssignments([]);
      return;
    }
    try {
      setLoading(prev => ({ ...prev, assignments: true }));
      const response = await fetchWithAuth(`/api/admin/admin/courses/${selectedCourse}/assignments`);
      const data = await handleApiResponse(response);
      setAssignments(data || []);
    } catch (error) {
      toast.error('Failed to fetch assignments.');
      setAssignments([]);
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // --- Modal Handlers ---
  const openCreateModal = () => {
    setEditingAssignment(null);
    setAssignmentTitle('');
    setAssignmentDesc('');
    setAssignmentDueDate('');
    setIsAssignmentModalOpen(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentTitle(assignment.title);
    setAssignmentDesc(assignment.description);
    const localDueDate = new Date(assignment.due_date).toISOString().slice(0, 16);
    setAssignmentDueDate(localDueDate);
    setIsAssignmentModalOpen(true);
  };

  // --- CRUD Handlers ---
  const handleSaveAssignment = async () => {
    if (!assignmentTitle || !assignmentDesc || !assignmentDueDate) {
      toast.error('Please fill all fields.');
      return;
    }
    const body = {
      title: assignmentTitle,
      description: assignmentDesc,
      due_date: new Date(assignmentDueDate).toISOString(),
      course_id: selectedCourse
    };

    const url = editingAssignment
      ? `/api/admin/courses/${selectedCourse}/assignments/${editingAssignment.id}`
      : `/api/admin/admin/courses/${selectedCourse}/assignments`;
    const method = editingAssignment ? 'PUT' : 'POST';

    try {
      const response = await fetchWithAuth(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      await handleApiResponse(response);
      toast.success(`Assignment ${editingAssignment ? 'updated' : 'created'} successfully!`);
      setIsAssignmentModalOpen(false);
      fetchAssignments();
    } catch (error) {
      toast.error(`Failed to ${editingAssignment ? 'update' : 'create'} assignment.`);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) return;
    try {
      const response = await fetchWithAuth(`/api/admin/admin/courses/${selectedCourse}/assignments/${assignmentId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Assignment deleted successfully!');
        fetchAssignments();
      } else {
        const result = await handleApiResponse(response);
        toast.error(result.detail || 'Failed to delete assignment.');
      }
    } catch (error) {
      toast.error('Failed to delete assignment.');
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setViewingSubmissionsFor(assignment);
    try {
      setLoading(prev => ({ ...prev, submissions: true }));
      const response = await fetchWithAuth(`/api/admin/courses/${assignment.course_id}/assignments/${assignment.id}/submissions/students`);
      const data = await handleApiResponse(response);
      setSubmissions(data || []);
    } catch (error) {
      toast.error('Failed to fetch submissions.');
      setSubmissions([]);
    } finally {
      setLoading(prev => ({ ...prev, submissions: false }));
    }
  };

  const handleGradeSubmission = async () => {
    if (!grade || !gradingSubmission || !viewingSubmissionsFor) return;
    try {
      const response = await fetchWithAuth(`/api/admin/courses/${viewingSubmissionsFor.course_id}/assignments/${viewingSubmissionsFor.id}/submissions/${gradingSubmission.id}/grade`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grade: parseInt(grade), feedback })
      });
      await handleApiResponse(response);
      toast.success('Submission graded successfully!');
      setGradingSubmission(null);
      handleViewSubmissions(viewingSubmissionsFor); // Refresh submissions list
    } catch (error) {
      toast.error('Failed to grade submission.');
    }
  };

  // --- Render Method ---
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Assignments</h1>
          <Button onClick={openCreateModal} disabled={!selectedCourse || loading.assignments}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
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
                {courses.map(course => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourse && (
          <Card>
            <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
            <CardContent>
              {loading.assignments ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : assignments.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {assignments.map(assignment => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>{new Date(assignment.due_date).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewSubmissions(assignment)}><Eye className="mr-2 h-4 w-4" /><span>View Submissions</span></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(assignment)}><Edit className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteAssignment(assignment.id)}><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No assignments have been added for this course yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* --- Modals --- */}
      <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="desc" className="text-right">Description</Label><Textarea id="desc" value={assignmentDesc} onChange={e => setAssignmentDesc(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="due" className="text-right">Due Date</Label><Input id="due" type="datetime-local" value={assignmentDueDate} onChange={e => setAssignmentDueDate(e.target.value)} className="col-span-3" /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose><Button onClick={handleSaveAssignment}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingSubmissionsFor} onOpenChange={(isOpen) => !isOpen && setViewingSubmissionsFor(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Submissions for "{viewingSubmissionsFor?.title}"</DialogTitle></DialogHeader>
          {loading.submissions ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : submissions.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Submitted At</TableHead><TableHead>Grade</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {submissions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.student.name}</TableCell>
                    <TableCell>{new Date(sub.submitted_at).toLocaleString()}</TableCell>
                    <TableCell>{sub.grade ?? 'Not Graded'}</TableCell>
                    <TableCell className="text-right"><Button size="sm" onClick={() => { setGradingSubmission(sub); setGrade(String(sub.grade ?? '')); setFeedback(sub.feedback ?? ''); }}>Grade</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground p-8">No one has submitted this assignment yet.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!gradingSubmission} onOpenChange={(isOpen) => !isOpen && setGradingSubmission(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grade Submission</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label htmlFor="grade">Grade</Label><Input id="grade" type="number" value={grade} onChange={e => setGrade(e.target.value)} /></div>
            <div><Label htmlFor="feedback">Feedback</Label><Textarea id="feedback" value={feedback} onChange={e => setFeedback(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setGradingSubmission(null)}>Cancel</Button><Button onClick={handleGradeSubmission}>Submit Grade</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageAssignments;

