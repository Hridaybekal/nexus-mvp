"use client";

import { useState } from "react";
import { X, Plus, Sparkles, Link as LinkIcon, Trash2, CheckCircle2 } from "lucide-react";
import { createProject, updateProject } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function CreateProjectModal({ isOpen, onClose, allUsers, editProject }: any) {
  const router = useRouter();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(editProject?.members?.map((m:any)=>m.id) || []);
  const [manualTasks, setManualTasks] = useState<any[]>([]);
  const [useAI, setUseAI] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAIIdentify = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setManualTasks([
        { title: "Review Initial Intel", priority: "HIGH" },
        { title: "Define Core Database Schema", priority: "MEDIUM" },
        { title: "Deploy Workspace Environment", priority: "LOW" }
      ]);
      setIsGenerating(false);
      setUseAI(false);
    }, 1500);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("memberIds", JSON.stringify(selectedMemberIds));
    formData.append("tasks", JSON.stringify(manualTasks));
    const result = editProject ? await updateProject(formData) : await createProject(formData);
    if (result.success) { onClose(); router.refresh(); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">{editProject ? "Modify Intelligence" : "Launch Mission"}</h2>
          <button type="button" onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><X size={20}/></button>
        </div>

        <div className="space-y-8">
          <input type="hidden" name="id" value={editProject?.id} />
          <input name="name" defaultValue={editProject?.name} placeholder="Mission Identity" className="w-full text-2xl font-black border-b-4 border-slate-50 focus:border-blue-500 outline-none pb-2" required />
          <textarea name="description" defaultValue={editProject?.description} placeholder="Objective Briefing..." className="w-full bg-slate-50 rounded-[24px] p-5 text-sm font-medium outline-none" rows={3} />
          
          {/* Drive Link */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-5 py-4 border-2 border-transparent focus-within:border-blue-100">
            <LinkIcon size={18} className="text-slate-400" />
            <input name="drive_url" defaultValue={editProject?.drive_url} placeholder="Google Drive / Workspace Intel Link" className="bg-transparent w-full text-xs font-bold outline-none" />
          </div>

          {/* メンバー選択 */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Deployment Team</label>
            <div className="flex flex-wrap gap-2">
              {allUsers.map((user: any) => {
                const isSelected = selectedMemberIds.includes(user.id);
                return (
                  <button key={user.id} type="button" onClick={() => setSelectedMemberIds(prev => isSelected ? prev.filter(id => id !== user.id) : [...prev, user.id])}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 border-2 ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 opacity-60'}`}
                  >
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-5 h-5 rounded-full" />
                    {user.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Task Assist */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] p-6 border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-indigo-600 flex items-center gap-2 uppercase tracking-widest"><Sparkles size={14} /> AI Brain-Dump</span>
              <button type="button" onClick={() => setUseAI(!useAI)} className="px-4 py-1.5 rounded-full text-[10px] font-black bg-white text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white">
                {useAI ? "Cancel" : "Use AI Assist"}
              </button>
            </div>
            {useAI && (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <textarea value={aiNotes} onChange={(e) => setAiNotes(e.target.value)} placeholder="Paste messy meeting notes or thoughts here..." className="w-full bg-white/80 rounded-2xl p-4 text-sm font-medium outline-none border-2 border-indigo-200 focus:border-indigo-400 min-h-[120px]" />
                <button type="button" disabled={!aiNotes || isGenerating} onClick={handleAIIdentify} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                  {isGenerating ? "Analyzing Patterns..." : "Distill Intelligence via Gemini"}
                </button>
              </div>
            )}
            {!useAI && manualTasks.length > 0 && (
              <div className="mt-4 space-y-2">
                {manualTasks.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/60 p-3 rounded-xl border border-indigo-100 text-[11px] font-bold text-slate-700 italic">
                    <CheckCircle2 size={14} className="text-indigo-500" /> {t.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black shadow-xl hover:shadow-blue-500/50 transition-all text-lg italic tracking-tight">
            {editProject ? "💾 Save Strategic Changes" : "🚀 Launch Mission Now"}
          </button>
        </div>
      </form>
    </div>
  );
}