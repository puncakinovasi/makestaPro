import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type Registration } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface RegistrationFormProps {
  onSuccess: () => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Registration>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: Registration) => {
    setIsLoading(true);
    try {
      await AuthService.register(data);
      toast({
        title: "Pendaftaran berhasil",
        description: "Akun Anda telah berhasil dibuat. Selamat datang di Makesta!",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Pendaftaran gagal",
        description: error.message || "Terjadi kesalahan saat mendaftar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Pendaftaran Makesta</CardTitle>
        <CardDescription className="text-center">
          Lengkapi formulir berikut untuk mendaftar sebagai peserta Makesta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Informasi Akun</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="Masukkan username"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Masukkan password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Informasi Pribadi</h3>
              <div>
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="birthPlace">Tempat, Tanggal Lahir *</Label>
                <Input
                  id="birthPlace"
                  {...register("birthPlace")}
                  placeholder="Contoh: Jakarta, 15 Januari 1990"
                />
                {errors.birthPlace && (
                  <p className="text-sm text-red-500 mt-1">{errors.birthPlace.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Alamat *</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telepon / WA *</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="08123456789"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="nama@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Education */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Riwayat Pendidikan</h3>
              <div>
                <Label htmlFor="elementary">SD / MI *</Label>
                <Input
                  id="elementary"
                  {...register("elementary")}
                  placeholder="Nama sekolah dasar"
                />
                {errors.elementary && (
                  <p className="text-sm text-red-500 mt-1">{errors.elementary.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="juniorHigh">SMP / MTS</Label>
                <Input
                  id="juniorHigh"
                  {...register("juniorHigh")}
                  placeholder="Nama sekolah menengah pertama"
                />
              </div>
              <div>
                <Label htmlFor="seniorHigh">SMA / SMK / MA</Label>
                <Input
                  id="seniorHigh"
                  {...register("seniorHigh")}
                  placeholder="Nama sekolah menengah atas"
                />
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Informasi Tambahan</h3>
              <div>
                <Label htmlFor="purpose">Tujuan Mengikuti Makesta *</Label>
                <Textarea
                  id="purpose"
                  {...register("purpose")}
                  placeholder="Jelaskan tujuan Anda mengikuti kegiatan Makesta"
                  rows={3}
                />
                {errors.purpose && (
                  <p className="text-sm text-red-500 mt-1">{errors.purpose.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="organizationExperience">Pengalaman Organisasi</Label>
                <Textarea
                  id="organizationExperience"
                  {...register("organizationExperience")}
                  placeholder="Ceritakan pengalaman organisasi Anda"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="interests">Minat Kamu Saat Ini *</Label>
                <Textarea
                  id="interests"
                  {...register("interests")}
                  placeholder="Jelaskan minat dan hobi Anda"
                  rows={3}
                />
                {errors.interests && (
                  <p className="text-sm text-red-500 mt-1">{errors.interests.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="talents">Bakat yang Kamu Miliki *</Label>
                <Textarea
                  id="talents"
                  {...register("talents")}
                  placeholder="Ceritakan bakat dan kemampuan khusus Anda"
                  rows={3}
                />
                {errors.talents && (
                  <p className="text-sm text-red-500 mt-1">{errors.talents.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="motto">Motto Hidup</Label>
                <Input
                  id="motto"
                  {...register("motto")}
                  placeholder="Masukkan motto hidup Anda"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Mendaftar...
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
