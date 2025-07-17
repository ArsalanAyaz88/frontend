import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useFormContext, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosProgressEvent } from 'axios';
import * as z from 'zod';
import { PlusCircle, Trash2, FileQuestion, Pencil } from 'lucide-react';
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

// Define the shape of the quiz form data
interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

interface QuizFormData {
  title: string;
  description: string;
  course_id: string;
  due_date: string | null;
  questions: Question[];
}
import { axiosWithAuth, fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Types
interface Video {
  _id?: string;
  id?: string;
  cloudinary_url: string;
  title: string;
  description: string;
  quiz_id?: string;
  video_file?: FileList | File | null;
  quiz?: any;
  video_preview?: string;
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

const videoEditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type VideoEditFormData = z.infer<typeof videoEditSchema>;

type CourseFormData = z.infer<typeof courseFormSchema>;

interface QuizBuilderProps {
  videoIndex: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  existingVideo: Video | null;
  mainFormMethods: UseFormReturn<CourseFormData>;
  quizFormMethods: UseFormReturn<QuizFormData>;
  onQuizSubmit: (data: QuizFormData) => void;
}

interface OptionsBuilderProps {
  videoIndex: number;
  questionIndex: number;
}

const OptionsBuilder = ({ videoIndex, questionIndex }: OptionsBuilderProps) => {
  const { control, register, watch, setValue } = useFormContext<CourseFormData>();
  const optionsFieldName = `videos.${videoIndex}.quiz.questions.${questionIndex}.options` as const;
  const { fields, append, remove } = useFieldArray({
    control,
    name: optionsFieldName,
  });

  const handleCorrectAnswerChange = (selectedIndex: number) => {
    fields.forEach((field, index) => {
      setValue(`${optionsFieldName}.${index}.is_correct` as const, index === selectedIndex);
    });
  };

  const correctOptionIndex = watch(optionsFieldName)?.findIndex(opt => opt.is_correct);

  return (
    <div className="space-y-2">
      <RadioGroup
        value={correctOptionIndex !== -1 && correctOptionIndex !== undefined ? correctOptionIndex.toString() : ""}
        onValueChange={(value) => handleCorrectAnswerChange(parseInt(value, 10))}
      >
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2">
            <RadioGroupItem value={index.toString()} id={`${optionsFieldName}.${index}.radio`} />
            <Input
              {...register(`${optionsFieldName}.${index}.text` as const)}
              placeholder={`Option ${index + 1}`}
            />
          </div>
        ))}
      </RadioGroup>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ text: '', is_correct: false })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Option
      </Button>
    </div>
  );
};

const QuizBuilder = ({ 
  videoIndex, 
  isOpen, 
  onOpenChange, 
  existingVideo,
  mainFormMethods,
  quizFormMethods,
  onQuizSubmit
}: QuizBuilderProps) => {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<CourseFormData>();
  const quizFieldName = `videos.${videoIndex}.quiz`;
  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({ control, name: `${quizFieldName}.questions` });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quiz</DialogTitle>
          <DialogDescription>
            Build a quiz for this video. Add questions and mark the correct answers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {questions.map((question, qIndex) => {
            return (
              <div key={question.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Question {qIndex + 1}</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <Input {...register(`videos.${videoIndex}.quiz.questions.${qIndex}.text`)} placeholder="Question text" />
                <div className="pl-4 space-y-2">
                  <Label>Options</Label>
                  <OptionsBuilder videoIndex={videoIndex} questionIndex={qIndex} />
                </div>
              </div>
            );
          })}
          <Button type="button" onClick={() => appendQuestion({ text: '', options: [{ text: '', is_correct: true }, { text: '', is_correct: false }] })}>Add Question</Button>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface Quiz {
  title: string;
  description?: string;
  questions: {
    text: string;
    options: {
      text?: string;
      is_correct?: boolean;
    }[];
  }[];
}

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<{ courseId: string; videoId: string } | null>(null);
  const [isDeleteVideoDialogOpen, setIsDeleteVideoDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingQuizForVideo, setEditingQuizForVideo] = useState<Video | null>(null);
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [videoPreviews, setVideoPreviews] = useState<Record<number, string>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

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

  const quizForm = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema.extend({
      course_id: z.string(),
      due_date: z.string().nullable(),
    })),
    defaultValues: {
      title: '',
      description: '',
      questions: [],
      course_id: '',
      due_date: null,
    },
  });

  const videoEditForm = useForm<VideoEditFormData>({
    resolver: zodResolver(videoEditSchema),
  });

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEdit = async (courseId: string) => {
    try {
      const response = await fetchWithAuth(`/api/admin/courses/${courseId}`);
      const courseDetails = await handleApiResponse(response) as Course;
      form.reset({
        title: courseDetails.title,
        description: courseDetails.description || '',
        price: courseDetails.price,
        thumbnail: undefined, // Don't try to repopulate file input
        difficulty_level: courseDetails.difficulty_level || '',
        outcomes: courseDetails.outcomes || '',
        prerequisites: courseDetails.prerequisites || '',
        curriculum: courseDetails.curriculum || '',
        videos: [], // Videos are handled separately, not part of the main form data for edit
      });
      setSelectedCourse(courseDetails);
      setThumbnailPreview(courseDetails.thumbnail_url || null);
      // Reset video previews and fields when opening edit dialog
      setVideoPreviews({});
      remove(); // Clear all video fields from previous state
      setIsDialogOpen(true);
    } catch (error) {
      toast.error('Failed to fetch course details.');
    }
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      await fetchWithAuth(`/api/v1/videos/${videoToDelete.videoId}`, { method: 'DELETE' });
      toast.success('Video deleted successfully!');
      // Refresh course details to show updated video list
      if (selectedCourse) {
        handleEdit(selectedCourse._id);
      }
    } catch (error) {
      toast.error('Failed to delete video.');
    } finally {
      setVideoToDelete(null);
    }
  };

  const openQuizModalForExistingVideo = async (video: Video) => {
    setEditingQuizForVideo(video);
    if (video.quiz_id) {
      try {
        const response = await fetchWithAuth(`/api/v1/videos/${video._id}/quiz`);
        const quizData = await handleApiResponse<Quiz>(response);
        quizForm.reset({
          ...quizData,
          questions: quizData.questions.map((q) => {
            const correctOption = q.options.find((opt) => opt.is_correct);
            return {
              question: q.text,
              options: q.options.map((opt) => opt.text),
              correct_answer: correctOption ? correctOption.text : '',
            };
          }),
        });
      } catch (error) {
        toast.error('Failed to fetch existing quiz data.');
        quizForm.reset({}); // Reset to empty form on error
      }
    } else {
      quizForm.reset({}); // No quiz exists, open an empty form
    }
    setIsQuizModalOpen(true);
  };

  const onUpdateVideoSubmit = async (data: VideoEditFormData) => {
    if (!editingVideo) return;
    try {
      await axiosWithAuth(`/api/v1/videos/${editingVideo._id}`, {
        method: 'PATCH',
        data,
      });
      toast.success('Video updated successfully!');
      if (selectedCourse) {
        handleEdit(selectedCourse._id);
      }
    } catch (error) {
      toast.error('Failed to update video.');
    } finally {
      setIsEditVideoDialogOpen(false);
      setEditingVideo(null);
    }
  };

  const handleRemoveQuiz = async (videoId: string) => {
    try {
      await fetchWithAuth(`/api/v1/videos/${videoId}/quiz`, { method: 'DELETE' });
      toast.success('Quiz removed successfully!');
      if (selectedCourse) {
        handleEdit(selectedCourse._id);
      }
    } catch (error) {
      toast.error('Failed to remove quiz.');
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
    console.log('Form submitted with data:', data);
    setIsUploading(true);
    const promise = async () => {
      try {
        // First, validate the form data
        await form.trigger();
        
        // Check if there are any form errors
        const formState = form.formState;
        if (Object.keys(formState.errors).length > 0) {
          console.error('Form validation errors:', formState.errors);
          throw new Error('Please fix the form errors before submitting.');
        }

        // Create course payload with all necessary fields
        const coursePayload = { 
          title: data.title,
          description: data.description,
          price: data.price,
          difficulty_level: data.difficulty_level,
          outcomes: data.outcomes,
          prerequisites: data.prerequisites,
          curriculum: data.curriculum
        };
        
        // Store videos data for later processing
        const videosData = data.videos?.filter((v): v is NonNullable<typeof v> => v !== null && v !== undefined) || [];

      const courseFormData = new FormData();
      
      // Handle thumbnail separately if it exists
      const thumbnailFile = Array.isArray(data.thumbnail) 
        ? data.thumbnail[0] 
        : data.thumbnail;
      
      if (thumbnailFile instanceof File) {
        courseFormData.append('thumbnail', thumbnailFile);
      } else if (data.thumbnail) {
        // Handle case where thumbnail is a string URL (existing thumbnail)
        courseFormData.append('thumbnail_url', String(data.thumbnail));
      }

      // Append other course data to FormData
      Object.entries(coursePayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          courseFormData.append(key, String(value));
        }
      });

      const url = selectedCourse
        ? `/api/admin/courses/${selectedCourse._id}`
        : '/api/admin/courses';
      const method = selectedCourse ? 'PUT' : 'POST';

      const courseResponse = await axiosWithAuth(url, {
        method,
        data: courseFormData,
      });

      const newOrUpdatedCourse = courseResponse.data as Course;
      const courseId = newOrUpdatedCourse._id;

      // Now, upload videos if any are present
      if (videosData.length > 0) {
        for (let i = 0; i < videosData.length; i++) {
          const video = videosData[i] as Video & { video_file?: FileList | File | null; quiz?: any };
          if (!video) continue;
          
          const videoFormData = new FormData();
          
          // Add required video fields
          if (video.title) videoFormData.append('title', video.title);
          if (video.description) videoFormData.append('description', video.description);
          
          // Handle video file upload if present
          const videoFile = Array.isArray(video.video_file) 
            ? video.video_file[0] 
            : video.video_file;
            
          if (videoFile instanceof File) {
            videoFormData.append('video_file', videoFile);
          } else if (!selectedCourse) {
            // Only require video file for new courses
            throw new Error(`Video file is required for video ${i + 1}`);
          }
          
          // Handle quiz data if present
          if (video.quiz) {
            try {
              videoFormData.append('quiz', JSON.stringify(video.quiz));
            } catch (error) {
              console.error('Error stringifying quiz data:', error);
              throw new Error(`Invalid quiz data for video: ${video.title || 'Untitled'}`);
            }
          }

          try {
            const videoUrl = `/api/v1/courses/${courseId}/videos`;
            // Check for both _id and id for backward compatibility
            const videoId = video._id || video.id;
            const method = videoId ? 'PUT' : 'POST';
            const url = videoId ? `${videoUrl}/${videoId}` : videoUrl;
            
            console.log(`Uploading video ${i + 1} with method ${method} to ${url}`);
            
            await axiosWithAuth(url, {
              method,
              data: videoFormData,
              onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setUploadProgress(prev => ({ ...prev, [`video_${i}`]: percentCompleted }));
                }
              }
            });
          } catch (error) {
            console.error(`Error uploading video ${i + 1}:`, error);
            throw new Error(`Failed to upload video: ${video.title || 'Untitled'}. ${(error as Error).message}`);
          }
        }
      }
        return newOrUpdatedCourse;
      } catch (error) {
        console.error('Error in form submission:', error);
        throw error; // Re-throw to be caught by toast.promise
      }
    };

    toast.promise(promise(), {
      loading: 'Saving course...',
      success: () => {
        setIsDialogOpen(false);
        form.reset();
        setThumbnailPreview(null);
        setVideoPreviews({});
        setUploadProgress({});
        fetchCourses(); // Refresh the course list
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

  // Test function to debug form submission
  const handleTestSubmit = async () => {
    try {
      const formData = form.getValues();
      console.log('Form values:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Check console for details.');
    }
  };

  return (
    <FormProvider {...form}>
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Courses</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleTestSubmit}
              disabled={isUploading}
            >
              Test Form Submit
            </Button>
            <Button 
              onClick={() => { 
                setSelectedCourse(null); 
                form.reset(); 
                setThumbnailPreview(null); 
                setVideoPreviews({}); 
                setIsDialogOpen(true);
              }}
              disabled={isUploading}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </div>
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
            <DialogHeader>
              <DialogTitle>{selectedCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
              <DialogDescription>
                {selectedCourse ? 'Edit the details of your course.' : 'Fill in the details to create a new course.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Course metadata fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...form.register('title')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" {...form.register('price')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register('description')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input id="thumbnail" type="file" accept="image/*" {...form.register('thumbnail')} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setThumbnailPreview(URL.createObjectURL(file));
                  form.setValue('thumbnail', e.target.files);
                }} />
                {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail preview" className="mt-2 h-32 w-auto object-cover rounded-lg" />}
              </div>

              {/* Video Upload Section */}
              <div className="space-y-4">
                <Label>{selectedCourse ? "Existing Videos" : "Upload Videos"}</Label>
                {selectedCourse?.videos?.map(v => (
                  <div key={v._id} className="flex items-center justify-between text-sm p-2 bg-gray-100 rounded">
                    <span>{v.title}</span>
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingVideo(v);
                          videoEditForm.reset({ title: v.title, description: v.description || '' });
                          setIsEditVideoDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => openQuizModalForExistingVideo(v)}
                      >
                        <FileQuestion className="h-4 w-4" />
                      </Button>
                      {v.quiz_id && v._id && (
                        <Button
                          type="button"
                          variant="link"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => v._id && handleRemoveQuiz(v._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          if (selectedCourse) {
                            setVideoToDelete({ courseId: selectedCourse._id, videoId: v._id || '' });
                            setIsDeleteVideoDialogOpen(true);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
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
                        <div className="flex space-x-2 mt-2">
                          <Button type="button" variant="secondary" className="w-full" onClick={() => openQuizModal(index)}>
                            <FileQuestion className="mr-2 h-4 w-4" /> {form.watch(`videos.${index}.quiz`) ? 'Edit Quiz' : 'Add Quiz'}
                          </Button>
                        </div>
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

        {(currentQuizIndex !== null || editingQuizForVideo) && (
          <QuizBuilder 
            videoIndex={editingQuizForVideo?.cloudinary_url 
              ? (form.getValues('videos') || []).findIndex(v => v.video_preview === editingQuizForVideo.cloudinary_url)
              : currentQuizIndex as number}
            existingVideo={editingQuizForVideo}
            isOpen={isQuizModalOpen}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setEditingQuizForVideo(null);
                setCurrentQuizIndex(null);
              }
              setIsQuizModalOpen(isOpen);
            }}
            mainFormMethods={form}
            quizFormMethods={quizForm}
                        onQuizSubmit={async (quizData: QuizFormData) => {
              // Transform the form data to match the API's expected format
              const transformedData = {
                title: quizData.title,
                description: quizData.description,
                questions: quizData.questions.map(q => ({
                  text: q.question,  // Map 'question' to 'text'
                  options: q.options.map(opt => ({
                    text: opt,
                    is_correct: opt === q.correct_answer
                  }))
                }))
              };

              if (editingQuizForVideo) {
                // Logic to create/update quiz for an existing video
                try {
                  const quizResponse = await axiosWithAuth(`/api/v1/quizzes`, { 
                    method: 'POST', 
                    data: transformedData 
                  });
                  const newQuiz = quizResponse.data;
                  await axiosWithAuth(`/api/v1/videos/${editingQuizForVideo._id}/quiz/${newQuiz._id}`, { 
                    method: 'PATCH' 
                  });
                  toast.success('Quiz saved successfully!');
                  if (selectedCourse) handleEdit(selectedCourse._id);
                } catch (error) {
                  console.error('Error saving quiz:', error);
                  toast.error('Failed to save quiz.');
                }
              } else if (currentQuizIndex !== null) {
                // For new videos, we need to transform the data back to the form format
                form.setValue(`videos.${currentQuizIndex}.quiz`, transformedData);
              }
              setIsQuizModalOpen(false);
              setEditingQuizForVideo(null);
              setCurrentQuizIndex(null);
            }}
          />
        )}

        {/* Video Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteVideoDialogOpen} onOpenChange={setIsDeleteVideoDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Video?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the video and any associated quiz. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setVideoToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteVideo}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Video Edit Dialog */}
        <Dialog open={isEditVideoDialogOpen} onOpenChange={setIsEditVideoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={videoEditForm.handleSubmit(onUpdateVideoSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-video-title">Title</Label>
                <Input id="edit-video-title" {...videoEditForm.register('title')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-video-description">Description</Label>
                <Textarea id="edit-video-description" {...videoEditForm.register('description')} />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Course Delete Confirmation Dialog */}
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
    </FormProvider>
  );
};

export default AdminCourses;