import { useState, useEffect, useCallback } from 'react';
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

import { FileUploader } from '@/components/upload/FileUploader';
import { useFileUpload } from '@/hooks/useFileUpload';
import { fetchWithAuth } from '@/lib/api';

// Types
interface Video {
  _id?: string;
  id?: string;
  cloudinary_url: string;
  title: string;
  description: string;
  video_file?: File | null;
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
  _id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  thumbnail: z.any().optional(),
  difficulty_level: z.string().optional(),
  outcomes: z.string().optional(),
  prerequisites: z.string().optional(),
  curriculum: z.string().optional(),
  videos: z.array(z.object({
    id: z.string().optional(),
    _id: z.string().optional(),
    title: z.string().min(3, 'Video title is required'),
    description: z.string().optional(),
    video_file: z.any().optional(),
    cloudinary_url: z.string().optional(),
  })).optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<(File | null)[]>([]);

  const { isUploading } = useFileUpload();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      videos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'videos',
  });

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

  const onSubmit = async (data: CourseFormData) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', String(data.price));

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    if (data.videos) {
      data.videos.forEach((video, index) => {
        formData.append(`videos[${index}][title]`, video.title);
        if (video.description) {
          formData.append(`videos[${index}][description]`, video.description);
        }
        if (video._id) {
          formData.append(`videos[${index}][_id]`, video._id);
        }
        const videoFile = videoFiles[index];
        if (videoFile) {
          formData.append(`videos[${index}][video_file]`, videoFile);
        }
      });
    }

    try {
      const isUpdating = !!data._id;
      const url = isUpdating ? `/api/admin/courses/${data._id}` : '/api/admin/courses';
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save course');
      }

      toast.success(`Course ${isUpdating ? 'updated' : 'created'} successfully`);
      setIsDialogOpen(false);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleThumbnailChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setThumbnailFile(file);
      form.setValue('thumbnail', file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (files: File[], index: number) => {
    if (files.length > 0) {
      const file = files[0];
      form.setValue(`videos.${index}.video_file`, file);

      const newFiles = [...videoFiles];
      newFiles[index] = file;
      setVideoFiles(newFiles);

      const newPreviews = [...videoPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setVideoPreviews(newPreviews);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await fetchWithAuth(`/api/admin/courses/${courseToDelete}`, { method: 'DELETE' });
      toast.success('Course deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setThumbnailFile(null);
    setThumbnailPreview(course.thumbnail_url || null);
    setVideoPreviews(course.videos?.map(v => v.cloudinary_url || '') || []);
    setVideoFiles(course.videos?.map(() => null) || []);
    form.reset({
      ...course,
      _id: course._id, // Ensure the ID is explicitly passed to the form
    });
    setIsDialogOpen(true);
  };

  const resetDialogState = () => {
    setSelectedCourse(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setVideoPreviews([]);
    setVideoFiles([]);
    form.reset({ title: '', description: '', price: 0, videos: [] });
  };

  const openNewDialog = () => {
    resetDialogState();
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </div>

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
                      <Button variant="destructive" size="sm" onClick={() => { setCourseToDelete(course._id); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetDialogState();
        }
        setIsDialogOpen(isOpen);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
            <DialogDescription>{selectedCourse ? 'Update the course details.' : 'Fill in the details to create a new course.'}</DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Course Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                            <FormControl><FileUploader onUpload={(files) => handleVideoChange(files, index)} value={videoFiles[index] ? [videoFiles[index] as File] : []} maxSize={2 * 1024 * 1024 * 1024} multiple={false} /></FormControl>
                          </FormItem>
                        </div>
                        {videoPreviews[index] && <video src={videoPreviews[index]} controls className="w-full rounded-md" />}
                        <FormField control={form.control} name={`videos.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Video description" rows={2} /></FormControl></FormItem>)} />
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ title: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Video</Button>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>Cancel</Button>
                  <Button type="submit" disabled={isUploading}>{isUploading ? 'Saving...' : 'Save Course'}</Button>
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