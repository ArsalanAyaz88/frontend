import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Trash2, FileQuestion, Pencil, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

// Components
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/upload/FileUploader';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { api, fetchWithAuth } from '@/lib/api';

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
const courseFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  thumbnail: z.any().optional(),
  difficulty_level: z.string().optional(),
  outcomes: z.string().optional(),
  prerequisites: z.string().optional(),
  curriculum: z.string().optional(),
  videos: z.array(z.any()).optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function AdminCourses() {
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreviews, setVideoPreviews] = useState<Record<number, string>>({});
  
  // File upload
  const { upload, cancel, tasks, isUploading } = useFileUpload();
  
  // Form setup
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      difficulty_level: '',
      outcomes: '',
      prerequisites: '',
      curriculum: '',
      videos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'videos',
  });

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/admin/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Handle form submission
  const onSubmit = async (data: CourseFormData) => {
    try {
      const formData = new FormData();
      
      // Append basic course data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'thumbnail' && key !== 'videos' && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Handle thumbnail upload if it's a file
      if (data.thumbnail && data.thumbnail instanceof File) {
        formData.append('thumbnail', data.thumbnail);
      }

      // Handle course creation/update
      const url = selectedCourse 
        ? `/api/admin/courses/${selectedCourse._id}` 
        : '/api/admin/courses';
      const method = selectedCourse ? 'PUT' : 'POST';

      const response = await api(url, { method, data: formData });
      const course = response.data;

      // Handle video uploads if any
      if (data.videos && data.videos.length > 0) {
        await Promise.all(
          data.videos.map(async (video, index) => {
            if (!video.video_file) return;
            
            const videoFormData = new FormData();
            videoFormData.append('title', video.title || `Video ${index + 1}`);
            videoFormData.append('description', video.description || '');
            videoFormData.append('video_file', video.video_file);

            await api(`/api/courses/${course._id}/videos`, {
              method: 'POST',
              data: videoFormData,
            });
          })
        );
      }

      toast.success(`Course ${selectedCourse ? 'updated' : 'created'} successfully`);
      setIsDialogOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    }
  };

  // Handle file selection for thumbnail
  const handleThumbnailChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('thumbnail', file);
    }
  };

  // Handle video file selection
  const handleVideoChange = (files: File[], index: number) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreviews(prev => ({
          ...prev,
          [index]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      // Update form value
      const videos = [...(form.getValues('videos') || [])];
      videos[index] = { ...videos[index], video_file: file };
      form.setValue('videos', videos);
    }
  };

  // Add new video field
  const addVideoField = () => {
    append({ title: '', description: '', video_file: null });
  };

  // Delete course
  const handleDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      await api.delete(`/api/admin/courses/${courseToDelete}`);
      toast.success('Course deleted successfully');
      setCourseToDelete(null);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  // Open edit dialog
  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    form.reset({
      title: course.title,
      description: course.description || '',
      price: course.price,
      difficulty_level: course.difficulty_level || '',
      outcomes: course.outcomes || '',
      prerequisites: course.prerequisites || '',
      curriculum: course.curriculum || '',
      videos: [],
    });
    
    if (course.thumbnail_url) {
      setThumbnailPreview(course.thumbnail_url);
    }
    
    setIsDialogOpen(true);
  };

  return (
    <FormProvider {...form}>
      <DashboardLayout userType="admin">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Courses</h1>
            <Button onClick={() => {
              setSelectedCourse(null);
              form.reset();
              setThumbnailPreview(null);
              setVideoPreviews({});
              setIsDialogOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </div>

          {/* Courses Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>${course.price}</TableCell>
                      <TableCell>{course.total_enrollments}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(course)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setCourseToDelete(course._id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Course Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCourse ? 'Edit Course' : 'Create New Course'}
              </DialogTitle>
              <DialogDescription>
                {selectedCourse 
                  ? 'Update the course details below.' 
                  : 'Fill in the details to create a new course.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input id="title" {...form.register('title')} />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      step="0.01"
                      {...form.register('price', { valueAsNumber: true })} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty_level">Difficulty Level</Label>
                    <select
                      id="difficulty_level"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...form.register('difficulty_level')}
                    >
                      <option value="">Select difficulty</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Course Thumbnail</Label>
                    <FileUploader
                      onUpload={handleThumbnailChange}
                      accept={{
                        'image/*': ['.jpg', '.jpeg', '.png', '.webp']
                      }}
                      maxSize={5 * 1024 * 1024} // 5MB
                      multiple={false}
                    />
                    {thumbnailPreview && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="h-20 w-auto rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Course Description</Label>
                <Textarea 
                  id="description" 
                  rows={4} 
                  {...form.register('description')} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Course Videos</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addVideoField}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Video
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Video {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input 
                            {...form.register(`videos.${index}.title`)}
                            placeholder="Video title"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Video File</Label>
                          <FileUploader
                            onUpload={(files) => handleVideoChange(files, index)}
                            accept={{
                              'video/*': ['.mp4', '.webm', '.mov']
                            }}
                            maxSize={500 * 1024 * 1024} // 500MB
                            multiple={false}
                          />
                          {videoPreviews[index] && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                              <video 
                                src={videoPreviews[index]} 
                                controls
                                className="h-40 w-full rounded-md border"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label>Description</Label>
                          <Textarea 
                            {...form.register(`videos.${index}.description`)}
                            placeholder="Video description"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Additional Information</h3>
                
                <div>
                  <Label htmlFor="outcomes">Learning Outcomes</Label>
                  <Textarea 
                    id="outcomes" 
                    {...form.register('outcomes')} 
                    placeholder="What will students learn?"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea 
                    id="prerequisites" 
                    {...form.register('prerequisites')} 
                    placeholder="What should students know before taking this course?"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="curriculum">Curriculum</Label>
                  <Textarea 
                    id="curriculum" 
                    {...form.register('curriculum')} 
                    placeholder="Detailed course curriculum"
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter className="space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || tasks.some(t => t.status === 'uploading')}
                >
                  {isUploading ? 'Saving...' : 'Save Course'}
                </Button>
              </DialogFooter>
              
              {tasks.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Upload Progress</h4>
                  <UploadProgress 
                    tasks={tasks} 
                    onCancel={(taskId) => {
                      cancel(taskId);
                      toast.info('Upload cancelled');
                    }}
                  />
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the course and all its contents. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </FormProvider>
  );
}
