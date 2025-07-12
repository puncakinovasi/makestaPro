import { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthService } from "@/lib/auth";
import { PesertaDashboard } from "@/components/dashboard/peserta-dashboard";
import { PemateriDashboard } from "@/components/dashboard/pemateri-dashboard";
import { PanitiaDashboard } from "@/components/dashboard/panitia-dashboard";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const user = AuthService.getUser();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'peserta':
        return <PesertaDashboard />;
      case 'pemateri':
        return <PemateriDashboard />;
      case 'panitia':
        return <PanitiaDashboard />;
      default:
        return <div>Role tidak dikenali</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
}
