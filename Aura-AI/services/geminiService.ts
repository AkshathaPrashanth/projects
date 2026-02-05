
import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { Message, KnowledgeItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAuraResponse = async (
  prompt: string,
  history: Message[],
  knowledgeBase: KnowledgeItem[],
  currentAttachments?: Message['attachments']
) => {
  const model = 'gemini-3-flash-preview';
  
  // Format history for context
  const chatHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [
      { text: msg.content },
      ...(msg.attachments || []).map(att => {
        if (att.isImage) {
          return {
            inlineData: {
              mimeType: att.type,
              data: att.data
            }
          };
        }
        return { text: `[Attached File: ${att.name}]\nContent: ${att.data}` };
      })
    ]
  }));

  const knowledgeContext = knowledgeBase.length > 0 
    ? "\nAccessing Neural Knowledge Base:\n" + 
      knowledgeBase.map(item => `[${item.title}]: ${item.content}`).join("\n---\n")
    : "\nNeural Knowledge Base is empty.";

  const systemInstruction = `You are Aura AI, a highly advanced synthetic intelligence. 
Your tone is sleek, insightful, and precise. You represent the cutting edge of AI assistance.
You have access to a neural knowledge base context below. Cite sources when relevant.
${knowledgeContext}

When users upload files, analyze them thoroughly within the context of their request.`;

  // Prepare current parts
  const currentParts: any[] = [{ text: prompt }];
  if (currentAttachments) {
    for (const att of currentAttachments) {
      if (att.isImage) {
        currentParts.push({
          inlineData: {
            mimeType: att.type,
            data: att.data
          }
        });
      } else {
        currentParts.push({ text: `[Attached File: ${att.name}]\nContent: ${att.data}` });
      }
    }
  }

  try {
    const params: GenerateContentParameters = {
      model,
      contents: [
        ...chatHistory.slice(-10),
        { role: 'user', parts: currentParts }
      ],
      config: {
        systemInstruction,
        temperature: 0.75,
        topP: 0.9,
      },
    };

    const response = await ai.models.generateContent(params);
    return response.text;
  } catch (error) {
    console.error("Aura AI Neural Link Error:", error);
    throw new Error("Neural link disrupted. Attempting to re-establish connection...");
  }
};
