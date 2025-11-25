import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getUsers, setSession, saveUser } from '../services/storageService';
import { Box, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const users = getUsers();
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      
      if (user) {
        if (!user.active) {
          setError('Esta conta foi desativada pelo administrador.');
          return;
        }
        setSession(user);
        onLogin(user);
      } else {
        setError('Email ou senha inválidos. Tente admin@admin.com / 123');
      }
    } else {
      // Registration request
      const users = getUsers();
      if (users.find(u => u.email === formData.email)) {
        setError('Este email já está cadastrado.');
        return;
      }

      const newUser: User = {
        id: uuidv4(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: UserRole.USER,
        active: false // Needs Admin approval
      };

      saveUser(newUser);
      setError('Conta solicitada! Aguarde um administrador ativar seu acesso.');
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-8 bg-indigo-600 text-white text-center">
           <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
             <Box size={32} className="text-white" />
           </div>
           <h1 className="text-2xl font-bold">GestãoMat Pro</h1>
           <p className="text-indigo-100 text-sm mt-1">Sistema Integrado de Materiais</p>
        </div>

        <div className="p-8 pt-6">
          <div className="flex gap-4 mb-6 border-b border-slate-100 pb-2">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-2 text-sm font-medium transition-colors ${isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
            >
              Acessar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-2 text-sm font-medium transition-colors ${!isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="********"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group"
            >
              {isLogin ? 'Entrar no Sistema' : 'Solicitar Acesso'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              {isLogin ? 'Credenciais padrão: admin@admin.com / 123' : 'Sua conta precisará de aprovação do Admin.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
