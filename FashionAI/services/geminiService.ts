
import { GoogleGenAI } from "@google/genai";
import { PatternHistoryItem, Color } from "../types";
import { extractPalette } from "../utils/colorUtils";

const normalizeImage = async (url: string): Promise<{ data: string, mimeType: string }> => {
  try {
    if (url.startsWith('data:')) {
      const [header, data] = url.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      return { data, mimeType };
    }

    const response = await fetch(url, { mode: 'cors' }).catch(() => {
      throw new Error("Resource blocked by CORS or network failure.");
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1024;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height *= maxDim / width; width = maxDim; }
          else { width *= maxDim / height; height = maxDim; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(objectUrl); return reject(new Error("Canvas failure")); }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        URL.revokeObjectURL(objectUrl);
        resolve({ data: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image processing failed")); };
      img.src = objectUrl;
    });
  } catch (err: any) {
    throw new Error(`Visual Anchor Error: ${err.message}`);
  }
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key configuration missing.");
  return new GoogleGenAI({ apiKey });
};

export const generateSeamlessPattern = async (
  prompt: string,
  referenceImageUrl?: string,
  lockedColors?: string[]
): Promise<PatternHistoryItem> => {
  const ai = getAI();
  let primaryImageUrl = '';
  const colorConstraint = lockedColors?.length ? `. Use palette: ${lockedColors.join(', ')}.` : '';

  if (referenceImageUrl) {
    try {
      const normalized = await normalizeImage(referenceImageUrl);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: normalized.data, mimeType: normalized.mimeType } },
            { text: `Professional SEAMLESS repeat textile pattern tile: "${prompt}"${colorConstraint}. High fidelity.` }
          ]
        }
      });
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) { 
          primaryImageUrl = `data:image/png;base64,${part.inlineData.data}`; 
          break; 
        }
      }
    } catch (e) {
      console.warn("Reference-based generation failed, falling back to text-only.", e);
    }
  }

  if (!primaryImageUrl) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Professional high-quality seamless repeat textile pattern tile: ${prompt}${colorConstraint}. Flat lay motif.` }] },
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) { 
        primaryImageUrl = `data:image/png;base64,${part.inlineData.data}`; 
        break; 
      }
    }
  }

  if (!primaryImageUrl) throw new Error("Failed to generate pattern. Please check your prompt and try again.");

  const rawPalette = await extractPalette(primaryImageUrl);
  return { 
    id: crypto.randomUUID(), 
    imageUrl: primaryImageUrl, 
    prompt, 
    timestamp: Date.now(), 
    palette: rawPalette 
  };
};

export const generateFullGarmentMockup = async (patternImageUrl: string): Promise<string> => {
  try {
    const ai = getAI();
    const patternBase64 = patternImageUrl.split(',')[1];
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: patternBase64 } },
          { text: `Fashion design mockup: FRONT and BACK views of a high-end luxury t-shirt covered in this pattern. Neutral studio background.` }
        ]
      }
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return "";
  } catch (e) { 
    return ""; 
  }
};

export const applyPatternToImage = async (patternImageUrl: string, referenceImageUrl: string): Promise<string> => {
  try {
    const ai = getAI();
    const patternBase64 = patternImageUrl.split(',')[1];
    const normalizedRef = await normalizeImage(referenceImageUrl);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: normalizedRef.mimeType, data: normalizedRef.data } },
          { inlineData: { mimeType: 'image/png', data: patternBase64 } },
          { text: `Re-texture the garment in image 1 using pattern in image 2. Maintain creases and lighting.` }
        ]
      }
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return "";
  } catch (e) { 
    return ""; 
  }
};

export const visualizePatternOnProduct = async (patternImageUrl: string, productPrompt: string): Promise<string> => {
  const ai = getAI();
  const base64Data = patternImageUrl.split(',')[1];
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Data } },
        { text: `Professional product shot of ${productPrompt} crafted from this textile pattern.` }
      ]
    }
  });
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Visualization failed.");
};
