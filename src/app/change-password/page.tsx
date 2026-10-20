import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
