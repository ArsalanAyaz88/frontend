
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Mail, Eye, MoreHorizontal, Users, UserCheck, UserX, Clock } from "lucide-react";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

const AdminStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth("/api/admin/users");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data);
      } catch (err: any) {
        setError(err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-500';
      case 'suspended': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getCourseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500';
      case 'in-progress': return 'bg-blue-500/20 text-blue-500';
      case 'not-started': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold mb-2">students' list</h1>
        {loading && <div>Loading students...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            {students.length === 0 ? (
              <div>No students found.</div>
            ) : (
              students.map((student) => (
                <div key={student.id} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold">{student.name || student.full_name || student.username || student.email}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(student.status)}`}>
                        {student.status || 'unknown'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Email: <span className="text-foreground">{student.email}</span></div>
                    <div className="text-sm text-muted-foreground">Last Active: <span className="text-foreground">{student.last_active ? new Date(student.last_active).toLocaleDateString() : 'N/A'}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;
