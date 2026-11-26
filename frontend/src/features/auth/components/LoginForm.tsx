import Link from "next/link";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { Label } from "@/shared/components/ui/label";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  formData: LoginFormData;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  isLoading,
  onInputChange,
  onSubmit,
}) => {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField label="Email" htmlFor="email">
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
      </FormField>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
            Lupa password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={onInputChange}
          required
        />
      </div>

      <Button type="submit" loading={isLoading} className="w-full">
        Masuk
      </Button>
    </form>
  );
};
