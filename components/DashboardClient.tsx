"use client";

import { useState, useEffect } from "react";
import { Folder, AlertCircle, Clock, Pause, Sparkles, BarChart2, ShieldAlert, Edit3, Trash2, Play, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import CreateProjectModal from "./CreateProjectModal";
import { deleteProject } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DashboardClient({ userName, userRole, stats, projects, allUsers }: any) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const isManager = userRole === "MANAGER";

  // タイマーロジック (社員のみ)
  useEffect(() => {
    if (isManager) return;
    const savedTime = localStorage.getItem("nexus_timer");
    if (savedTime) setSeconds(parseInt(savedTime, 10));
  }, [isManager]);

  useEffect(() => {
    if (isManager || !isTimerRunning) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        const next = prev + 1;
        localStorage.setItem("nexus_timer", next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isManager]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditProject(null); }} 
        allUsers={allUsers} 
        editProject={editProject}
      />

      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{isManager ? "Strategy" : "Ops"}</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">{isManager ? "Management Overview" : `Welcome back, ${userName.split(' ')[0]}`}</h1>
        </div>
        {isManager && (
          <button onClick={() => { setEditProject(null); setIsModalOpen(true); }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-600 transition-all">
            <Plus size={18} /> Launch Mission
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* マネージャーにはグラフ、社員にはタイマーを表示 */}
          {isManager ? (
            <div className="bg-white/40 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2 italic"><BarChart2 className="text-blue-500" /> Global Velocity</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "To Do", value: stats?.taskStats?.todo || 0, color: "#94a3b8" },
                    { name: "Active", value: stats?.taskStats?.inProgress || 0, color: "#3b82f6" },
                    { name: "Blocked", value: stats?.taskStats?.blocked || 0, color: "#ef4444" },
                    { name: "Done", value: stats?.taskStats?.done || 0, color: "#10b981" },
                  ]}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                      <Cell fill="#94a3b8"/><Cell fill="#3b82f6"/><Cell fill="#ef4444"/><Cell fill="#10b981"/>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Active Focus Session</div>
                <div className="text-7xl font-mono font-light tracking-tighter mb-8">{formatTime(seconds)}</div>
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="px-8 py-3 bg-blue-600 rounded-xl font-black text-sm flex items-center gap-2">
                  {isTimerRunning ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />} {isTimerRunning ? 'Pause' : 'Start'}
                </button>
              </div>
            </div>
          )}

          {/* プロジェクトリスト表示部分 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj: any) => (
              <div key={proj.id} className="group relative bg-white/40 backdrop-blur-xl border border-white p-6 rounded-[32px] hover:shadow-xl transition-all h-[280px] flex flex-col justify-between overflow-hidden">
                {/* 編集・削除ボタン (タイル内) */}
                {isManager && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  
                  <button onClick={() => { setEditProject(proj); setIsModalOpen(true); }} className="p-2 bg-white text-blue-600 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16}/></button>
                  <button onClick={async () => { if(confirm("Terminate?")) { await deleteProject(proj.id); router.refresh(); }}} className="p-2 bg-white text-red-500 rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                </div>
                )}
                <div>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-fit mb-4"><Folder size={20} /></div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{proj.name}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase mt-1">Made by {proj.manager?.name || "Admin"}</p>
                </div>

                <div className="flex -space-x-2">
                  {proj.members?.slice(0, 3).map((m: any) => (
                    <img key={m.id} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title={m.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右サイドのアクティビティフィード (現状ダミー) */}
        <div className="lg:col-span-4 h-full">
           <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[40px] h-[600px] flex flex-col p-8 shadow-sm">
             <h3 className="text-lg font-black text-slate-800 mb-6 italic">Intelligence Feed</h3>
             <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
               <AlertCircle size={40} className="mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">No Recent Activity</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}