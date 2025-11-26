import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeJsonData = async (jsonString: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key no encontrada. Configure process.env.API_KEY.");
  }

  const truncatedJson = jsonString.length > 30000 
    ? jsonString.substring(0, 30000) + "...(truncated)" 
    : jsonString;

  const prompt = `
    Analiza el siguiente JSON como si fueras un arquitecto de datos senior.
    Proporciona un análisis estructurado, profesional y con métricas de calidad.
    
    JSON Data:
    ${truncatedJson}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Eres un experto analista de datos. Tu objetivo es proporcionar insights valiosos sobre la estructura, contenido y calidad de los datos JSON proporcionados.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
                type: Type.STRING,
                description: "Un título corto y profesional para este dataset (ej. 'Configuración de Usuario', 'Inventario de Productos')."
            },
            summary: {
              type: Type.STRING,
              description: "Resumen ejecutivo conciso (max 2 oraciones) sobre qué contienen los datos."
            },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 puntos clave sobre patrones, anomalías, o características interesantes de los datos."
            },
            schemaDetected: {
              type: Type.STRING,
              description: "Descripción técnica del esquema (ej. 'Lista de objetos anidados con relaciones 1:N')."
            },
            complexityScore: {
                type: Type.NUMBER,
                description: "Puntuación del 1 al 10 basada en la profundidad y complejidad de la estructura."
            }
          },
          required: ["title", "summary", "keyInsights", "schemaDetected", "complexityScore"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No se recibió respuesta de la IA.");
  } catch (error) {
    console.error("Error analizando JSON:", error);
    throw error;
  }
};