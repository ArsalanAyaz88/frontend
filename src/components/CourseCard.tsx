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
  // The component now directly uses the thumbnail_url from props.
  // The backend is responsible for providing a valid (presigned) URL.
  const thumbnailUrl = course.thumbnail_url || '/placeholder.svg';

  return (
    <div className="course-card bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <Link to={`/courses/${course.id}`} className="block">
            <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                <img src={thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
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
