import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
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

    // Simulated API call
    setTimeout(() => {
      if (formData.username && formData.password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", formData.username);
        router.push("/dashboard");
      } else {
        alert("Username dan password harus diisi!");
      }
      setIsLoading(false);
    }, 1000);
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
