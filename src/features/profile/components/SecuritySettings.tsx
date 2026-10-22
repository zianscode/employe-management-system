import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { PasswordData } from "@/shared/types/profile.types";
import { PASSWORD_RULE_TEXT } from "@/shared/utils/password-policy";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Field, Input } from "@/shared/components/ui/Form";
import { Button } from "@/shared/components/ui/Button";

interface SecuritySettingsProps {
  data: PasswordData;
  setData: (data: PasswordData) => void;
  showCurrent: boolean;
  setShowCurrent: (v: boolean) => void;
  showNew: boolean;
  setShowNew: (v: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
  onUpdate: () => void;
  isSaving: boolean;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  data,
  setData,
  showCurrent,
  setShowCurrent,
  showNew,
  setShowNew,
  showConfirm,
  setShowConfirm,
  onUpdate,
  isSaving,
}) => {
  const fields = [
    { label: "Password saat ini", key: "currentPassword", show: showCurrent, toggle: setShowCurrent, hint: undefined },
    { label: "Password baru", key: "newPassword", show: showNew, toggle: setShowNew, hint: PASSWORD_RULE_TEXT },
    { label: "Ulangi password baru", key: "confirmPassword", show: showConfirm, toggle: setShowConfirm, hint: undefined },
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate();
  };

  return (
    <Card className="max-w-xl">
      <CardHeader title="Ganti password" />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <Field key={field.key} label={field.label} htmlFor={field.key} hint={field.hint}>
              <div className="relative">
                <Input
                  id={field.key}
                  type={field.show ? "text" : "password"}
                  required
                  value={data[field.key]}
                  onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => field.toggle(!field.show)}
                  aria-label={field.show ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                >
                  {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          ))}
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSaving}>
              Simpan password
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};
