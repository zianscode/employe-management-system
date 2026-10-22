import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Field, Input } from "@/shared/components/ui/Form";
import { Button } from "@/shared/components/ui/Button";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  formData: LoginFormData;
  isLoading: boolean;
  showPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  isLoading,
  showPassword,
  onInputChange,
  onTogglePassword,
  onSubmit,
}) => {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={onInputChange}
          placeholder="nama@perusahaan.com"
          required
        />
      </Field>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <Link href="/auth/forgot-password" className="text-sm text-brand hover:underline">
            Lupa password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={onInputChange}
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" loading={isLoading} className="w-full">
        Masuk
      </Button>
    </form>
  );
};
