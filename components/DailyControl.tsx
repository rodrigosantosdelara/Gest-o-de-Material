import React, { useState, useEffect } from 'react';
import { MATERIALS } from '../constants';
import { DailyRecord } from '../types';
import { getRecordsByDate, initializeDay, saveDailyRecord } from '../services/storageService';
import { Save, AlertCircle, Calendar, CheckCircle } from 'lucide-react';

const DailyControl: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = () => {
    const data = getRecordsByDate(selectedDate);
    // Sort by material order defined in constants
    const sortedData = MATERIALS.map(m => data.find(r => r.materialId === m.id)).filter(Boolean) as DailyRecord[];
    setRecords(sortedData);
  };

  const handleInitDay = () => {
    const result = initializeDay(selectedDate);
    if (result.success) {
      loadData();
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdate = (id: string, field: 'stockIn' | 'initial', value: string) => {
    const numValue = parseInt(value) || 0;
    const updatedRecords = records.map((record) => {
      if (record.id === id) {
        const newRecord = { ...record, [field]: numValue };
        saveDailyRecord(newRecord);
        return newRecord;
      }
      return record;
    });
    setRecords(updatedRecords);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Controle Diário
          </h2>
          <p className="text-sm text-slate-500">Gerencie entradas e saídas por data.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto"
          />
          {records.length === 0 && (
            <button
              onClick={handleInitDay}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              Iniciar Dia
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {records.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 min-w-[150px]">Material</th>
                <th className="px-4 py-3 w-24 text-center">Inicial</th>
                <th className="px-4 py-3 w-24 text-center">Estoque (+)</th>
                <th className="px-4 py-3 w-24 text-center bg-indigo-50">Saldo</th>
                <th className="px-4 py-3 w-24 text-center">Utilizado (-)</th>
                <th className="px-4 py-3 w-24 text-center font-bold bg-slate-100">Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => {
                const materialName = MATERIALS.find(m => m.id === record.materialId)?.name || record.materialId;
                const balance = record.initial + record.stockIn;
                const final = balance - record.used;

                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 font-medium text-slate-800">{materialName}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={record.initial}
                        onChange={(e) => handleUpdate(record.id, 'initial', e.target.value)}
                        className="w-full text-center border border-slate-300 rounded px-1 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={record.stockIn}
                        onChange={(e) => handleUpdate(record.id, 'stockIn', e.target.value)}
                        className="w-full text-center border border-slate-300 rounded px-1 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2 text-center font-medium text-indigo-700 bg-indigo-50/50">
                      {balance}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-500">
                      {record.used} <span className="text-xs text-slate-400">(Auto)</span>
                    </td>
                    <td className={`px-4 py-2 text-center font-bold bg-slate-100/50 ${final < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      {final}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 bg-white rounded-lg border border-slate-200 border-dashed">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum registro para esta data.</p>
          <p className="text-sm">Selecione uma data e clique em "Iniciar Dia".</p>
        </div>
      )}
    </div>
  );
};

export default DailyControl;
