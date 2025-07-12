import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, CheckCircle, Clock, AlertTriangle, Plus, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AuthService } from "@/lib/auth";

export function PemateriDashboard() {
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const { toast } = useToast();

  const { data: participants = [] } = useQuery({
    queryKey: ['/api/participants'],
  });

  const { data: attendanceSessions = [] } = useQuery({
    queryKey: ['/api/attendance-sessions'],
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['/api/attendance-sessions', selectedSession?.id, 'records'],
    enabled: !!selectedSession,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const response = await fetch('/api/attendance-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance-sessions'] });
      toast({
        title: "Sesi berhasil dibuat",
        description: "Peserta sekarang dapat melakukan absensi",
      });
      setIsCreateSessionOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal membuat sesi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await fetch(`/api/attendance-sessions/${sessionId}/close`, {
        method: 'PATCH',
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to close session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance-sessions'] });
      toast({
        title: "Sesi berhasil ditutup",
        description: "Peserta tidak dapat lagi melakukan absensi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menutup sesi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    createSessionMutation.mutate({ title, description });
  };

  const activeSessions = attendanceSessions.filter((session: any) => session.isActive);
  const todayAttendance = attendanceRecords.filter((record: any) => 
    new Date(record.checkInTime).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Pemateri</h1>
        <p className="text-gray-600">Kelola sesi pembelajaran dan peserta</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{participants.length}</h3>
                <p className="text-gray-600">Total Peserta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">
                  {todayAttendance.filter((r: any) => r.status === 'hadir').length}
                </h3>
                <p className="text-gray-600">Hadir Hari Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{activeSessions.length}</h3>
                <p className="text-gray-600">Sesi Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">
                  {participants.length - todayAttendance.filter((r: any) => r.status === 'hadir').length}
                </h3>
                <p className="text-gray-600">Tidak Hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Manajemen Sesi</CardTitle>
            <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buka Sesi Baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Sesi Absensi Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Sesi</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <Button type="submit" disabled={createSessionMutation.isPending}>
                    {createSessionMutation.isPending ? 'Membuat...' : 'Buat Sesi'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attendanceSessions.map((session: any) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">{session.title}</h4>
                  <Badge variant={session.isActive ? "default" : "secondary"}>
                    {session.isActive ? "Aktif" : "Ditutup"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">{session.description}</p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSession(session)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat Absensi
                  </Button>
                  {session.isActive && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => closeSessionMutation.mutate(session.id)}
                      disabled={closeSessionMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Tutup Sesi
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      {selectedSession && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daftar Kehadiran - {selectedSession.title}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSession(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nama</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Waktu</th>
                    <th className="text-left p-2">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record: any) => (
                    <tr key={record.id} className="border-b">
                      <td className="p-2 font-medium">{record.participant.fullName}</td>
                      <td className="p-2">
                        <Badge 
                          variant={record.status === 'hadir' ? 'default' : 'destructive'}
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {new Date(record.checkInTime).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="p-2">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
