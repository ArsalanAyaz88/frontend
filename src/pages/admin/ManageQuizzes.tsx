import DashboardLayout from "@/components/DashboardLayout";

const ManageQuizzes = () => {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Quizzes</h1>
          <p className="text-muted-foreground">Create, view, and manage course quizzes</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageQuizzes;
