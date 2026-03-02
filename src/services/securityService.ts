import { GoogleGenAI } from "@google/genai";

export async function analyzeThreat(content: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    You are a world-class cybersecurity expert. 
    Analyze the following content (which could be code, logs, or a description of a file) for potential security threats, malware patterns, or vulnerabilities.
    
    Content to analyze:
    ---
    ${content}
    ---
    
    Provide a structured response in Markdown format with:
    1. Threat Level (Low, Medium, High, Critical)
    2. Summary of Findings
    3. Specific Vulnerabilities/Risks identified
    4. Recommended Actions
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing threat:", error);
    return "Failed to analyze threat. Please try again.";
  }
}
