import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Users, Presentation, Book, Award, Plus, Edit, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AuthService } from "@/lib/auth";

export function PanitiaDashboard() {
  const [activeTab, setActiveTab] = useState("participants");
  const [isCreateMaterialOpen, setIsCreateMaterialOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const { toast } = useToast();

  const { data: participants = [] } = useQuery({
    queryKey: ['/api/participants'],
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['/api/instructors'],
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['/api/materials'],
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['/api/grades'],
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['/api/certificates'],
  });

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
      if (!response.ok) throw new Error('Failed to create material');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Materi berhasil ditambahkan",
        description: "Materi baru telah tersedia untuk peserta",
      });
      setIsCreateMaterialOpen(false);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menambahkan materi",
        description: error.message,
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
      if (!response.ok) throw new Error('Failed to delete material');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Materi berhasil dihapus",
        description: "Materi telah dihapus dari sistem",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus materi",
        description: error.message,
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
      if (!response.ok) throw new Error('Failed to delete instructor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      toast({
        title: "Pemateri berhasil dihapus",
        description: "Data pemateri telah dihapus dari sistem",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus pemateri",
        description: error.message,
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
      if (!response.ok) throw new Error('Failed to create grade');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grades'] });
      toast({
        title: "Nilai berhasil disimpan",
        description: "Nilai peserta telah diperbarui",
      });
      setIsGradeDialogOpen(false);
      setSelectedParticipant(null);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menyimpan nilai",
        description: error.message,
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
      if (!response.ok) throw new Error('Failed to generate certificate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      toast({
        title: "Sertifikat berhasil dibuat",
        description: "Sertifikat telah digenerate untuk peserta",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal membuat sertifikat",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateMaterial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    createMaterialMutation.mutate({ title, description, file: selectedFile || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Panitia</h1>
        <p className="text-gray-600">Kontrol penuh sistem manajemen Makesta</p>
      </div>

      {/* Stats Overview */}
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
                <Presentation className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{instructors.length}</h3>
                <p className="text-gray-600">Pemateri</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Book className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{materials.length}</h3>
                <p className="text-gray-600">Materi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{certificates.length}</h3>
                <p className="text-gray-600">Sertifikat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="participants">Peserta</TabsTrigger>
              <TabsTrigger value="materials">Materi</TabsTrigger>
              <TabsTrigger value="instructors">Pemateri</TabsTrigger>
              <TabsTrigger value="grades">Nilai</TabsTrigger>
              <TabsTrigger value="certificates">Sertifikat</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Data Peserta</h3>
                <Button onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + 
                    "Nama,Email,Telepon,Tempat Lahir,Alamat,SD,SMP,SMA,Tujuan,Minat,Bakat\n" +
                    participants.map((p: any) => 
                      `"${p.user.fullName}","${p.user.email}","${p.user.phone}","${p.birthPlace}","${p.address}","${p.elementary}","${p.juniorHigh || ''}","${p.seniorHigh || ''}","${p.purpose}","${p.interests}","${p.talents}"`
                    ).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "data-peserta.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nama</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Telepon</th>
                      <th className="text-left p-2">Tempat Lahir</th>
                      <th className="text-left p-2">Alamat</th>
                      <th className="text-left p-2">Pendidikan</th>
                      <th className="text-left p-2">Minat</th>
                      <th className="text-left p-2">Bakat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant: any) => (
                      <tr key={participant.id} className="border-b">
                        <td className="p-2">
                          <div className="font-medium">{participant.user.fullName}</div>
                          <div className="text-sm text-gray-500">{participant.user.username}</div>
                        </td>
                        <td className="p-2">{participant.user.email}</td>
                        <td className="p-2">{participant.user.phone}</td>
                        <td className="p-2">{participant.birthPlace}</td>
                        <td className="p-2 max-w-xs truncate">{participant.address}</td>
                        <td className="p-2">
                          <div className="text-sm">
                            <div>SD: {participant.elementary}</div>
                            {participant.juniorHigh && <div>SMP: {participant.juniorHigh}</div>}
                            {participant.seniorHigh && <div>SMA: {participant.seniorHigh}</div>}
                          </div>
                        </td>
                        <td className="p-2 max-w-xs truncate">{participant.interests}</td>
                        <td className="p-2 max-w-xs truncate">{participant.talents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manajemen Materi</h3>
                <Dialog open={isCreateMaterialOpen} onOpenChange={setIsCreateMaterialOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Materi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Upload Materi Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateMaterial} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Judul Materi</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea id="description" name="description" />
                      </div>
                      <div>
                        <Label>File Materi</Label>
                        <FileUpload
                          onFileSelect={setSelectedFile}
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          maxSizeMB={10}
                        />
                      </div>
                      <Button type="submit" disabled={createMaterialMutation.isPending}>
                        {createMaterialMutation.isPending ? 'Mengupload...' : 'Upload Materi'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((material: any) => (
                  <Card key={material.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Book className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMaterialMutation.mutate(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="font-medium mb-2">{material.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</span>
                      <span>{material.downloadCount || 0} downloads</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const token = localStorage.getItem('makesta_token');
                        window.open(`/api/materials/${material.id}/download`, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="instructors" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manajemen Pemateri</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pemateri
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nama</th>
                      <th className="text-left p-2">Keahlian</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((instructor: any) => (
                      <tr key={instructor.id} className="border-b">
                        <td className="p-2">
                          <div className="font-medium">{instructor.user.fullName}</div>
                          <div className="text-sm text-gray-500">{instructor.user.email}</div>
                        </td>
                        <td className="p-2">{instructor.specialization}</td>
                        <td className="p-2">
                          <Badge variant={instructor.status === 'active' ? 'default' : 'secondary'}>
                            {instructor.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </td>
                        <td className="p-2">
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
            </TabsContent>

            <TabsContent value="grades" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manajemen Nilai</h3>
                <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Input Nilai
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Input Nilai Peserta</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const participantId = parseInt(formData.get('participantId') as string);
                      const assignmentScore = parseInt(formData.get('assignmentScore') as string);
                      const examScore = parseInt(formData.get('examScore') as string);
                      const finalScore = parseInt(formData.get('finalScore') as string);
                      
                      createGradeMutation.mutate({
                        participantId,
                        assignmentScore,
                        examScore,
                        finalScore,
                      });
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="participantId">Peserta</Label>
                        <select 
                          id="participantId" 
                          name="participantId" 
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="">Pilih Peserta</option>
                          {participants.map((participant: any) => (
                            <option key={participant.id} value={participant.userId}>
                              {participant.user.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="assignmentScore">Nilai Tugas</Label>
                        <Input id="assignmentScore" name="assignmentScore" type="number" min="0" max="100" />
                      </div>
                      <div>
                        <Label htmlFor="examScore">Nilai Ujian</Label>
                        <Input id="examScore" name="examScore" type="number" min="0" max="100" />
                      </div>
                      <div>
                        <Label htmlFor="finalScore">Nilai Final</Label>
                        <Input id="finalScore" name="finalScore" type="number" min="0" max="100" />
                      </div>
                      <Button type="submit" disabled={createGradeMutation.isPending}>
                        {createGradeMutation.isPending ? 'Menyimpan...' : 'Simpan Nilai'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nama Peserta</th>
                      <th className="text-left p-2">Tugas</th>
                      <th className="text-left p-2">Ujian</th>
                      <th className="text-left p-2">Final</th>
                      <th className="text-left p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade: any) => (
                      <tr key={grade.id} className="border-b">
                        <td className="p-2 font-medium">{grade.participant.fullName}</td>
                        <td className="p-2">{grade.assignmentScore || '-'}</td>
                        <td className="p-2">{grade.examScore || '-'}</td>
                        <td className="p-2">{grade.finalScore || '-'}</td>
                        <td className="p-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="certificates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manajemen Sertifikat</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Sertifikat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Sertifikat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Pilih Peserta untuk Generate Sertifikat</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2 max-h-60 overflow-y-auto">
                          {participants.map((participant: any) => (
                            <div key={participant.id} className="flex items-center justify-between p-2 border rounded">
                              <span className="font-medium">{participant.user.fullName}</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((certificate: any) => (
                  <Card key={certificate.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-purple-600" />
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
                      <div>Generated: {new Date(certificate.issuedAt).toLocaleDateString()}</div>
                      <div>Type: {certificate.certificateType}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
