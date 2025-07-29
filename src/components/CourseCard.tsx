import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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
    const fetchOrSetThumbnail = async () => {
      setLoading(true);
      if (!course.thumbnail_url) {
        // If no thumbnail URL is provided, use a placeholder and stop loading.
        setThumbnailUrl('/placeholder.svg');
        setLoading(false);
        return;
      }

      // Check if the URL is a private S3 URL that needs to be pre-signed.
      const isS3Url = course.thumbnail_url.includes('s3.amazonaws.com');

      if (isS3Url) {
        // It's an S3 URL, so we need to fetch the pre-signed URL.
        try {
          const response = await api.get(`/api/courses/${course.id}/thumbnail-url`);
          if (response.data.thumbnail_url) {
            setThumbnailUrl(response.data.thumbnail_url);
          }
        } catch (error) {
          console.error('Failed to fetch pre-signed thumbnail URL:', error);
          setThumbnailUrl('/placeholder.svg'); // Fallback on error
        }
      } else {
        // It's a public URL (e.g., Cloudinary), so use it directly.
        setThumbnailUrl(course.thumbnail_url);
      }
      setLoading(false);
    };

    fetchOrSetThumbnail();
  }, [course.id, course.thumbnail_url]);

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
