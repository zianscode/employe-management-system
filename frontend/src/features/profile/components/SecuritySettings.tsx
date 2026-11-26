import React from "react";
import { PasswordData } from "@/shared/types/profile.types";
import { PASSWORD_RULE_TEXT } from "@/shared/utils/password-policy";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { FormField } from "@/shared/components/FormField";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { Button } from "@/shared/components/ui/button";

interface SecuritySettingsProps {
  data: PasswordData;
  setData: (data: PasswordData) => void;
  onUpdate: () => void;
  isSaving: boolean;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  data,
  setData,
  onUpdate,
  isSaving,
}) => {
  const fields = [
    { label: "Password saat ini", key: "currentPassword", hint: undefined },
    { label: "Password baru", key: "newPassword", hint: PASSWORD_RULE_TEXT },
    { label: "Ulangi password baru", key: "confirmPassword", hint: undefined },
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate();
  };

  return (
    <Card className="max-w-xl">
      <CardHeading title="Ganti password" />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <FormField key={field.key} label={field.label} htmlFor={field.key} hint={field.hint}>
              <PasswordInput
                id={field.key}
                required
                value={data[field.key]}
                onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
              />
            </FormField>
          ))}
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSaving}>
              Simpan password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
