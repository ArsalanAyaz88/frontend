import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Define the structure of a Course object
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string; // The original, non-functional URL
}

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchThumbnailUrl = async () => {
      if (!course.id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/admin/courses/${course.id}/thumbnail-url`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.thumbnail_url) {
          setThumbnailUrl(response.data.thumbnail_url);
        }
      } catch (error) {
        console.error('Failed to fetch thumbnail URL:', error);
        // Optionally set a default placeholder image on error
        setThumbnailUrl('/path/to/default-placeholder.png'); 
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnailUrl();
  }, [course.id]);

  return (
    <div className="course-card bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <Link to={`/courses/${course.id}`} className="block">
            <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <img src={thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                )}
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold mb-2 truncate">{course.title}</h3>
                <p className="text-gray-400 text-lg font-semibold">${course.price}</p>
            </div>
        </Link>
    </div>
  );
};

export default CourseCard;
