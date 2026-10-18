import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkUserExistsAction } from "@/server/modules/auth/auth.actions";

export function useLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "", 
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const checkRes = await checkUserExistsAction(formData.email);
      if (checkRes.success && !checkRes.data?.exists) {
        toast.error("Akun belum terdaftar!", {
          description: "Email ini tidak ditemukan. Silakan hubungi admin untuk pendaftaran.",
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Password salah!", {
          description: "Silakan periksa kembali password Anda.",
        });
      } else {
        toast.success("Login berhasil!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return {
    formData,
    showPassword,
    isLoading,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
  };
}
