import React, { useState, useEffect } from 'react';
import { MATERIALS } from '../constants';
import { getDailyRecords } from '../services/storageService';
import { WeeklyReportData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateWeeklyAnalysis } from '../services/geminiService';
import { FileDown, Sparkles, Loader2 } from 'lucide-react';

const WeeklyReport: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<WeeklyReportData[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    calculateReport();
  }, [startDate, endDate]);

  const calculateReport = () => {
    const allRecords = getDailyRecords();
    
    // Filter records within range
    const rangeRecords = allRecords.filter(r => r.date >= startDate && r.date <= endDate);
    
    // Sort records to find first and last day entries per material
    rangeRecords.sort((a, b) => a.date.localeCompare(b.date));

    const data: WeeklyReportData[] = MATERIALS.map(mat => {
      const matRecords = rangeRecords.filter(r => r.materialId === mat.id);
      
      const totalUsed = matRecords.reduce((sum, r) => sum + r.used, 0);
      const totalStockIn = matRecords.reduce((sum, r) => sum + r.stockIn, 0);
      
      const firstRecord = matRecords[0];
      const lastRecord = matRecords[matRecords.length - 1];

      return {
        materialName: mat.name,
        totalUsed,
        totalStockIn,
        initialStock: firstRecord ? firstRecord.initial : 0,
        finalStock: lastRecord ? (lastRecord.initial + lastRecord.stockIn - lastRecord.used) : 0
      };
    });

    setReportData(data);
    setAiAnalysis(''); // Reset analysis when data changes
  };

  const handleGenerateAI = async () => {
    setLoadingAi(true);
    const analysis = await generateWeeklyAnalysis(startDate, endDate, reportData);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };

  const handleExport = () => {
    // Simple CSV Export
    const headers = ['Material', 'Inicial', 'Entradas', 'Utilizado', 'Final'];
    const rows = reportData.map(d => [
      d.materialName, d.initialStock, d.totalStockIn, d.totalUsed, d.finalStock
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
           <div>
             <label className="block text-xs font-semibold text-slate-500 mb-1">De</label>
             <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
             />
           </div>
           <div>
             <label className="block text-xs font-semibold text-slate-500 mb-1">Até</label>
             <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
             />
           </div>
        </div>
        
        <div className="flex gap-2">
           <button
             onClick={handleGenerateAI}
             disabled={loadingAi}
             className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition disabled:opacity-70"
           >
             {loadingAi ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
             Análise IA
           </button>
           <button
             onClick={handleExport}
             className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition"
           >
             <FileDown size={16} />
             Exportar CSV
           </button>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg shadow-sm">
           <h3 className="text-purple-900 font-bold flex items-center gap-2 mb-3">
             <Sparkles size={18} />
             Insight Gemini
           </h3>
           <div className="prose prose-sm text-purple-900 leading-relaxed whitespace-pre-wrap">
             {aiAnalysis}
           </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-700 mb-4">Consumo x Reposição</h3>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={reportData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="materialName" hide />
                 <YAxis />
                 <Tooltip />
                 <Legend />
                 <Bar dataKey="totalUsed" name="Utilizado" fill="#ef4444" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="totalStockIn" name="Reposto" fill="#22c55e" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <p className="text-center text-xs text-slate-400 mt-2">Comparativo acumulado do período</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 overflow-y-auto max-h-[420px]">
           <h3 className="font-bold text-slate-700 mb-4">Detalhamento</h3>
           <table className="w-full text-sm">
             <thead className="bg-slate-50 sticky top-0">
               <tr>
                 <th className="px-3 py-2 text-left">Material</th>
                 <th className="px-3 py-2 text-center">Inicial</th>
                 <th className="px-3 py-2 text-center text-red-600">Saiu</th>
                 <th className="px-3 py-2 text-center text-green-600">Entrou</th>
                 <th className="px-3 py-2 text-center font-bold">Final</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {reportData.map((d, idx) => (
                 <tr key={idx}>
                   <td className="px-3 py-2">{d.materialName}</td>
                   <td className="px-3 py-2 text-center text-slate-500">{d.initialStock}</td>
                   <td className="px-3 py-2 text-center font-medium">{d.totalUsed}</td>
                   <td className="px-3 py-2 text-center font-medium">{d.totalStockIn}</td>
                   <td className={`px-3 py-2 text-center font-bold ${d.finalStock === 0 ? 'text-red-500' : 'text-slate-800'}`}>
                     {d.finalStock}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
