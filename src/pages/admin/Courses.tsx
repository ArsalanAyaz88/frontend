import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosProgressEvent } from 'axios';
import * as z from 'zod';
import { PlusCircle, Trash2, FileQuestion } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose 
} from '@/components/ui/dialog';
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { axiosWithAuth, fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Types
interface Video {
  _id: string;
  cloudinary_url: string;
  title: string;
  description: string;
  quiz_id?: string;
}

interface Course {
  _id: string;
  title: string;
  price: number;
  total_enrollments: number;
  created_at: string;
  description?: string;
  thumbnail_url?: string;
  difficulty_level?: string;
  outcomes?: string;
  prerequisites?: string;
  curriculum?: string;
  videos?: Video[];
  is_published: boolean;
}

// Zod Schemas
const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty').optional(),
  is_correct: z.boolean().default(false).optional(),
});

const questionSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty'),
  options: z.array(optionSchema).min(2, 'Must have at least two options'),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'Must have at least one question'),
});

const videoSchema = z.object({
  video_file: z.any().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  quiz: quizSchema.optional(),
  video_preview: z.string().optional(),
});

const courseFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  thumbnail: z.any().optional(),
  difficulty_level: z.string().optional(),
  outcomes: z.string().optional(),
  prerequisites: z.string().optional(),
  curriculum: z.string().optional(),
  videos: z.array(videoSchema).optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [videoPreviews, setVideoPreviews] = useState<Record<number, string>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number | null>(null);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      thumbnail: undefined,
      difficulty_level: '',
      outcomes: '',
      prerequisites: '',
      curriculum: '',
      videos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'videos' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/admin/courses?skip=0&limit=100');
      const data = await handleApiResponse(response) as Course[];
      setCourses(data);
    } catch (error) {
      toast.error('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleEdit = async (courseId: string) => {
    try {
      const response = await fetchWithAuth(`/api/admin/courses/${courseId}`);
      const courseDetails = await handleApiResponse(response) as Course;
      form.reset({
        title: courseDetails.title,
        description: courseDetails.description || '',
        price: courseDetails.price,
        thumbnail: undefined,
        difficulty_level: courseDetails.difficulty_level || '',
        outcomes: courseDetails.outcomes || '',
        prerequisites: courseDetails.prerequisites || '',
        curriculum: courseDetails.curriculum || '',
        videos: [],
      });
      setSelectedCourse(courseDetails);
      setThumbnailPreview(courseDetails.thumbnail_url || null);
      setIsDialogOpen(true);
    } catch (error) {
      toast.error('Failed to fetch course details.');
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      await fetchWithAuth(`/api/admin/courses/${courseToDelete}`, { method: 'DELETE' });
      toast.success('Course deleted successfully!');
      setCourses(prev => prev.filter(course => course._id !== courseToDelete));
    } catch (error) {
      toast.error('Failed to delete course.');
    } finally {
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsUploading(true);
    const promise = async () => {
      const coursePayload = { ...data };
      delete coursePayload.videos;

      const courseFormData = new FormData();
      Object.entries(coursePayload).forEach(([key, value]) => {
        if (key === 'thumbnail' && value?.[0]) {
          courseFormData.append(key, value[0]);
        } else if (value !== undefined && value !== null) {
          courseFormData.append(key, String(value));
        }
      });

      const url = selectedCourse ? `/api/admin/courses/${selectedCourse._id}` : '/api/admin/courses';
      const method = selectedCourse ? 'PUT' : 'POST';

      const courseResponse = await fetchWithAuth(url, { method, body: courseFormData });
      const newOrUpdatedCourse = await handleApiResponse(courseResponse) as Course;
      const courseId = newOrUpdatedCourse._id;

      if (data.videos) {
        for (let i = 0; i < data.videos.length; i++) {
          const video = data.videos[i];
          const videoFormData = new FormData();
          videoFormData.append('title', video.title);
          videoFormData.append('description', video.description || '');
          if (video.video_file?.[0]) {
            videoFormData.append('video_file', video.video_file[0]);
          }

          const videoUrl = `/api/admin/courses/${courseId}/videos`;
          const videoResponse = await axiosWithAuth(videoUrl, {
            method: 'POST',
            data: videoFormData,
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(prev => ({ ...prev, [`video_${i}`]: percentCompleted }));
              }
            }
          });
          const newVideo = videoResponse.data as Video;

          if (video.quiz) {
            const quizPayload = { ...video.quiz, course_id: courseId };
            const quizUrl = `/api/admin/quizzes`;
            const quizResponse = await fetchWithAuth(quizUrl, { method: 'POST', body: JSON.stringify(quizPayload) });
            interface Quiz { id: string; }
            const newQuiz = await handleApiResponse(quizResponse) as Quiz;
            
            const associateUrl = `/api/admin/videos/${newVideo._id}/quiz/${newQuiz.id}`;
            await fetchWithAuth(associateUrl, { method: 'PATCH' });
          }
        }
      }
      return newOrUpdatedCourse;
    };

    toast.promise(promise(), {
      loading: 'Saving course...',
      success: () => {
        setIsDialogOpen(false);
        form.reset();
        setThumbnailPreview(null);
        setVideoPreviews({});
        setUploadProgress({});
        fetchCourses();
        setIsUploading(false);
        return selectedCourse ? 'Course updated successfully!' : 'Course created successfully!';
      },
      error: (err) => {
        setIsUploading(false);
        return (err as Error).message || 'An error occurred.';
      },
    });
  };

  const openQuizModal = (videoIndex: number) => {
    setCurrentQuizIndex(videoIndex);
    setIsQuizModalOpen(true);
  };

  // Quiz Builder Component
  const QuizBuilder = ({ videoIndex }: { videoIndex: number }) => {
    const { control, watch, setValue } = useFormContext(); // Assumes form is wrapped in FormProvider
    const quizFieldName = `videos.${videoIndex}.quiz`;
    const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({ control, name: `${quizFieldName}.questions` });

    return (
      <Dialog open={isQuizModalOpen} onOpenChange={setIsQuizModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Quiz</DialogTitle>
            <DialogDescription>Build a quiz for this video.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quiz Title</Label>
              <Input {...form.register(`videos.${videoIndex}.quiz.title` as const)} />
            </div>
            <div className="space-y-2">
              <Label>Quiz Description</Label>
              <Textarea {...form.register(`videos.${videoIndex}.quiz.description` as const)} />
            </div>
            <hr />
            {questions.map((question, qIndex) => {
              const questionFieldName = `${quizFieldName}.questions.${qIndex}`;
              const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({ control, name: `${questionFieldName}.options` });
              return (
                <div key={question.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Question {qIndex + 1}</Label>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeQuestion(qIndex)}>Remove Question</Button>
                  </div>
                                    <Textarea {...form.register(`videos.${videoIndex}.quiz.questions.${qIndex}.text` as const)} placeholder="Question text" />
                  <Label>Options</Label>
                  <Controller
                    control={control}
                    name={`${questionFieldName}.options`}
                    render={({ field }) => (
                      <RadioGroup 
                        onValueChange={(value) => {
                          const newOptions = watch(`${questionFieldName}.options`).map((opt: any, i: number) => ({ ...opt, is_correct: i === parseInt(value) }));
                          setValue(`${questionFieldName}.options`, newOptions);
                        }}
                      >
                        {options.map((option, oIndex) => (
                          <div key={option.id} className="flex items-center gap-2">
                             <RadioGroupItem value={String(oIndex)} id={`${question.id}-${oIndex}`} />
                                                        <Input {...form.register(`${questionFieldName}.options.${oIndex}.text` as any)} placeholder={`Option ${oIndex + 1}`} className="flex-grow"/>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(oIndex)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ text: '', is_correct: false })}>Add Option</Button>
                </div>
              );
            })}
            <Button type="button" onClick={() => appendQuestion({ text: '', options: [{ text: '', is_correct: true }, { text: '', is_correct: false }] })}>Add Question</Button>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsQuizModalOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button onClick={() => { setSelectedCourse(null); form.reset(); setThumbnailPreview(null); setVideoPreviews({}); setIsDialogOpen(true); }} disabled={isUploading}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Course
        </Button>
      </div>

      {/* Course List Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading courses...</TableCell>
              </TableRow>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>{course.total_enrollments}</TableCell>
                  <TableCell>{course.is_published ? 'Published' : 'Draft'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(course._id)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="ml-2" onClick={() => { setCourseToDelete(course._id); setIsDeleteDialogOpen(true); }}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No courses found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Main Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>...</DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Course metadata fields */}
            <div className="space-y-4">
              <Label>{selectedCourse ? "Existing Videos" : "Upload Videos"}</Label>
              {selectedCourse?.videos?.map(v => <div key={v._id}>{v.title}</div>)}
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Video Title</Label>
                      <Input {...form.register(`videos.${index}.title`)} />
                      <Label>Video Description</Label>
                      <Textarea {...form.register(`videos.${index}.description`)} />
                      <Label>Video File</Label>
                      <Input type="file" accept="video/*" {...form.register(`videos.${index}.video_file`)} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setVideoPreviews(prev => ({ ...prev, [index]: URL.createObjectURL(file) }));
                        form.setValue(`videos.${index}.video_file`, e.target.files);
                      }} />
                    </div>
                    <div className="space-y-2">
                      {videoPreviews[index] && <video src={videoPreviews[index]} controls className="w-full rounded-lg" />}
                      {uploadProgress[`video_${index}`] > 0 && <Progress value={uploadProgress[`video_${index}`]} className="w-full mt-2" />}
                      <Button type="button" variant="secondary" className="w-full mt-2" onClick={() => openQuizModal(index)}>
                        <FileQuestion className="mr-2 h-4 w-4" /> {form.watch(`videos.${index}.quiz`) ? 'Edit Quiz' : 'Add Quiz'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ title: '', description: '', video_file: null, quiz: undefined, video_preview: '' })} disabled={isUploading}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Video
              </Button>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isUploading}>{isUploading ? 'Saving...' : (selectedCourse ? 'Save Changes' : 'Create Course')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {currentQuizIndex !== null && <QuizBuilder videoIndex={currentQuizIndex} />}

      {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminCourses;