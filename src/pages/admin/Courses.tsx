import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Trash2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';

// Components
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { FileUploader } from '@/components/upload/FileUploader';
import { api } from '@/lib/api';

// Types
interface Video {
  _id?: string;
  id?: string;
  url: string;
  public_id?: string;
  title: string;
  description?: string;
  duration?: number;
  video_file?: File | null;
  previewUrl?: string;
}

interface Course {
  _id: string;
  title: string;
  price: number;
  total_enrollments: number;
  created_at: string;
  description?: string;
  thumbnail_url?: string;
  videos?: Video[];
  is_published: boolean;
}

// Zod Schemas
const videoSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  title: z.string().min(3, 'Video title is required'),
  description: z.string().optional(),
  video_file: z.any().optional(),
  url: z.string().optional(),
  public_id: z.string().optional(),
  duration: z.number().optional(),
  previewUrl: z.string().optional(),
});

const courseFormSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  thumbnail: z.any().optional(),
  videos: z.array(videoSchema).optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      videos: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'videos',
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/courses');
      setCourses(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    setUploadProgress({});
    // IMPORTANT: Replace with your Cloudinary cloud name
    const CLOUDINARY_CLOUD_NAME = 'imagesahsan';

    if (CLOUDINARY_CLOUD_NAME === 'your_cloud_name_here') {
      toast.error("Please update the CLOUDINARY_CLOUD_NAME in Courses.tsx before uploading.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Handle thumbnail upload if a new one is selected
      let thumbnailUrl = selectedCourse?.thumbnail_url || '';
      if (thumbnailFile) {
        const thumbFormData = new FormData();
        thumbFormData.append('file', thumbnailFile);
        const res = await api.post('/api/upload/image', thumbFormData);
        thumbnailUrl = res.data.url;
      }

      // Step 2: Create or Update the Course to get an ID
      const isUpdating = !!selectedCourse;
      const coursePayload = {
        title: data.title,
        description: data.description,
        price: data.price,
        thumbnail_url: thumbnailUrl,
      };

      // Use a different endpoint for update that doesn't rely on FormData for simple fields
      const courseResponse = isUpdating
        ? await api.put(`/api/admin/courses/${selectedCourse?._id}`, coursePayload)
        : await api.post('/api/admin/courses', coursePayload);
      
      const courseId = courseResponse.data.id || selectedCourse?._id;

      if (!courseId) {
        throw new Error("Failed to get course ID.");
      }

      // Step 3: Handle video uploads and associating them
      for (let i = 0; i < (data.videos?.length || 0); i++) {
        const video = data.videos![i];
        
        // Only upload if there's a file and it hasn't been uploaded yet (no url)
        if (video.video_file instanceof File && !video.url) {
          try {
            // Get signature from our backend
            const signatureRes = await api.post('/api/admin/generate-video-upload-signature');
            const { signature, timestamp, api_key } = signatureRes.data;

            // Create form data for Cloudinary
            const videoFormData = new FormData();
            videoFormData.append('file', video.video_file);
            videoFormData.append('api_key', api_key);
            videoFormData.append('timestamp', timestamp);
            videoFormData.append('signature', signature);
            videoFormData.append('folder', 'videos');
            
            // Upload directly to Cloudinary
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
            const cloudinaryResponse = await axios.post(cloudinaryUrl, videoFormData, {
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setUploadProgress(prev => ({ ...prev, [i]: percentCompleted }));
                }
              },
            });

            const { secure_url, public_id, duration } = cloudinaryResponse.data;

            // Now, tell our backend about the new video
            await api.post(`/api/admin/courses/${courseId}/videos`, {
              title: video.title,
              description: video.description,
              video_url: secure_url,
              public_id,
              duration,
              is_preview: false, // TODO: Add this to the form if needed
            });
          } catch (uploadError) {
             console.error(`Failed to upload video ${video.title}:`, uploadError);
             toast.error(`Failed to upload video: ${video.title}`);
             // Continue to next video, so one failure doesn't stop everything
          }
        }
      }

      toast.success(`Course ${isUpdating ? 'updated' : 'saved'} successfully!`);
      resetDialogState();
      fetchCourses();

    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'An unexpected error occurred.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (files: File[], index: number) => {
    if (files.length > 0) {
      const file = files[0];
      const currentVideo = form.getValues(`videos.${index}`);
      update(index, {
        ...currentVideo,
        video_file: file,
        previewUrl: URL.createObjectURL(file),
      });
    }
  };

  const openDeleteDialog = (courseId: string) => {
    setCourseToDelete(courseId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/api/admin/courses/${courseToDelete}`);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete course';
      toast.error(message);
    } finally {
        setIsDeleteDialogOpen(false);
        setCourseToDelete(null);
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    form.reset({
      ...course,
      videos: course.videos?.map(v => ({ ...v, video_file: null, previewUrl: v.cloudinary_url })) || [],
    });
    setThumbnailPreview(course.thumbnail_url || null);
    setIsDialogOpen(true);
  };

  const resetDialogState = () => {
    form.reset({ title: '', description: '', price: 0, videos: [] });
    setSelectedCourse(null);
    setIsDialogOpen(false);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUploadProgress({});
  };

  const openNewDialog = () => {
    resetDialogState();
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button onClick={openNewDialog}><PlusCircle className="mr-2 h-4 w-4" /> Add New Course</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
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
              <TableRow><TableCell colSpan={5} className="text-center py-4">Loading...</TableCell></TableRow>
            ) : courses.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-4">No courses found.</TableCell></TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>{course.total_enrollments}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${course.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(course)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(course._id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isSubmitting && (isOpen ? setIsDialogOpen(true) : resetDialogState())}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
            <DialogDescription>{selectedCourse ? 'Update the details of your course.' : 'Fill in the details to create a new course.'}</DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[80vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Introduction to Programming" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Describe your course" rows={5} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 99.99" /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Thumbnail</FormLabel>
                      <FormControl>
                        <FileUploader onUpload={handleThumbnailChange} value={thumbnailFile ? [thumbnailFile] : []} maxSize={2 * 1024 * 1024} multiple={false} />
                      </FormControl>
                    </FormItem>
                    {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail preview" className="h-40 w-full rounded-md border object-cover" />}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Videos</h3>
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`videos.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="Video title" /></FormControl><FormMessage /></FormItem>)} />
                          <FormItem>
                            <FormLabel>Video File</FormLabel>
                            <FormControl><FileUploader onUpload={(files) => handleVideoChange(files, index)} value={field.video_file ? [field.video_file] : []} maxSize={500 * 1024 * 1024} multiple={false} /></FormControl>
                          </FormItem>
                        </div>
                        {field.previewUrl && <video src={field.previewUrl} controls className="w-full rounded-md" />}
                        {uploadProgress[index] > 0 && <Progress value={uploadProgress[index]} className="w-full h-2.5" />}
                        <FormField control={form.control} name={`videos.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Video description" rows={2} /></FormControl></FormItem>)} />
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ title: '', description: '', video_file: null, previewUrl: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Video</Button>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetDialogState} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (selectedCourse ? 'Save Changes' : 'Create Course')}</Button>
                </DialogFooter>
              </form>
            </Form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the course and all its contents. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}