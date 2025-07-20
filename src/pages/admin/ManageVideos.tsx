import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Loader2, Trash2, Pencil, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// --- Type Definitions ---
interface Course {
  id: string;
  title: string;
}

interface CloudinarySignature {
  api_key: string;
  timestamp: string;
  signature: string;
  folder: string;
  cloud_name: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  cloudinary_url: string;
  course_id: string;
  order: number;
  // We will add quiz details later
}

interface Option {
  id?: string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id?: string;
  text: string;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  video_id: string;
  questions?: Question[];
}

const ManageVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Quiz Management State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const fetchVideosByCourse = useCallback(async (courseId: string) => {
    if (!courseId) return;
    setLoadingVideos(true);
    setVideos([]);
    try {
      // TODO: This endpoint needs to be created in the backend
      const response = await fetchWithAuth(`/api/admin/videos?course_id=${courseId}`);
      const data = await handleApiResponse(response);
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch videos for the selected course.');
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const response = await fetchWithAuth('/api/admin/courses');
      const data = await handleApiResponse(response);
      setCourses(Array.isArray(data) ? data : []);
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
      fetchVideosByCourse(selectedCourseId);
    }
  }, [selectedCourseId, fetchVideosByCourse]);

  const handleOpenModal = (video: Video | null = null) => {
    if (video) {
      setCurrentVideo(video);
    } else {
      if (!selectedCourseId) {
        toast.error('Please select a course first to add a video.');
        return;
      }
      const nextOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order)) + 1 : 1;
      setCurrentVideo({ id: '', title: '', description: '', cloudinary_url: '', course_id: selectedCourseId, order: nextOrder });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };



  const handleDelete = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      // TODO: This endpoint needs to be created in the backend
      const response = await fetchWithAuth(`/api/admin/videos/${videoId}`, { method: 'DELETE' });
      await handleApiResponse(response);
      toast.success('Video deleted successfully!');
      if (selectedCourseId) {
        fetchVideosByCourse(selectedCourseId);
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete video.');
    }
  };

  const handleSave = async () => {
    if (!currentVideo || !selectedCourseId) return;

    let videoUrl = currentVideo.cloudinary_url;

    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const sigResponse = await fetchWithAuth('/api/admin/cloudinary-signature');
        const sigData = await handleApiResponse(sigResponse) as CloudinarySignature;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('api_key', sigData.api_key);
        formData.append('timestamp', sigData.timestamp);
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);

        const onUploadProgress = (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        };

        const uploadResponse = await axios.post(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/video/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress,
        });

        videoUrl = uploadResponse.data.secure_url;
        toast.success('Video uploaded successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Video upload failed. Please try again.');
        setIsUploading(false);
        return;
      }
    }

    if (!videoUrl) {
      toast.error('No video URL available. Please upload a file.');
      setIsUploading(false);
      return;
    }

    const videoData = {
      title: currentVideo.title,
      description: currentVideo.description,
      cloudinary_url: videoUrl,
      course_id: selectedCourseId,
      order: currentVideo.order,
    };

    try {
      const response = currentVideo.id
        ? await fetchWithAuth(`/api/admin/videos/${currentVideo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(videoData),
          })
        : await fetchWithAuth('/api/admin/videos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(videoData),
          });

      const savedVideo = await handleApiResponse(response) as Video;

      if (currentVideo.id) {
        // This is an UPDATE
        setVideos(videos.map(v => v.id === savedVideo.id ? savedVideo : v));
        toast.success('Video updated successfully!');
        handleCloseModal(); // Close modal and reset state
      } else {
        // This is a CREATE
        setVideos(prevVideos => [...prevVideos, savedVideo]);
        toast.success('Video created successfully!');
        setIsModalOpen(false); // Programmatically close the video modal
        // Ensure the savedVideo object with the new ID is passed correctly
        handleOpenQuizModal(savedVideo);
      }
    } catch (error) {
      toast.error('Failed to save video details.');
    } finally {
      setIsUploading(false);
    }
  };

        const handleOpenQuizModal = async (video: Video) => {
    if (!video || !video.id) {
      toast.error("Cannot open quiz modal: Invalid video data.");
      return;
    }

    setCurrentVideo(video);
    setIsQuizModalOpen(true);
    setLoadingQuiz(true);

    try {
      // Use video.id directly from the argument to prevent issues with stale state
      const response = await fetchWithAuth(`/api/admin/videos/${video.id}/quiz`);
      if (response.ok) {
        const existingQuiz = await response.json();
        setCurrentQuiz(existingQuiz);
      } else if (response.status === 404) {
        // No quiz exists, initialize a new one for the form
        setCurrentQuiz({ id: '', title: '', description: '', questions: [], video_id: video.id });
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to load quiz data.');
        setIsQuizModalOpen(false);
      }
    } catch (error) {
      toast.error('An error occurred while fetching the quiz.');
      setIsQuizModalOpen(false);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuizChange = (field: keyof Omit<Quiz, 'questions'>, value: string) => {
    if (!currentQuiz) return;
    setCurrentQuiz({ ...currentQuiz, [field]: value });
  };

  const handleQuestionChange = (qIndex: number, field: keyof Question, value: string) => {
    if (!currentQuiz) return;
    const questions = [...(currentQuiz.questions || [])];
    questions[qIndex] = { ...questions[qIndex], [field]: value };
    setCurrentQuiz({ ...currentQuiz, questions });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, field: keyof Option, value: string | boolean) => {
    if (!currentQuiz) return;
    const questions = [...(currentQuiz.questions || [])];
    const options = [...(questions[qIndex].options || [])];
    options[oIndex] = { ...options[oIndex], [field]: value };
    // When an option is marked as correct, uncheck others
    if (field === 'is_correct' && value === true) {
      options.forEach((opt, i) => {
        if (i !== oIndex) opt.is_correct = false;
      });
    }
    questions[qIndex] = { ...questions[qIndex], options };
    setCurrentQuiz({ ...currentQuiz, questions });
  };

  const addQuestion = () => {
    if (!currentQuiz) return;
    const questions = [...(currentQuiz.questions || [])];
    questions.push({ text: '', options: [{ text: '', is_correct: true }] });
    setCurrentQuiz({ ...currentQuiz, questions });
  };

  const removeQuestion = (qIndex: number) => {
    if (!currentQuiz) return;
    const questions = [...(currentQuiz.questions || [])];
    questions.splice(qIndex, 1);
    setCurrentQuiz({ ...currentQuiz, questions });
  };

  const addOption = (qIndex: number) => {
    if (!currentQuiz) return;
    const questions = [...(currentQuiz.questions || [])];
    const options = [...(questions[qIndex].options || [])];
    options.push({ text: '', is_correct: false });
    questions[qIndex] = { ...questions[qIndex], options };
    setCurrentQuiz({ ...currentQuiz, questions });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    if (!currentQuiz) return;
    const questions = [...(currentQuiz.questions || [])];
    const options = [...(questions[qIndex].options || [])];
    options.splice(oIndex, 1);
    questions[qIndex] = { ...questions[qIndex], options };
    setCurrentQuiz({ ...currentQuiz, questions });
  };

  const handleSaveQuiz = async () => {
    if (!currentQuiz || !currentVideo?.id) {
      toast.error("Cannot save quiz without a selected video.");
      return;
    }

    const quizData = {
      title: currentQuiz.title,
      description: currentQuiz.description,
      questions: currentQuiz.questions?.map(q => ({
        text: q.text,
        options: q.options.map(o => ({ text: o.text, is_correct: o.is_correct }))
      }))
    };

    try {
      // Always use the ID from the video being edited
      const videoId = currentVideo.id;
      const response = await fetchWithAuth(`/api/admin/videos/${videoId}/quiz`, {
        method: 'POST', // The backend upserts, so POST is fine
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });

      await handleApiResponse(response);
      toast.success('Quiz saved successfully!');
      setIsQuizModalOpen(false);
      setCurrentQuiz(null);
    } catch (error) {
      toast.error('Failed to save the quiz. Please check the details and try again.');
      console.error("Quiz save error:", error);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Videos</h1>
        <div className="flex items-center space-x-4">
            {loadingCourses ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                        {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                                {course.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            <Button onClick={() => handleOpenModal()} disabled={!selectedCourseId}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Video
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video List</CardTitle>
          <CardDescription>A list of videos for the selected course.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingVideos ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : videos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>{video.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(video)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(video.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No videos found for this course.</p>
              <p className="text-sm text-gray-400">Select a course to see its videos or add a new one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isOpen && isModalOpen) handleCloseModal(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentVideo?.id ? 'Edit Video' : 'Add New Video'}</DialogTitle>
            <p className="text-sm text-muted-foreground">{currentVideo?.id ? 'Update the video details or upload a new file to replace the existing one.' : 'Upload a video and add its details.'}</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={currentVideo?.title || ''} onChange={(e) => setCurrentVideo(prev => prev ? { ...prev, title: e.target.value } : null)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order" className="text-right">Order</Label>
              <Input id="order" type="number" value={currentVideo?.order || 0} onChange={(e) => setCurrentVideo(prev => prev ? { ...prev, order: parseInt(e.target.value, 10) } : null)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={currentVideo?.description || ''} onChange={(e) => setCurrentVideo(prev => prev ? { ...prev, description: e.target.value } : null)} className="col-span-3" />
            </div>

            {currentVideo?.id && currentVideo.cloudinary_url && (
              <div className="space-y-2">
                <Label>Current Video</Label>
                <video src={currentVideo.cloudinary_url} controls className="w-full rounded-md"></video>
                <p className="text-sm text-muted-foreground">To replace this video, upload a new file below.</p>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="video-file" className="text-right">Video File</Label>
              <div className="col-span-3">
                <Input id="video-file" type="file" accept="video/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="mb-2" />
                {isUploading && <Progress value={uploadProgress} className="w-full" />}
                {currentVideo?.cloudinary_url && !selectedFile && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Current video: <a href={currentVideo.cloudinary_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                  </div>
                )}
              </div>
            </div>
            {currentVideo && (
              <div className="grid grid-cols-4 items-center gap-4 pt-4 border-t mt-4">
                <Label className="text-right">Quiz</Label>
                <div className="col-span-3">
                    <Button variant="outline" onClick={() => handleOpenQuizModal(currentVideo!)}>Manage Quiz</Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
                        <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 
              {currentVideo?.id ? 'Save Changes' : 'Upload & Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Management Dialog */}
      <Dialog open={isQuizModalOpen} onOpenChange={(isOpen) => { if (!isOpen && isQuizModalOpen) setIsQuizModalOpen(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Quiz</DialogTitle>
            <p className="text-sm text-muted-foreground">Create or edit the quiz for this video.</p>
          </DialogHeader>
          {loadingQuiz ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : currentQuiz && (
            <div className="flex flex-col h-full">
              <div className="space-y-4 p-1 flex-grow overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title">Quiz Title</Label>
                  <Input id="quiz-title" value={currentQuiz.title} onChange={(e) => handleQuizChange('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-description">Quiz Description</Label>
                  <Textarea id="quiz-description" value={currentQuiz.description} onChange={(e) => handleQuizChange('description', e.target.value)} />
                </div>
                <h3 className="text-lg font-semibold pt-4 border-b">Questions</h3>
                {currentQuiz.questions?.map((q, qIndex) => (
                  <div key={q.id || qIndex} className="p-4 border rounded-md space-y-3 bg-muted/50">
                    <div className="flex justify-between items-center">
                      <Label>Question {qIndex + 1}</Label>
                      <Button variant="destructive" size="sm" onClick={() => removeQuestion(qIndex)}>Remove</Button>
                    </div>
                    <Textarea placeholder="Question text" value={q.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} />
                    <h4 className="text-md font-semibold pt-2">Options</h4>
                    {q.options.map((opt, oIndex) => (
                      <div key={opt.id || oIndex} className="flex items-center gap-2 p-2 rounded-md hover:bg-background">
                        <Checkbox id={`q${qIndex}-o${oIndex}-correct`} checked={opt.is_correct} onCheckedChange={(checked) => handleOptionChange(qIndex, oIndex, 'is_correct', !!checked)} />
                        <Input className="flex-1" placeholder={`Option ${oIndex + 1}`} value={opt.text} onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)} />
                        <Button variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addOption(qIndex)}>Add Option</Button>
                  </div>
                ))}
                <Button onClick={addQuestion}>Add Question</Button>
              </div>
              <DialogFooter className="pt-4 border-t">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveQuiz}>Save Quiz</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageVideos;
