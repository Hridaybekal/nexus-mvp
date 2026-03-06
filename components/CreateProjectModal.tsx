"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { createProject } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createProject(formData);

    if (result?.success) {
      onClose();
      router.refresh(); // This updates the dashboard stats instantly
    } else {
      alert(result?.error || "Failed to create project");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">New Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Project Name</label>
            <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Q1 Marketing Campaign" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Description</label>
            <textarea name="description" rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="What is this project about?" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Google Drive Link</label>
            <input name="drive_url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://drive.google.com/..." />
          </div>
          
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">
            {isSubmitting ? "Creating..." : "Launch Project"}
          </button>
        </form>
      </div>
    </div>
  );
}