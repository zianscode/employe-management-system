"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { completeOnboardingAction } from "@/server/modules/onboarding/onboarding.actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { STEPS, OnboardingFormData } from "@/features/onboarding/constants";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { IdentityStep } from "./steps/IdentityStep";
import { EmergencyStep } from "./steps/EmergencyStep";
import { EducationStep } from "./steps/EducationStep";

export const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
      toast.error("Mohon lengkapi data dengan benar sebelum melanjutkan.");
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
            focusedField={focusedField}
            setFocusedField={setFocusedField}
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
            focusedField={focusedField}
            setFocusedField={setFocusedField}
            handleInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <EmergencyStep
            formData={formData}
            errors={errors}
            focusedField={focusedField}
            setFocusedField={setFocusedField}
            handleInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <EducationStep
            formData={formData}
            errors={errors}
            focusedField={focusedField}
            setFocusedField={setFocusedField}
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="relative px-2">
        <div className="absolute top-[20px] left-8 right-8 h-[1px] bg-slate-200 overflow-hidden rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-[#FF5A57] to-[#E02F75] transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(224,47,117,0.3)]"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>
        </div>
        
        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id || (currentStep === STEPS.length && step.id === STEPS.length);
            
            return (
              <div key={step.id} className="flex flex-col items-center group cursor-pointer" onClick={() => step.id < currentStep && setCurrentStep(step.id)}>
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 relative z-10 ${
                    isCompleted 
                      ? "bg-[#E02F75] text-white" 
                      : isActive 
                        ? "bg-white text-slate-900 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 scale-110" 
                        : "bg-white text-slate-300 border border-slate-100"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  
                  {isActive && !isCompleted && (
                    <div className="absolute -inset-1 bg-slate-100/50 rounded-xl animate-pulse -z-10"></div>
                  )}
                </div>
                <div className="mt-3 flex flex-col items-center">
                   <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? "text-slate-900" : "text-slate-300"}`}>
                    Step 0{step.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="relative bg-white/80 backdrop-blur-xl border border-white p-8 sm:p-12 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-700"
      >
        <div className="relative z-10">
          <div className="mb-10 text-center sm:text-left">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
              {STEPS.find(s => s.id === currentStep)?.title}
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Mohon lengkapi data berikut dengan benar dan teliti.
            </p>
          </div>

          {renderStepContent()}

          <div className="flex flex-col sm:flex-row items-center justify-between mt-12 pt-8 border-t border-slate-100 gap-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${
                currentStep === 1 ? "opacity-0 pointer-events-none" : "bg-slate-50 text-slate-400 hover:bg-slate-100 active:scale-95"
              }`}
            >
              <ArrowLeft size={14} />
              Kembali
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : currentStep === STEPS.length ? (
                <>Simpan Perubahan <CheckCircle2 size={16} /></>
              ) : (
                <>Lanjutkan <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
