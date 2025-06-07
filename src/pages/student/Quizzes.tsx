
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertCircle, Play, Trophy, Target } from "lucide-react";

const Quizzes = () => {
  const availableQuizzes = [
    {
      id: 1,
      title: "JavaScript Fundamentals Quiz",
      course: "Complete Web Development Bootcamp",
      questions: 20,
      timeLimit: 30,
      difficulty: "Beginner",
      attempts: 0,
      maxAttempts: 3,
      description: "Test your knowledge of JavaScript basics including variables, functions, and objects."
    },
    {
      id: 2,
      title: "React Components Assessment",
      course: "Complete Web Development Bootcamp",
      questions: 15,
      timeLimit: 25,
      difficulty: "Intermediate",
      attempts: 1,
      maxAttempts: 2,
      description: "Evaluate your understanding of React components, props, and state management."
    },
    {
      id: 3,
      title: "Machine Learning Algorithms",
      course: "Machine Learning Fundamentals",
      questions: 25,
      timeLimit: 45,
      difficulty: "Advanced",
      attempts: 0,
      maxAttempts: 2,
      description: "Comprehensive test on supervised and unsupervised learning algorithms."
    }
  ];

  const completedQuizzes = [
    {
      id: 4,
      title: "HTML & CSS Basics",
      course: "Complete Web Development Bootcamp",
      score: 85,
      maxScore: 100,
      completedDate: "2024-01-10",
      timeSpent: 18,
      difficulty: "Beginner",
      passed: true
    },
    {
      id: 5,
      title: "Python Syntax Quiz",
      course: "Machine Learning Fundamentals",
      score: 92,
      maxScore: 100,
      completedDate: "2024-01-08",
      timeSpent: 22,
      difficulty: "Beginner",
      passed: true
    },
    {
      id: 6,
      title: "Database Design Principles",
      course: "Complete Web Development Bootcamp",
      score: 68,
      maxScore: 100,
      completedDate: "2024-01-05",
      timeSpent: 35,
      difficulty: "Intermediate",
      passed: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-500';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-500';
      case 'Advanced': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge and track your progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableQuizzes.length}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedQuizzes.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(completedQuizzes.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore), 0) / completedQuizzes.length * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(completedQuizzes.reduce((sum, quiz) => sum + quiz.timeSpent, 0) / completedQuizzes.length)}m
                </p>
                <p className="text-sm text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Quizzes</TabsTrigger>
            <TabsTrigger value="completed">Completed Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableQuizzes.map((quiz) => (
              <Card key={quiz.id} className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold">{quiz.title}</h3>
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                      {quiz.attempts > 0 && (
                        <Badge variant="outline">
                          Attempt {quiz.attempts}/{quiz.maxAttempts}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground">{quiz.course}</p>
                    <p className="text-foreground">{quiz.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{quiz.questions} questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.timeLimit} minutes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{quiz.maxAttempts - quiz.attempts} attempts left</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline">Preview</Button>
                    <Button 
                      className="btn-neon"
                      disabled={quiz.attempts >= quiz.maxAttempts}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {quiz.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedQuizzes.map((quiz) => (
              <Card key={quiz.id} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold">{quiz.title}</h3>
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                      <Badge className={quiz.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                        {quiz.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground">{quiz.course}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div>
                        <span>Score: </span>
                        <span className={`font-semibold ${getScoreColor(quiz.score, quiz.maxScore)}`}>
                          {quiz.score}/{quiz.maxScore} ({Math.round((quiz.score / quiz.maxScore) * 100)}%)
                        </span>
                      </div>
                      <div>
                        <span>Completed: {new Date(quiz.completedDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span>Time: {quiz.timeSpent} minutes</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score Progress</span>
                        <span>{Math.round((quiz.score / quiz.maxScore) * 100)}%</span>
                      </div>
                      <Progress value={(quiz.score / quiz.maxScore) * 100} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline">View Results</Button>
                    <Button variant="outline">Review Answers</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Quizzes;
