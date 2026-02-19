
import { GoogleGenAI, Type } from "@google/genai";
import { RoomAnalysis } from "../types";

export const analyzeRoomImage = async (base64Image: string): Promise<RoomAnalysis | null> => {
  try {
    // Obtain API Key directly from process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const base64Data = base64Image.includes('base64,') 
        ? base64Image.split('base64,')[1] 
        : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: base64Data
            }
          },
          {
            text: `Analyze this interior design image. 
            1. Identify the design style (e.g., Modern, Traditional, Minimalist, Boho, Industrial).
            2. Determine the lighting condition (Bright, Average, or Dim).
            3. Suggest the best window shade fabric tone (light, neutral, or dark) to complement the room.
            4. Suggest a specific color family (e.g., Beige, Grey, White, Charcoal).
            5. Provide a short reasoning (max 2 sentences) for the recommendation.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            lighting: { type: Type.STRING, enum: ['Bright', 'Average', 'Dim'] },
            suggestedTone: { type: Type.STRING, enum: ['light', 'neutral', 'dark'] },
            suggestedColorFamily: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ['style', 'lighting', 'suggestedTone', 'suggestedColorFamily', 'reasoning']
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as RoomAnalysis;
    }
    return null;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return null;
  }
};
