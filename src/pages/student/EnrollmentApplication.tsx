import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const EnrollmentApplication: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        qualification: '',
        ultrasound_experience: '',
        contact_number: '',
    });
    const [certificate, setCertificate] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertificate(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certificate) {
            toast({ title: 'Error', description: 'Please upload your qualification certificate.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1: Get signature from our backend
            const signatureResponse = await axios.post('/api/uploads/signature', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const { signature, timestamp, api_key, cloud_name } = signatureResponse.data;

            // Step 2: Upload the file directly to Cloudinary using the signature
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('file', certificate);
            cloudinaryFormData.append('api_key', api_key);
            cloudinaryFormData.append('timestamp', timestamp);
            cloudinaryFormData.append('signature', signature);

            const cloudinaryRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                cloudinaryFormData
            );

            const certificateUrl = cloudinaryRes.data.secure_url;

            // Step 3: Submit application data with Cloudinary URL to your backend
            const applicationPayload = {
                ...formData,
                course_id: courseId!,
                qualification_certificate_url: certificateUrl,
            };

            await axios.post('/api/enrollments/apply', applicationPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            toast({
                title: 'Success',
                description: 'Your application has been submitted successfully. You will be notified once it is reviewed.',
            });

            navigate(`/student/explore-courses/${courseId}`);
        } catch (error) {
            console.error('Application submission error:', error);
            const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail 
                ? error.response.data.detail
                : 'Failed to submit application. Please try again.';
            
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Enrollment Application</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleInputChange} required />
                        <Input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleInputChange} required />
                        <Input name="qualification" placeholder="Qualification (e.g., MBBS, FCPS)" value={formData.qualification} onChange={handleInputChange} required />
                        <Textarea name="ultrasound_experience" placeholder="Describe your ultrasound experience (if any)" value={formData.ultrasound_experience} onChange={handleInputChange} />
                        <Input name="contact_number" placeholder="Contact Number" value={formData.contact_number} onChange={handleInputChange} required />
                        <div>
                            <label htmlFor="certificate" className="block text-sm font-medium text-gray-700">Qualification Certificate</label>
                            <Input id="certificate" name="certificate" type="file" onChange={handleFileChange} required className="mt-1" />
                            <p className="text-xs text-gray-500 mt-1">Please upload your certificate (PDF, JPG, PNG).</p>
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EnrollmentApplication;
