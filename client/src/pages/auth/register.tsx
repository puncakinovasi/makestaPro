import { useLocation } from "wouter";
import { RegistrationForm } from "@/components/forms/registration-form";

export default function Register() {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <RegistrationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
