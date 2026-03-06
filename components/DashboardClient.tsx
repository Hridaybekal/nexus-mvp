"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folder, AlertCircle, CheckCircle, Clock, Pause, Sparkles, BarChart2, ShieldAlert, Link as LinkIcon, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import CreateProjectModal from "./CreateProjectModal";



export default function DashboardClient({ userName, userRole, stats, projects }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isManager = userRole === "MANAGER";
  const activeProject = projects[0]; // The most recent project

  // Timer Logic
  useEffect(() => {
    const savedTime = localStorage.getItem("nexus_timer");
    const savedState = localStorage.getItem("nexus_timer_running");
    if (savedTime) setSeconds(parseInt(savedTime, 10));
    if (savedState === "true") setIsTimerRunning(true);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && isLoaded) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newTime = prev + 1;
          localStorage.setItem("nexus_timer", newTime.toString());
          return newTime;
        });
      }, 1000);
      localStorage.setItem("nexus_timer_running", "true");
    } else if (isLoaded) {
      localStorage.setItem("nexus_timer_running", "false");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isLoaded]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* 3. Add the Modal component at the bottom of the JSX */}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="flex justify-between items-end mb-10">
        <div>{/* Title logic */}</div>
        
        {/* 4. Update the Button to open the modal */}
        {isManager && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Plus size={18} strokeWidth={3} /> Launch New Project
          </button>
        )}
      </div>
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-sm font-black text-blue-600/80 uppercase tracking-widest mb-1">
            {isManager ? "Command Center" : "Workspace"}
          </p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {isManager ? "Manager Overview" : `Welcome back, ${userName.split(' ')[0]}`}
          </h1>
        </div>
        <Link href={isManager ? "/nippo" : "/tasks"} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center gap-2">
          {isManager ? <><Sparkles size={18} /> AI Report</> : "View My Tasks"}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {isManager ? (
            // MANAGER CHART
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[32px] shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><BarChart2 /> Task Distribution</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "To Do", value: stats.taskStats.todo, color: "#f97316" },
                    { name: "In Progress", value: stats.taskStats.inProgress, color: "#3b82f6" },
                    { name: "Blocked", value: stats.taskStats.blocked, color: "#ef4444" },
                    { name: "Done", value: stats.taskStats.done, color: "#10b981" },
                  ]}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      <Cell fill="#f97316"/><Cell fill="#3b82f6"/><Cell fill="#ef4444"/><Cell fill="#10b981"/>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            // EMPLOYEE TIMER & ACTIVE PROJECT
            <>
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[40px] p-10 text-white shadow-2xl border border-white/20">
                <div className="text-7xl font-mono font-light tracking-widest mb-8">{formatTime(seconds)}</div>
                <div className="flex gap-4">
                  <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="px-8 py-3 bg-white/10 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-white/20 transition-all">
                    <Pause size={18} fill="currentColor" /> {isTimerRunning ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>

              {activeProject && (
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[32px] shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-slate-800">Current Assignment: {activeProject.name}</h3>
                    {activeProject.drive_url && (
                      <a href={activeProject.drive_url} target="_blank" className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline">
                        <LinkIcon size={14} /> Drive
                      </a>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{activeProject.description || "No description provided."}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="lg:col-span-4 space-y-6">
          <StatCard title={isManager ? "Active Projects" : "My Tasks"} value={isManager ? stats.projectCount : (stats.taskStats.todo + stats.taskStats.inProgress)} icon={<Folder />} />
          <StatCard title="Blocked" value={stats.taskStats.blocked} icon={<ShieldAlert />} color="text-red-500" />
        </div>
      </div>
    </div>
</div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/60 shadow-sm">
      <div className="text-blue-600 mb-4">{icon}</div>
      <p className="text-slate-500 font-bold text-xs uppercase mb-1">{title}</p>
      <h2 className={`text-5xl font-black text-slate-900 ${color}`}>{value}</h2>
    </div>
  );
}

