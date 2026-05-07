import React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginFormProps {
  formData: any;
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
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={onInputChange}
          placeholder="Email atau Username"
          className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none text-gray-800 text-lg"
          required
        />
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={onInputChange}
          placeholder="Kata Sandi"
          className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none text-gray-800 text-lg"
          required
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </div>
      <div className="text-right">
        <a href="#" className="text-sm text-[#E02F75] hover:underline font-medium">Lupa Kata Sandi?</a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-800 transition duration-200 shadow-lg disabled:opacity-70 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Loading...
          </>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
};
