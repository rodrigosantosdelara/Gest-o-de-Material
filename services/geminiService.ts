import { GoogleGenAI } from "@google/genai";
import { WeeklyReportData } from "../types";

// This service is optional based on user needs, but adds the "Senior Engineer" touch
// to analyze the weekly data.

export const generateWeeklyAnalysis = async (
  startDate: string,
  endDate: string,
  data: WeeklyReportData[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "API Key não configurada. Não é possível gerar análise com IA.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare data summary for the prompt
    const dataSummary = data.map(d => 
      `- ${d.materialName}: Usado ${d.totalUsed}, Reposto ${d.totalStockIn}, Saldo Final ${d.finalStock}`
    ).join('\n');

    const prompt = `
      Você é um especialista em gestão de estoque. Analise os dados abaixo referentes ao período de ${startDate} a ${endDate}.
      
      DADOS DO ESTOQUE:
      ${dataSummary}
      
      Por favor, forneça um relatório curto e profissional em texto corrido (2 parágrafos) identificando:
      1. Materiais com maior movimentação (gargalos potenciais).
      2. Alertas de estoque baixo se houver (considerando saldo final próximo de 0).
      3. Sugestão de reposição.
      
      Use formatação Markdown simples.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com o serviço de IA. Verifique sua chave de API ou conexão.";
  }
};
