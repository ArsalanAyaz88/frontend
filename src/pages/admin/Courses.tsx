import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Trash2, Edit, MoreHorizontal, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

// Types
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
  videos?: { youtube_url: string; title: string; description: string }[];
  is_published: boolean;
}

const videoSchema = z.object({
  youtube_url: z.string().url({ message: "Invalid YouTube URL" }).optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

const courseFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  thumbnail: z.any().refine(files => files?.length > 0 ? files?.[0]?.type.startsWith('image/') : true, 'Must be an image file').optional(),
  difficulty_level: z.string().optional(),
  outcomes: z.string().optional(),
  prerequisites: z.string().optional(),
  curriculum: z.string().optional(),
  videos: z.array(videoSchema).min(1, 'At least one video is required'),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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
      videos: [{ youtube_url: '', title: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'videos',
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetchWithAuth('https://student-portal-lms-seven.vercel.app/api/admin/courses?skip=0&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('admin_access_token');
      const response = await fetchWithAuth(`https://student-portal-lms-seven.vercel.app/api/admin/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
        videos: courseDetails.videos && courseDetails.videos.length > 0
          ? courseDetails.videos.map(v => ({ youtube_url: v.youtube_url, title: v.title, description: v.description }))
          : [{ youtube_url: '', title: '', description: '' }],
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
      const token = localStorage.getItem('admin_access_token');
      await fetchWithAuth(`https://student-portal-lms-seven.vercel.app/api/admin/courses/${courseToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    if (data.thumbnail && data.thumbnail.length > 0) {
      formData.append('thumbnail', data.thumbnail[0]);
    }
    formData.append('difficulty_level', data.difficulty_level || '');
    formData.append('outcomes', data.outcomes || '');
    formData.append('prerequisites', data.prerequisites || '');
    formData.append('curriculum', data.curriculum || '');
    formData.append('videos', JSON.stringify(data.videos)); // Send videos as a JSON string

    const promise = async () => {
      const url = selectedCourse
        ? `https://student-portal-lms-seven.vercel.app/api/admin/courses/${selectedCourse._id}`
        : 'https://student-portal-lms-seven.vercel.app/api/admin/courses';
      const method = selectedCourse ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, { method, body: formData });
      return handleApiResponse(response);
    };

    toast.promise(promise(), {
      loading: selectedCourse ? 'Updating course...' : 'Creating course...',
      success: () => {
        setIsDialogOpen(false);
        form.reset();
        setThumbnailPreview(null);
        fetchCourses();
        return selectedCourse ? 'Course updated successfully!' : 'Course created successfully!';
      },
      error: (err) => (err as Error).message || 'An error occurred.',
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button onClick={() => {
          setSelectedCourse(null);
          form.reset();
          setThumbnailPreview(null);
          setIsDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Course
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : courses.length > 0 ? (
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
                  <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(course._id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setCourseToDelete(course._id);
                          setIsDeleteDialogOpen(true);
                        }}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/courses/${course._id}/dashboard`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center">No courses found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
            <DialogDescription>
              {selectedCourse ? 'Update the details of your course.' : 'Fill in the details to create a new course.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register('title')} />
              {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register('description')} />
              {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" {...form.register('price')} />
                {form.formState.errors.price && <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input id="thumbnail" type="file" accept="image/*" {...form.register('thumbnail')} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setThumbnailPreview(URL.createObjectURL(file));
                  }
                  form.setValue('thumbnail', e.target.files);
                }}/>
                {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail Preview" className="mt-2 max-h-40 rounded-lg border object-cover"/>}
                {form.formState.errors.thumbnail && <p className="text-red-500 text-sm">{form.formState.errors.thumbnail.message as string}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <Input id="difficulty_level" {...form.register('difficulty_level')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcomes">Outcomes</Label>
              <Textarea id="outcomes" {...form.register('outcomes')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites</Label>
              <Textarea id="prerequisites" {...form.register('prerequisites')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curriculum">Curriculum</Label>
              <Textarea id="curriculum" {...form.register('curriculum')} />
            </div>

            <div className="space-y-4">
              <Label>Videos</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-2 relative mb-4">
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div>
                    <Label htmlFor={`videos.${index}.title`}>Video Title</Label>
                    <Input id={`videos.${index}.title`} {...form.register(`videos.${index}.title`)} />
                    {form.formState.errors.videos?.[index]?.title && <p className="text-red-500 text-sm">{form.formState.errors.videos?.[index]?.title?.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`videos.${index}.youtube_url`}>YouTube URL</Label>
                    <Input id={`videos.${index}.youtube_url`} {...form.register(`videos.${index}.youtube_url`)} placeholder="https://www.youtube.com/watch?v=..."/>
                    {form.formState.errors.videos?.[index]?.youtube_url && <p className="text-red-500 text-sm">{form.formState.errors.videos?.[index]?.youtube_url?.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`videos.${index}.description`}>Video Description</Label>
                    <Textarea id={`videos.${index}.description`} {...form.register(`videos.${index}.description`)} />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ youtube_url: '', title: '', description: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Video
              </Button>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">{selectedCourse ? 'Save Changes' : 'Create Course'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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