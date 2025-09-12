import React from 'react';
import { LogOut, Droplets, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleIcon = (role: string) => {
    return role === 'higher_official' ? (
      <ShieldCheck className="w-4 h-4 text-indigo-400" />
    ) : (
      <Shield className="w-4 h-4 text-emerald-400" />
    );
  };

  const getRoleLabel = (role: string) => {
    return role === 'higher_official' ? 'Higher Official' : 'Lower Official';
  };

  return (
    <header className="bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">AquaSafe</h1>
              <p className="text-sm text-slate-300">Water Quality Analysis Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800/70 border border-slate-700 px-3 py-2 rounded-lg shadow-sm">
              {getRoleIcon(user?.role || '')}
              <div className="text-sm">
                <div className="font-medium text-slate-100">{user?.name}</div>
                <div className="text-slate-300">{getRoleLabel(user?.role || '')}</div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;