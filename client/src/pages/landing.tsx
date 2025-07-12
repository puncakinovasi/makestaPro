import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, Presentation, Settings } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sistem Manajemen<br />
              <span className="text-yellow-300">Kegiatan Makesta</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Platform terpadu untuk mengelola kegiatan, absensi, materi pembelajaran, dan evaluasi dengan mudah dan efisien
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Daftar Sekarang
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="tentang" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kelola kegiatan Makesta dengan sistem yang komprehensif dan user-friendly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Manajemen Peserta</h3>
                <p className="text-gray-600">
                  Pendaftaran, absensi, dan akses materi untuk semua peserta kegiatan
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Presentation className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Portal Pemateri</h3>
                <p className="text-gray-600">
                  Kelola sesi pembelajaran, buka absensi, dan pantau progress peserta
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Admin Panitia</h3>
                <p className="text-gray-600">
                  Kontrol penuh untuk CV pemateri, nilai, materi, dan sertifikat
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hubungi Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Punya pertanyaan? Tim kami siap membantu Anda
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">info@makesta.com</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Telepon</h3>
                <p className="text-gray-600">+62 21 1234 5678</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Alamat</h3>
                <p className="text-gray-600">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
