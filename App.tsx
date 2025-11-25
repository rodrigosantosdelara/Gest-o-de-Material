import React, { useState, useEffect } from 'react';
import { getSession, clearSession } from './services/storageService';
import { User, UserRole } from './types';
import Login from './components/Login';
import DailyControl from './components/DailyControl';
import OSRegistration from './components/OSRegistration';
import WeeklyReport from './components/WeeklyReport';
import AdminPanel from './components/AdminPanel';
import { Box, LogOut, LayoutDashboard, FileText, BarChart3, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setActiveTab(1);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const menuItems = [
    { id: 1, label: 'Controle Diário', icon: LayoutDashboard, role: null }, // Null role means everyone
    { id: 2, label: 'Registro de OS', icon: FileText, role: null },
    { id: 3, label: 'Relatórios', icon: BarChart3, role: null },
    { id: 4, label: 'Administração', icon: Shield, role: UserRole.ADMIN },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center shadow-lg z-20 sticky top-0">
         <div className="flex items-center gap-2 font-bold">
           <Box size={20} />
           <span>GestãoMat</span>
         </div>
         <button onClick={handleLogout} className="p-1 hover:bg-white/10 rounded">
           <LogOut size={20} />
         </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 shadow-xl z-10">
        <div className="p-6 bg-indigo-600 text-white">
          <div className="flex items-center gap-3 font-bold text-xl">
            <Box size={28} />
            <span>GestãoMat</span>
          </div>
          <div className="mt-4 text-xs font-medium bg-indigo-700/50 p-2 rounded border border-indigo-500/30">
            <p className="text-indigo-100">Olá, {user.name.split(' ')[0]}</p>
            <p className="opacity-75 capitalize text-[10px] mt-0.5">{user.role}</p>
          </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            if (item.role && user.role !== item.role) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sair do Sistema
          </button>
        </div>
      </nav>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20 safe-area-bottom">
         {menuItems.map((item) => {
            if (item.role && user.role !== item.role) return null;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                <Icon size={20} className="mb-1" />
                {item.label.split(' ')[0]}
              </button>
            )
         })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0 max-w-[100vw] overflow-x-hidden">
        <header className="mb-8 hidden md:block">
           <h1 className="text-2xl font-bold text-slate-800">
             {menuItems.find(i => i.id === activeTab)?.label}
           </h1>
           <p className="text-slate-500 text-sm mt-1">
             Gerencie seus recursos com eficiência.
           </p>
        </header>

        <div className="fade-in-up">
          {activeTab === 1 && <DailyControl />}
          {activeTab === 2 && <OSRegistration />}
          {activeTab === 3 && <WeeklyReport />}
          {activeTab === 4 && user.role === UserRole.ADMIN && <AdminPanel />}
        </div>
      </main>
    </div>
  );
};

export default App;
