// "use client";

// import { useState } from "react";
// import { Plus, X, Folder, Edit3, Check, UserPlus, ListTodo, CheckCircle2, Circle } from "lucide-react";
// import { updateProject, deleteProject, toggleTaskStatus, createProject } from "@/lib/actions";
// import { useRouter } from "next/navigation";

// export default function ProjectClientContent({ initialProjects, allUsers }: { initialProjects: any[], allUsers: any[] }) {
//   const router = useRouter();
//   const [projects, setProjects] = useState(initialProjects);
//   const [selectedProject, setSelectedProject] = useState<any | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isNewModalOpen, setIsNewModalOpen] = useState(false);
//   const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // 1. Refresh Data Helper (Standard Way)
//   const refreshData = () => {
//     router.refresh(); // This tells Next.js to re-run the Server Component
//     // Since we want instant UI updates, we can also manually update local state if needed
//   };

//   const handleOpenProject = (proj: any) => {
//     const parsedMembers = proj.teamNames && proj.teamNames !== "[]" ? JSON.parse(proj.teamNames) : [];
//     setSelectedMembers(parsedMembers);
//     setSelectedProject(proj);
//     setIsEditMode(false);
//   };

//   const handleToggleTask = async (taskId: string, currentStatus: string) => {
//     const result = await toggleTaskStatus(taskId, currentStatus);
//     if (result.success) {
//       // Optimistically update UI
//       setSelectedProject((prev: any) => ({
//         ...prev,
//         tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, status: result.newStatus } : t)
//       }));
//       refreshData();
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (window.confirm("Delete this project?")) {
//       await deleteProject(id);
//       setSelectedProject(null);
//       refreshData();
//     }
//   };

//   const getProgress = (tasks: any[]) => {
//     if (!tasks || tasks.length === 0) return 0;
//     const done = tasks.filter(t => t.status === "DONE").length;
//     return Math.round((done / tasks.length) * 100);
//   };

//   return (
//     <div className="animate-in fade-in duration-500">
//       <div className="flex justify-between items-end mb-10">
//         <div>
//           <p className="text-sm font-black text-blue-600/80 uppercase tracking-widest mb-1">Workspace</p>
//           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Project Management</h1>
//         </div>
//         <button 
//           onClick={() => { setIsNewModalOpen(true); setSelectedMembers([]); }}
//           className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all"
//         >
//           <Plus size={18} strokeWidth={3} /> Launch New Project
//         </button>
//       </div>

//       {/* Project Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {initialProjects.map((proj) => {
//           const progress = getProgress(proj.tasks);
//           const displayMembers = proj.teamNames && proj.teamNames !== "[]" ? JSON.parse(proj.teamNames) : ["Hriday"];
//           return (
//             <div key={proj.id} onClick={() => handleOpenProject(proj)} className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full">
//                {/* ... (Your existing card UI here) ... */}
//                <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl w-fit mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Folder size={24} /></div>
//                <h3 className="text-xl font-black text-slate-800 mb-2">{proj.name}</h3>
//                <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden mt-4">
//                   <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
//                </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* --- Modals (View/Edit) --- */}
//       {selectedProject && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-md" onClick={() => setSelectedProject(null)}></div>
//           <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-2xl border border-white rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
//              {/* ... (Your existing modal UI here) ... */}
//              <div className="flex justify-between mb-6">
//                 <h2 className="text-3xl font-black text-slate-900">{selectedProject.name}</h2>
//                 <button onClick={() => handleDelete(selectedProject.id)} className="text-red-400 hover:text-red-600"><X size={24}/></button>
//              </div>
//              {/* Task List Toggles */}
//              <div className="space-y-3">
//                 {selectedProject.tasks?.map((task: any) => (
//                     <button key={task.id} onClick={() => handleToggleTask(task.id, task.status)} className="flex items-center gap-3 w-full text-left p-3 bg-white/50 rounded-2xl border border-white">
//                         {task.status === "DONE" ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-300" />}
//                         <span className={task.status === "DONE" ? "line-through text-slate-400" : "font-bold"}>{task.title}</span>
//                     </button>
//                 ))}
//              </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Plus, X, Folder, Edit3, Trash2, UserPlus, ListTodo, Link as LinkIcon, Sparkles, AlertCircle } from "lucide-react";
import { createProject, updateProject, deleteProject } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function ProjectClientContent({ initialProjects, allUsers }: { initialProjects: any[], allUsers: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  
  // Form State
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("memberIds", JSON.stringify(selectedMemberIds));
    formData.append("tasks", JSON.stringify(manualTasks));

    const result = isEditMode 
      ? await updateProject(formData) 
      : await createProject(formData);

    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      router.refresh();
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">Nexus Workspace</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Projects</h1>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
          <Plus size={18} /> Launch New Project
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialProjects.map((proj) => (
          <div key={proj.id} onClick={() => { setSelectedProject(proj); setIsEditMode(false); setIsModalOpen(true); setSelectedMemberIds(proj.members.map((m:any)=>m.id) || []); }} className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[32px] hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex justify-between mb-4">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Folder size={24} /></div>
               <div className="flex -space-x-2">
                 {proj.members?.map((m: any) => (
                   <img key={m.id} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-8 h-8 rounded-full border-2 border-white" title={m.name} />
                 ))}
               </div>
            </div>
            <h3 className="text-xl font-black text-slate-800">{proj.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mt-2">{proj.description}</p>
          </div>
        ))}
      </div>

      {/* --- THE MASTER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-black text-slate-900">{isEditMode ? "Edit Project" : "New Project"}</h2>
              <div className="flex gap-2">
                {isEditMode && (
                  <button type="button" onClick={async () => { if(confirm("Delete?")) { await deleteProject(selectedProject.id); setIsModalOpen(false); router.refresh(); }}} className="p-2 text-red-400 hover:bg-red-50 rounded-full"><Trash2 size={20} /></button>
                )}
                {!isEditMode && selectedProject && (
                  <button type="button" onClick={() => setIsEditMode(true)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-full"><Edit3 size={20} /></button>
                )}
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <input type="hidden" name="id" value={selectedProject?.id} />
              <input name="name" defaultValue={selectedProject?.name} placeholder="Project Name" className="w-full text-xl font-bold border-b-2 border-slate-100 focus:border-blue-500 outline-none pb-2" required />
              <textarea name="description" defaultValue={selectedProject?.description} placeholder="Describe the mission..." className="w-full bg-slate-50 rounded-2xl p-4 text-sm outline-none" rows={3} />
              <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3">
                <LinkIcon size={16} className="text-slate-400" />
                <input name="drive_url" defaultValue={selectedProject?.drive_url} placeholder="Google Drive URL" className="bg-transparent w-full text-xs font-bold outline-none" />
              </div>

              {/* Member Picker */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block flex items-center gap-2"><UserPlus size={14}/> Assign Team Members</label>
                <div className="flex flex-wrap gap-2">
                  {allUsers.map(user => (
                    <button key={user.id} type="button" onClick={() => toggleMember(user.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedMemberIds.includes(user.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Section (Only for New Projects in this MVP) */}
              {!isEditMode && !selectedProject && (
                <div className="border-t pt-6">
                   <div className="flex justify-between items-center mb-4">
                     <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><ListTodo size={14}/> Project Tasks</label>
                     <button type="button" onClick={() => setUseAI(!useAI)} className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 transition-all ${useAI ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Sparkles size={12} /> {useAI ? "AI Mode Active" : "Use AI Assist"}
                     </button>
                   </div>
                   
                   <div className="space-y-3">
                     {manualTasks.map((task, i) => (
                       <div key={i} className="flex gap-2 items-start bg-slate-50 p-3 rounded-2xl">
                         <input placeholder="Task title..." className="flex-1 bg-transparent text-sm font-bold outline-none" onChange={(e) => { const t = [...manualTasks]; t[i].title = e.target.value; setManualTasks(t); }} />
                         <select className="text-[10px] font-black bg-white border rounded-lg px-2 py-1" onChange={(e) => { const t = [...manualTasks]; t[i].priority = e.target.value; setManualTasks(t); }}>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="LOW">LOW</option>
                         </select>
                       </div>
                     ))}
                     <button type="button" onClick={() => setManualTasks([...manualTasks, { title: "", priority: "MEDIUM" }])} className="text-xs font-black text-blue-600 flex items-center gap-1"><Plus size={14} /> Add Task</button>
                   </div>
                </div>
              )}

              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-3xl font-black shadow-xl hover:bg-blue-700 transition-all mt-6">
                {isEditMode ? "Save Changes" : "Launch Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}