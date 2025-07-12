export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Makesta</h3>
            <p className="text-gray-400">
              Sistem manajemen kegiatan yang komprehensif untuk pembelajaran yang lebih efektif.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Fitur</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Manajemen Peserta</li>
              <li>Portal Pemateri</li>
              <li>Admin Panitia</li>
              <li>Sistem Absensi</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Dukungan</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Panduan Pengguna</li>
              <li>FAQ</li>
              <li>Kontak Support</li>
              <li>Dokumentasi</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@makesta.com</li>
              <li>Tel: +62 21 1234 5678</li>
              <li>Alamat: Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Makesta. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
