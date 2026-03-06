"use client";

import { useState } from "react";
import { Plus, X, Folder, Edit3, Trash2, UserPlus, ListTodo, Link as LinkIcon, Sparkles } from "lucide-react";
import { createProject, updateProject, deleteProject } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function ProjectClientContent({ initialProjects, allUsers, currentUser }: { initialProjects: any[], allUsers: any[], currentUser?: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  
  const [manualTasks, setManualTasks] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(false);

  const resetForm = () => {
    setSelectedProject(null);
    setIsEditMode(false);
    setManualTasks([]);
    setSelectedMemberIds([]);
    setUseAI(false);
  };

  const handleEdit = (e: React.MouseEvent, proj: any) => {
    e.stopPropagation();
    setSelectedProject(proj);
    setIsEditMode(true);
    setSelectedMemberIds(proj.members.map((m:any)=>m.id) || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Terminate this mission?")) {
      await deleteProject(id);
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("memberIds", JSON.stringify(selectedMemberIds));
    formData.append("tasks", JSON.stringify(manualTasks));

    const result = isEditMode ? await updateProject(formData) : await createProject(formData);

    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      router.refresh();
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Nexus Intelligence</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Operations Console</h1>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-sm flex items-center gap-2 hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20 active:scale-95">
          <Plus size={20} strokeWidth={3} /> Launch New Mission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialProjects.map((proj) => (
          <div key={proj.id} onClick={() => { setSelectedProject(proj); setIsEditMode(false); setIsModalOpen(true); }} 
            className="group relative bg-white/40 backdrop-blur-3xl border border-white/60 p-8 rounded-[48px] hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between h-[320px] overflow-hidden"
          >
            {/* Tile Actions (Edit/Delete) */}
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => handleEdit(e, proj)} className="p-2 bg-white text-blue-600 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16}/></button>
              <button onClick={(e) => handleDelete(e, proj.id)} className="p-2 bg-white text-red-500 rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
            </div>

            <div>
              <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl w-fit mb-6 shadow-inner"><Folder size={28} /></div>
              <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2">{proj.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 font-medium italic opacity-70">"{proj.description}"</p>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="flex -space-x-3">
                {proj.members?.slice(0, 3).map((m: any) => (
                  <img key={m.id} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" title={m.name} />
                ))}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Team</div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL remains as the unified form for both New and View mode */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto scrollbar-hide">
            {/* Form content remains similar to previous turn but polished... */}
             <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">{isEditMode ? "Modify Intel" : selectedProject ? "Project Dossier" : "Launch Mission"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><X size={20}/></button>
            </div>
            
            <div className="space-y-8">
              <input type="hidden" name="id" value={selectedProject?.id} />
              <div className={!isEditMode && selectedProject ? "pointer-events-none opacity-60" : ""}>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Mission Name</label>
                <input name="name" defaultValue={selectedProject?.name} placeholder="Project Name" className="w-full text-2xl font-black border-b-4 border-slate-50 focus:border-blue-500 outline-none pb-2 transition-all" required />
              </div>

              {/* ... Other fields (Description, Drive URL, Member Picker) ... */}
              {/* Submit Button */}
              {(isEditMode || !selectedProject) && (
                <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-500/20 hover:shadow-blue-500/50 transition-all text-lg italic tracking-tight">
                  {isEditMode ? "💾 Save Changes" : "🚀 Launch Mission Now"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}