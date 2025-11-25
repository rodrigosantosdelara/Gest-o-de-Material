import React, { useState } from 'react';
import { MATERIALS } from '../constants';
import { saveOSRecord, getRecordsByDate } from '../services/storageService';
import { OSRecord } from '../types';
import { PlusCircle, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const OSRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    osNumber: '',
    date: new Date().toISOString().split('T')[0],
    materialId: MATERIALS[0].id,
    quantity: 1,
    isRequired: true,
  });

  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.osNumber.trim()) {
      setStatus({ type: 'error', text: 'Número da OS é obrigatório.' });
      return;
    }
    if (formData.quantity <= 0) {
      setStatus({ type: 'error', text: 'Quantidade deve ser maior que zero.' });
      return;
    }

    // Check if day exists in Daily Control
    const dayRecords = getRecordsByDate(formData.date);
    if (dayRecords.length === 0) {
      setStatus({ 
        type: 'warning', 
        text: `ATENÇÃO: A data ${formData.date} não foi iniciada no Controle Diário. O registro foi salvo, mas não atualizou o saldo do dia ainda.` 
      });
      // We still save the OS record
    } else {
      setStatus({ type: 'success', text: 'OS Registrada com sucesso!' });
    }

    const newOS: OSRecord = {
      id: uuidv4(),
      osNumber: formData.osNumber,
      date: formData.date,
      materialId: formData.materialId,
      quantity: Number(formData.quantity),
      isRequired: formData.isRequired,
      createdAt: Date.now(),
    };

    saveOSRecord(newOS);

    // Reset form partially
    setFormData(prev => ({ ...prev, osNumber: '', quantity: 1 }));

    // Clear message
    if (dayRecords.length > 0) {
        setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Registro de OS
        </h2>

        {status && (
          <div className={`mb-6 p-4 rounded-md flex items-start gap-3 ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
            status.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
            'bg-red-50 text-red-700 border-red-200'
          }`}>
            {status.type === 'success' && <CheckCircle className="mt-0.5" size={18} />}
            {status.type === 'warning' && <AlertTriangle className="mt-0.5" size={18} />}
            {status.type === 'error' && <AlertTriangle className="mt-0.5" size={18} />}
            <span className="text-sm font-medium">{status.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número da OS</label>
              <input
                type="text"
                required
                value={formData.osNumber}
                onChange={e => setFormData({...formData, osNumber: e.target.value})}
                placeholder="Ex: 123456"
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Material</label>
            <select
              value={formData.materialId}
              onChange={e => setFormData({...formData, materialId: e.target.value})}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {MATERIALS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center h-full pt-6">
               <label className="flex items-center cursor-pointer select-none">
                 <input
                   type="checkbox"
                   checked={formData.isRequired}
                   onChange={e => setFormData({...formData, isRequired: e.target.checked})}
                   className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                 />
                 <span className="ml-2 text-sm text-slate-700">OS Requerida?</span>
               </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              Registrar Uso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OSRegistration;
