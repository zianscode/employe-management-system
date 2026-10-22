"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { completeOnboardingAction } from "@/server/modules/onboarding/onboarding.actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { STEPS, OnboardingFormData } from "@/features/onboarding/constants";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { IdentityStep } from "./steps/IdentityStep";
import { EmergencyStep } from "./steps/EmergencyStep";
import { EducationStep } from "./steps/EducationStep";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";

export const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("+62");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    phone: "",
    gender: "",
    placeOfBirth: "",
    birthDate: "",
    address: "",
    identityNumber: "",
    npwpNumber: "",
    bankName: "",
    bankAccount: "",
    bankHolderName: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    eduLevel: "",
    eduMajor: "",
    eduUniv: "",
    eduStartYear: "",
    eduEndYear: "",
    bio: ""
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const { update } = useSession();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "identityNumber" || name === "npwpNumber" || name === "bankAccount" || name === "emergencyPhone") {
      const cleanVal = value.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, [name]: cleanVal }));
      if (errors[name]) {
        setErrors(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/\D/g, "");
    if (val.startsWith("0")) {
      val = val.replace(/^0+/, "");
    }
    setFormData(prev => ({ ...prev, phone: val }));
    if (errors.phone) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    const fileInput = document.getElementById("avatar-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.phone) {
        newErrors.phone = "Nomor WhatsApp wajib diisi";
      } else if (formData.phone.length < 8 || formData.phone.length > 13) {
        newErrors.phone = "Nomor WhatsApp harus terdiri dari 8-13 digit";
      }
      if (!formData.gender) newErrors.gender = "Jenis kelamin wajib dipilih";
      if (!formData.placeOfBirth) newErrors.placeOfBirth = "Tempat lahir wajib dipilih";
      if (!formData.birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
      if (!formData.address) newErrors.address = "Alamat lengkap wajib diisi";
    }

    if (step === 2) {
      if (!formData.identityNumber) {
        newErrors.identityNumber = "Nomor KTP (NIK) wajib diisi";
      } else if (!/^\d{16}$/.test(formData.identityNumber)) {
        newErrors.identityNumber = "Nomor KTP (NIK) harus tepat 16 digit angka";
      }

      if (formData.npwpNumber) {
        if (!/^\d{15}$|^\d{16}$/.test(formData.npwpNumber)) {
          newErrors.npwpNumber = "Nomor NPWP harus tepat 15 atau 16 digit angka";
        }
      }

      if (!formData.bankName) {
        newErrors.bankName = "Nama bank wajib dipilih";
      }

      if (!formData.bankAccount) {
        newErrors.bankAccount = "Nomor rekening wajib diisi";
      } else {
        const bankDigits: Record<string, number> = {
          "BCA": 10,
          "Mandiri": 13,
          "BNI": 10,
          "BRI": 15,
          "CIMB Niaga": 13,
          "Permata": 10,
          "BTN": 16,
        };
        const expectedLength = bankDigits[formData.bankName];
        if (expectedLength !== undefined) {
          if (formData.bankAccount.length !== expectedLength) {
            newErrors.bankAccount = `Nomor rekening ${formData.bankName} harus tepat ${expectedLength} digit`;
          }
        } else {
          if (formData.bankAccount.length < 10 || formData.bankAccount.length > 18) {
            newErrors.bankAccount = "Nomor rekening harus terdiri dari 10-18 digit";
          }
        }
      }

      if (!formData.bankHolderName) {
        newErrors.bankHolderName = "Nama pemilik rekening wajib diisi";
      }
    }

    if (step === 3) {
      if (!formData.emergencyName) newErrors.emergencyName = "Nama kontak darurat wajib diisi";
      if (!formData.emergencyRelation) newErrors.emergencyRelation = "Hubungan wajib dipilih";
      if (!formData.emergencyPhone) {
        newErrors.emergencyPhone = "Nomor telepon darurat wajib diisi";
      } else if (formData.emergencyPhone.length < 9) {
        newErrors.emergencyPhone = "Nomor telepon darurat minimal 9 digit";
      }
    }

    if (step === 4) {
      if (!formData.eduLevel) newErrors.eduLevel = "Jenjang pendidikan wajib dipilih";
      if (!formData.eduMajor) newErrors.eduMajor = "Jurusan / bidang studi wajib diisi";
      if (!formData.eduUniv) newErrors.eduUniv = "Nama sekolah / universitas wajib diisi";
      if (!formData.eduStartYear) newErrors.eduStartYear = "Tahun masuk wajib dipilih";
      if (!formData.eduEndYear) newErrors.eduEndYear = "Tahun lulus / estimasi lulus wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      toast.error("Masih ada data yang belum benar. Cek isian yang ditandai.");
      return;
    }

    if (currentStep < STEPS.length) {
      nextStep();
      return;
    }

    setIsLoading(true);
    const submitData = new FormData();
    const educationString = `${formData.eduLevel} ${formData.eduMajor} - ${formData.eduUniv} (${formData.eduStartYear} - ${formData.eduEndYear})`;
    
    Object.entries(formData).forEach(([key, value]) => {
      if (!key.startsWith("edu")) {
        if (key === "phone") {
          submitData.append(key, `${countryCode}${value}`);
        } else {
          submitData.append(key, value);
        }
      }
    });
    
    submitData.append("education", educationString);
    submitData.append("skills", selectedSkills.join(", "));
    
    if (avatarPreview) {
      submitData.append("avatar", avatarPreview);
    }

    const res = await completeOnboardingAction(submitData);

    if (res.success) {
      toast.success(res.message);
      await update({ 
        isProfileComplete: true,
        image: res.data?.avatar,
        picture: res.data?.avatar
      });
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };

  const years = Array.from({ length: 41 }, (_, i) => (2030 - i).toString());

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handlePhoneChange={handlePhoneChange}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            avatarPreview={avatarPreview}
            handleAvatarChange={handleAvatarChange}
            handleRemoveAvatar={handleRemoveAvatar}
          />
        );
      case 2:
        return (
          <IdentityStep
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <EmergencyStep
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <EducationStep
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            selectedSkills={selectedSkills}
            toggleSkill={toggleSkill}
            years={years}
          />
        );
      default:
        return null;
    }
  };

  const currentTitle = STEPS.find((s) => s.id === currentStep)?.title;
  const isLastStep = currentStep === STEPS.length;

  return (
    <div className="space-y-6">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => isDone && setCurrentStep(step.id)}
                disabled={!isDone}
                className={cn(
                  "flex w-full items-center gap-2 border-t-2 pt-3 text-left text-sm",
                  isActive ? "border-brand text-brand" : isDone ? "border-brand text-gray-700" : "border-gray-200 text-gray-400",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    isDone ? "bg-brand text-white" : isActive ? "border border-brand" : "border border-gray-300",
                  )}
                >
                  {isDone ? <Check className="h-3 w-3" /> : step.id}
                </span>
                <span className="font-medium">{step.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader title={currentTitle} description={`Langkah ${currentStep} dari ${STEPS.length}`} />
          <CardBody>{renderStepContent()}</CardBody>
          <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
            <Button variant="secondary" onClick={prevStep} disabled={isLoading} className={currentStep === 1 ? "invisible" : undefined}>
              Kembali
            </Button>
            <Button type="submit" loading={isLoading}>
              {isLastStep ? "Simpan dan mulai" : "Lanjut"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
