import { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from '../../components/CourseCard';
import DashboardLayout from "@/components/DashboardLayout";

// Define the structure of a Course object, ensure it matches your backend model
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string; 
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        // NOTE: Please verify this is the correct endpoint to get all courses
        const response = await axios.get('/api/student/explore-courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
        <DashboardLayout userType="student">
            <div className="text-center py-10">Loading courses...</div>
        </DashboardLayout>
    );
  }

  if (error) {
    return (
        <DashboardLayout userType="student">
            <div className="text-center py-10 text-red-500">{error}</div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">Explore Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {courses.map(course => (
                <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </main>
    </DashboardLayout>
  );
};

export default Courses;
