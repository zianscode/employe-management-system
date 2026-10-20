import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LOGIN_ERRORS: Record<string, { title: string; description: string }> = {
  account_locked: {
    title: "Akun terkunci sementara",
    description: "Terlalu banyak percobaan login gagal. Silakan coba lagi dalam 15 menit.",
  },
  account_inactive: {
    title: "Akun tidak aktif",
    description: "Karyawan dengan status resign/diberhentikan tidak dapat login.",
  },
};

const INVALID_CREDENTIALS = {
  title: "Email atau password salah",
  description: "Silakan periksa kembali email dan password Anda.",
};

export function useLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        const message = (result.code && LOGIN_ERRORS[result.code]) || INVALID_CREDENTIALS;
        toast.error(message.title, { description: message.description });
        return;
      }

      toast.success("Login berhasil!");
      router.push("/dashboard");
      router.refresh();
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
