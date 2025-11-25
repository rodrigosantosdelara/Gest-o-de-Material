import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUser, deleteUser } from '../services/storageService';
import { Shield, UserPlus, Trash2, Edit2, RotateCcw, X, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingUser(null);
    setFormData({
      role: UserRole.USER,
      active: true,
      name: '',
      email: '',
      password: ''
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!formData.password && isCreating)) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const userToSave: User = {
      id: isCreating ? uuidv4() : editingUser!.id,
      name: formData.name!,
      email: formData.email!,
      role: formData.role || UserRole.USER,
      active: formData.active ?? true,
      // Only update password if provided
      ...(formData.password ? { password: formData.password } : (isCreating ? {} : { password: editingUser!.password }))
    } as User;

    saveUser(userToSave);
    loadUsers();
    setIsCreating(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      deleteUser(id);
      loadUsers();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Shield className="w-5 h-5 text-indigo-600" />
             Administração
           </h2>
           <p className="text-sm text-slate-500">Gerenciar acesso de usuários</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <UserPlus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="px-4 py-3">Nome / Email</th>
                 <th className="px-4 py-3">Tipo</th>
                 <th className="px-4 py-3">Status</th>
                 <th className="px-4 py-3 text-right">Ações</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {users.map(user => (
                 <tr key={user.id} className="hover:bg-slate-50">
                   <td className="px-4 py-3">
                     <div className="font-medium text-slate-900">{user.name}</div>
                     <div className="text-xs text-slate-500">{user.email}</div>
                   </td>
                   <td className="px-4 py-3">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                       {user.role}
                     </span>
                   </td>
                   <td className="px-4 py-3">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                       {user.active ? 'ATIVO' : 'INATIVO'}
                     </span>
                   </td>
                   <td className="px-4 py-3 text-right">
                     <div className="flex justify-end gap-2">
                       <button onClick={() => handleEdit(user)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                         <Edit2 size={16} />
                       </button>
                       {user.role !== UserRole.ADMIN && (
                         <button onClick={() => handleDelete(user.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                           <Trash2 size={16} />
                         </button>
                       )}
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        {/* Edit/Create Form */}
        {(isCreating || editingUser) && (
           <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-fit">
             <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
               {isCreating ? 'Criar Usuário' : 'Editar Usuário'}
             </h3>
             <form onSubmit={handleSave} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                 <input
                   type="text"
                   value={formData.name || ''}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                 <input
                   type="email"
                   value={formData.email || ''}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">
                   Senha {editingUser && '(Deixe em branco para manter)'}
                 </label>
                 <input
                   type="password"
                   value={formData.password || ''}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value={UserRole.USER}>USUÁRIO</option>
                      <option value={UserRole.ADMIN}>ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.active ? 'true' : 'false'}
                      onChange={e => setFormData({...formData, active: e.target.value === 'true'})}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Bloqueado</option>
                    </select>
                  </div>
               </div>

               <div className="flex gap-3 pt-4">
                 <button
                   type="submit"
                   className="flex-1 bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
                 >
                   Salvar
                 </button>
                 <button
                   type="button"
                   onClick={() => { setIsCreating(false); setEditingUser(null); }}
                   className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-md text-sm font-medium hover:bg-slate-200 transition"
                 >
                   Cancelar
                 </button>
               </div>
             </form>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
