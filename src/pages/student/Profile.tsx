
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Edit, Save, Mail, Phone, MapPin, Calendar, Trophy, BookOpen, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate web developer and lifelong learner. Currently focusing on full-stack development and machine learning.",
    joinDate: "2023-09-15",
    profileImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&q=80"
  });

  const { toast } = useToast();

  const achievements = [
    { name: "JavaScript Master", description: "Completed JavaScript fundamentals", date: "2024-01-10", icon: "🏆" },
    { name: "React Developer", description: "Built 5 React projects", date: "2024-01-08", icon: "⚛️" },
    { name: "Quick Learner", description: "Completed first course in record time", date: "2024-01-05", icon: "⚡" },
    { name: "Consistent Student", description: "7 days learning streak", date: "2024-01-01", icon: "🔥" }
  ];

  const learningStats = [
    { label: "Courses Completed", value: "3", icon: BookOpen, color: "text-blue-500" },
    { label: "Hours Learned", value: "127", icon: Clock, color: "text-green-500" },
    { label: "Certificates Earned", value: "2", icon: Trophy, color: "text-yellow-500" },
    { label: "Current Streak", value: "7 days", icon: Calendar, color: "text-purple-500" }
  ];

  const enrolledCourses = [
    {
      title: "Complete Web Development Bootcamp",
      progress: 75,
      instructor: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=100&q=80"
    },
    {
      title: "Machine Learning Fundamentals",
      progress: 45,
      instructor: "Dr. Michael Chen",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=100&q=80"
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleImageUpload = () => {
    toast({
      title: "Image Upload",
      description: "Profile image upload feature would be implemented here.",
    });
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and track your progress</p>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={isEditing ? "btn-neon" : ""}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="glass-card p-8 lg:col-span-1">
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <img 
                  src={profileData.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto"
                />
                <button 
                  onClick={handleImageUpload}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
                >
                  <Camera className="h-5 w-5 text-primary-foreground" />
                </button>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">{profileData.firstName} {profileData.lastName}</h2>
                <p className="text-muted-foreground">Student</p>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{profileData.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="info" className="space-y-6">
              <TabsList>
                <TabsTrigger value="info">Personal Info</TabsTrigger>
                <TabsTrigger value="progress">Learning Progress</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                <Card className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({...prev, location: e.target.value}))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                        disabled={!isEditing}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                {/* Learning Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {learningStats.map((stat) => (
                    <Card key={stat.label} className="glass-card p-4 text-center">
                      <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </Card>
                  ))}
                </div>

                {/* Current Courses */}
                <Card className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Current Courses</h3>
                  <div className="space-y-4">
                    {enrolledCourses.map((course, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                        <img 
                          src={course.image}
                          alt={course.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{course.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Achievements & Badges</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Earned on {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">New</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
