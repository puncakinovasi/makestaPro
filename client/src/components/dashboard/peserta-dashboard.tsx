import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Book, TrendingUp, Download, Clock } from "lucide-react";
import { AuthService } from "@/lib/auth";

export function PesertaDashboard() {
  const { data: materials = [] } = useQuery({
    queryKey: ['/api/materials'],
  });

  const { data: attendanceSessions = [] } = useQuery({
    queryKey: ['/api/attendance-sessions'],
  });

  const handleDownloadMaterial = async (materialId: number) => {
    try {
      const response = await fetch(`/api/materials/${materialId}/download`, {
        headers: AuthService.getAuthHeaders(),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'material.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading material:', error);
    }
  };

  const activeSession = attendanceSessions.find((session: any) => session.isActive);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Peserta</h1>
        <p className="text-gray-600">Selamat datang di portal peserta Makesta</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Absensi Hari Ini</h3>
                <p className="text-gray-600">Status kehadiran</p>
              </div>
            </div>
            <div className="mt-4">
              {activeSession ? (
                <Button className="w-full" onClick={() => {
                  // Handle attendance
                  console.log('Marking attendance for session:', activeSession.id);
                }}>
                  <Clock className="h-4 w-4 mr-2" />
                  Absen Sekarang
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  Tidak Ada Sesi Aktif
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Book className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Materi Pembelajaran</h3>
                <p className="text-gray-600">{materials.length} materi tersedia</p>
              </div>
            </div>
            <div className="mt-4">
              <Button className="w-full" variant="secondary">
                <Book className="h-4 w-4 mr-2" />
                Lihat Materi
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Progress Belajar</h3>
                <p className="text-gray-600">Lihat kemajuan</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={65} className="mb-2" />
              <p className="text-sm text-gray-600">65% selesai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>Materi Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materials.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Belum ada materi yang tersedia
              </p>
            ) : (
              materials.map((material: any) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Book className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">{material.title}</h4>
                      <p className="text-sm text-gray-600">{material.description}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="secondary">{material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</Badge>
                        <Badge variant="outline">{material.downloadCount || 0} downloads</Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownloadMaterial(material.id)}
                    disabled={!material.filePath}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
