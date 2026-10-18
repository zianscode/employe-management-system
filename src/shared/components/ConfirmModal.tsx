"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  confirmText?: string; 
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  variant = "danger",
  isLoading = false,
  confirmText,
}) => {
  const [userInput, setUserInput] = React.useState("");

  if (!isOpen) return null;

  const isConfirmDisabled = !!isLoading || !!(confirmText && userInput !== confirmText);

  const variantStyles = {
    danger: "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white",
    warning: "bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-600 hover:text-white",
    info: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white",
  };

  const btnStyles = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-200",
    warning: "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-200",
    info: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      

      <div className="relative bg-white rounded-[28px] w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-2xl ${variantStyles[variant]}`}>
              <AlertCircle size={48} strokeWidth={1.5} />
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            {title}
          </h3>
          <p className="text-gray-500 font-medium leading-relaxed">
            {message}
          </p>

          {confirmText && (
            <div className="mt-6 text-left">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Ketik <span className="text-red-600">&quot;{confirmText}&quot;</span> untuk mengonfirmasi
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none transition-all font-bold text-center uppercase tracking-widest"
                placeholder={confirmText}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
          )}
        </div>
        
        <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row gap-3 border-t border-gray-50">
          <button
            onClick={() => {
              setUserInput("");
              onCancel();
            }}
            disabled={isLoading}
            className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              if (!isConfirmDisabled) {
                onConfirm();
                setUserInput("");
              }
            }}
            disabled={isConfirmDisabled}
            className={`flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${btnStyles[variant]}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            <span>{isLoading ? "Memproses..." : confirmLabel}</span>
          </button>
        </div>
        
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
