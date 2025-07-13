import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Users, Presentation, Book, Award, Plus, Edit, Trash2, Download, UserCheck, FileText, GraduationCap, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AuthService } from "@/lib/auth";

export function PanitiaDashboardNew() {
  const [activeTab, setActiveTab] = useState("participants");
  const [isCreateMaterialOpen, setIsCreateMaterialOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
  const [isInstructorDialogOpen, setIsInstructorDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const { toast } = useToast();

  // Queries
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ['/api/participants'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: instructors = [], isLoading: instructorsLoading } = useQuery({
    queryKey: ['/api/instructors'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['/api/materials'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: grades = [], isLoading: gradesLoading } = useQuery({
    queryKey: ['/api/grades'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ['/api/certificates'],
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const createMaterialMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; file?: File }) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.file) {
        formData.append('file', data.file);
      }

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create material');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Berhasil",
        description: "Materi berhasil ditambahkan",
      });
      setIsCreateMaterialOpen(false);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan materi",
        variant: "destructive",
      });
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: number) => {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete material');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Berhasil",
        description: "Materi berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus materi",
        variant: "destructive",
      });
    },
  });

  const deleteInstructorMutation = useMutation({
    mutationFn: async (instructorId: number) => {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete instructor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      toast({
        title: "Berhasil",
        description: "Pemateri berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus pemateri",
        variant: "destructive",
      });
    },
  });

  const createGradeMutation = useMutation({
    mutationFn: async (gradeData: any) => {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify(gradeData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create grade');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grades'] });
      toast({
        title: "Berhasil",
        description: "Nilai berhasil disimpan",
      });
      setIsGradeDialogOpen(false);
      setSelectedParticipant(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan nilai",
        variant: "destructive",
      });
    },
  });

  const generateCertificateMutation = useMutation({
    mutationFn: async (participantId: number) => {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          participantId,
          certificateType: 'completion',
          notes: 'Sertifikat kelulusan Makesta',
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate certificate');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      toast({
        title: "Berhasil",
        description: "Sertifikat berhasil dibuat",
      });
      setIsCertificateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat sertifikat",
        variant: "destructive",
      });
    },
  });

  const createInstructorMutation = useMutation({
    mutationFn: async (instructorData: any) => {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify(instructorData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create instructor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      toast({
        title: "Berhasil",
        description: "Pemateri berhasil ditambahkan",
      });
      setIsInstructorDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan pemateri",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const handleCreateMaterial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Judul materi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    createMaterialMutation.mutate({ title, description, file: selectedFile || undefined });
  };

  const handleCreateGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const participantId = parseInt(formData.get('participantId') as string);
    const assignmentScore = parseInt(formData.get('assignmentScore') as string) || 0;
    const examScore = parseInt(formData.get('examScore') as string) || 0;
    const finalScore = parseInt(formData.get('finalScore') as string) || 0;

    if (!participantId) {
      toast({
        title: "Error",
        description: "Pilih peserta terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    createGradeMutation.mutate({
      participantId,
      assignmentScore,
      examScore,
      finalScore,
    });
  };

  const handleCreateInstructor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = parseInt(formData.get('userId') as string);
    const specialization = formData.get('specialization') as string;
    const cv = formData.get('cv') as string;

    if (!userId || !specialization.trim()) {
      toast({
        title: "Error",
        description: "User ID dan spesialisasi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    createInstructorMutation.mutate({
      userId,
      specialization,
      cv,
    });
  };

  const exportParticipants = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Nama,Email,Telepon,Tempat Lahir,Alamat,SD,SMP,SMA,Tujuan,Minat,Bakat,Motto\n" +
      participants.map((p: any) => 
        `"${p.user.fullName}","${p.user.email}","${p.user.phone}","${p.birthPlace}","${p.address}","${p.elementary}","${p.juniorHigh || ''}","${p.seniorHigh || ''}","${p.purpose}","${p.interests}","${p.talents}","${p.motto || ''}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data-peserta-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Berhasil",
      description: "Data peserta berhasil diekspor",
    });
  };

  const downloadMaterial = (materialId: number, title: string) => {
    const link = document.createElement("a");
    link.href = `/api/materials/${materialId}/download`;
    link.target = "_blank";
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Panitia</h1>
              <p className="text-gray-600 mt-1">Kontrol penuh sistem manajemen Makesta</p>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-blue-900">{participants.length}</h3>
                  <p className="text-blue-600">Total Peserta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Presentation className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-green-900">{instructors.length}</h3>
                  <p className="text-green-600">Pemateri</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Book className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-purple-900">{materials.length}</h3>
                  <p className="text-purple-600">Materi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-orange-900">{certificates.length}</h3>
                  <p className="text-orange-600">Sertifikat</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Manajemen Sistem Makesta</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="participants" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Peserta</span>
                </TabsTrigger>
                <TabsTrigger value="materials" className="flex items-center space-x-2">
                  <Book className="h-4 w-4" />
                  <span>Materi</span>
                </TabsTrigger>
                <TabsTrigger value="instructors" className="flex items-center space-x-2">
                  <Presentation className="h-4 w-4" />
                  <span>Pemateri</span>
                </TabsTrigger>
                <TabsTrigger value="grades" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Nilai</span>
                </TabsTrigger>
                <TabsTrigger value="certificates" className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Sertifikat</span>
                </TabsTrigger>
              </TabsList>

              {/* Participants Tab */}
              <TabsContent value="participants" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Data Peserta</h3>
                  <Button onClick={exportParticipants} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                {participantsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold">Nama</th>
                            <th className="text-left p-4 font-semibold">Email</th>
                            <th className="text-left p-4 font-semibold">Telepon</th>
                            <th className="text-left p-4 font-semibold">Tempat Lahir</th>
                            <th className="text-left p-4 font-semibold">Alamat</th>
                            <th className="text-left p-4 font-semibold">Pendidikan</th>
                            <th className="text-left p-4 font-semibold">Minat</th>
                            <th className="text-left p-4 font-semibold">Bakat</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((participant: any, index: number) => (
                            <tr key={participant.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="p-4">
                                <div className="font-medium">{participant.user.fullName}</div>
                                <div className="text-sm text-gray-500">{participant.user.username}</div>
                              </td>
                              <td className="p-4">{participant.user.email}</td>
                              <td className="p-4">{participant.user.phone}</td>
                              <td className="p-4">{participant.birthPlace}</td>
                              <td className="p-4 max-w-xs truncate">{participant.address}</td>
                              <td className="p-4">
                                <div className="text-sm space-y-1">
                                  <div><span className="font-medium">SD:</span> {participant.elementary}</div>
                                  {participant.juniorHigh && <div><span className="font-medium">SMP:</span> {participant.juniorHigh}</div>}
                                  {participant.seniorHigh && <div><span className="font-medium">SMA:</span> {participant.seniorHigh}</div>}
                                </div>
                              </td>
                              <td className="p-4 max-w-xs truncate">{participant.interests}</td>
                              <td className="p-4 max-w-xs truncate">{participant.talents}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Materials Tab */}
              <TabsContent value="materials" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manajemen Materi</h3>
                  <Dialog open={isCreateMaterialOpen} onOpenChange={setIsCreateMaterialOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Materi
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Upload Materi Baru</DialogTitle>
                        <DialogDescription>
                          Upload file materi pembelajaran untuk peserta
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateMaterial} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Judul Materi *</Label>
                          <Input id="title" name="title" required placeholder="Masukkan judul materi" />
                        </div>
                        <div>
                          <Label htmlFor="description">Deskripsi</Label>
                          <Textarea id="description" name="description" placeholder="Deskripsi materi (opsional)" />
                        </div>
                        <div>
                          <Label>File Materi</Label>
                          <FileUpload
                            onFileSelect={setSelectedFile}
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                            maxSizeMB={10}
                            className="mt-2"
                          />
                          {selectedFile && (
                            <p className="text-sm text-gray-600 mt-2">
                              File terpilih: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsCreateMaterialOpen(false)}>
                            Batal
                          </Button>
                          <Button type="submit" disabled={createMaterialMutation.isPending}>
                            {createMaterialMutation.isPending ? 'Mengupload...' : 'Upload Materi'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {materialsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map((material: any) => (
                      <Card key={material.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Book className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => downloadMaterial(material.id, material.title)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
                                    deleteMaterialMutation.mutate(material.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-medium mb-2">{material.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{material.description || 'Tidak ada deskripsi'}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <span>{material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</span>
                            <span>{material.downloadCount || 0} downloads</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => downloadMaterial(material.id, material.title)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Instructors Tab */}
              <TabsContent value="instructors" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manajemen Pemateri</h3>
                  <Dialog open={isInstructorDialogOpen} onOpenChange={setIsInstructorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Pemateri
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Pemateri Baru</DialogTitle>
                        <DialogDescription>
                          Tambahkan pemateri baru ke dalam sistem
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateInstructor} className="space-y-4">
                        <div>
                          <Label htmlFor="userId">User ID *</Label>
                          <Input 
                            id="userId" 
                            name="userId" 
                            type="number" 
                            required 
                            placeholder="Masukkan User ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor="specialization">Spesialisasi *</Label>
                          <Input 
                            id="specialization" 
                            name="specialization" 
                            required 
                            placeholder="Contoh: Web Development, Data Science"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cv">CV/Resume</Label>
                          <Textarea 
                            id="cv" 
                            name="cv" 
                            placeholder="Ringkasan CV pemateri (opsional)"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsInstructorDialogOpen(false)}>
                            Batal
                          </Button>
                          <Button type="submit" disabled={createInstructorMutation.isPending}>
                            {createInstructorMutation.isPending ? 'Menyimpan...' : 'Tambah Pemateri'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {instructorsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold">Nama</th>
                            <th className="text-left p-4 font-semibold">Keahlian</th>
                            <th className="text-left p-4 font-semibold">Status</th>
                            <th className="text-left p-4 font-semibold">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instructors.map((instructor: any, index: number) => (
                            <tr key={instructor.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="p-4">
                                <div className="font-medium">{instructor.user.fullName}</div>
                                <div className="text-sm text-gray-500">{instructor.user.email}</div>
                              </td>
                              <td className="p-4">{instructor.specialization}</td>
                              <td className="p-4">
                                <Badge variant={instructor.status === 'active' ? 'default' : 'secondary'}>
                                  {instructor.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="ghost">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => {
                                      if (confirm('Apakah Anda yakin ingin menghapus pemateri ini?')) {
                                        deleteInstructorMutation.mutate(instructor.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Grades Tab */}
              <TabsContent value="grades" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manajemen Nilai</h3>
                  <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Input Nilai
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Input Nilai Peserta</DialogTitle>
                        <DialogDescription>
                          Masukkan nilai untuk peserta tertentu
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateGrade} className="space-y-4">
                        <div>
                          <Label htmlFor="participantId">Peserta *</Label>
                          <Select name="participantId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih peserta" />
                            </SelectTrigger>
                            <SelectContent>
                              {participants.map((participant: any) => (
                                <SelectItem key={participant.id} value={participant.userId.toString()}>
                                  {participant.user.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="assignmentScore">Nilai Tugas (0-100)</Label>
                          <Input 
                            id="assignmentScore" 
                            name="assignmentScore" 
                            type="number" 
                            min="0" 
                            max="100" 
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="examScore">Nilai Ujian (0-100)</Label>
                          <Input 
                            id="examScore" 
                            name="examScore" 
                            type="number" 
                            min="0" 
                            max="100" 
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="finalScore">Nilai Final (0-100)</Label>
                          <Input 
                            id="finalScore" 
                            name="finalScore" 
                            type="number" 
                            min="0" 
                            max="100" 
                            placeholder="0"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                            Batal
                          </Button>
                          <Button type="submit" disabled={createGradeMutation.isPending}>
                            {createGradeMutation.isPending ? 'Menyimpan...' : 'Simpan Nilai'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {gradesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold">Nama Peserta</th>
                            <th className="text-left p-4 font-semibold">Tugas</th>
                            <th className="text-left p-4 font-semibold">Ujian</th>
                            <th className="text-left p-4 font-semibold">Final</th>
                            <th className="text-left p-4 font-semibold">Rata-rata</th>
                            <th className="text-left p-4 font-semibold">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades.map((grade: any, index: number) => {
                            const average = ((grade.assignmentScore || 0) + (grade.examScore || 0) + (grade.finalScore || 0)) / 3;
                            return (
                              <tr key={grade.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="p-4 font-medium">{grade.participant.fullName}</td>
                                <td className="p-4">{grade.assignmentScore || '-'}</td>
                                <td className="p-4">{grade.examScore || '-'}</td>
                                <td className="p-4">{grade.finalScore || '-'}</td>
                                <td className="p-4">
                                  <Badge variant={average >= 75 ? 'default' : average >= 60 ? 'secondary' : 'destructive'}>
                                    {average.toFixed(1)}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <Button size="sm" variant="ghost">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manajemen Sertifikat</h3>
                  <Dialog open={isCertificateDialogOpen} onOpenChange={setIsCertificateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Sertifikat
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate Sertifikat</DialogTitle>
                        <DialogDescription>
                          Pilih peserta untuk membuat sertifikat
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Pilih Peserta untuk Generate Sertifikat</Label>
                          <div className="grid grid-cols-1 gap-2 mt-2 max-h-60 overflow-y-auto">
                            {participants.map((participant: any) => (
                              <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div>
                                  <div className="font-medium">{participant.user.fullName}</div>
                                  <div className="text-sm text-gray-500">{participant.user.email}</div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => generateCertificateMutation.mutate(participant.userId)}
                                  disabled={generateCertificateMutation.isPending}
                                >
                                  {generateCertificateMutation.isPending ? 'Generating...' : 'Generate'}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {certificatesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certificates.map((certificate: any) => (
                      <Card key={certificate.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Award className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-medium mb-2">{certificate.participant.fullName}</h4>
                          <p className="text-sm text-gray-600 mb-3">{certificate.certificateType}</p>
                          <div className="text-sm text-gray-500">
                            <div>Generated: {new Date(certificate.issuedAt).toLocaleDateString('id-ID')}</div>
                            <div>Type: {certificate.certificateType}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}