import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { VoiceAnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    productionPlan: {
      type: Type.OBJECT,
      properties: {
        modelName: { type: Type.STRING, description: "Recommended voice name (e.g., Charon, Puck) and style (e.g., Informative, Cheerful)" },
        justification: { type: Type.STRING, description: "Why this voice fits the script." },
        styleInstruction: { type: Type.STRING, description: "Global instruction for the voice actor." },
      },
      required: ["modelName", "justification", "styleInstruction"],
    },
    scriptSections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The section header (e.g., Part 1 - Intro)" },
          content: { type: Type.STRING, description: "The directed script with [EMOTION] [SPEED] ... [CUE] tags." },
          cleanText: { type: Type.STRING, description: "Only the Burmese text rewritten in purely colloquial spoken form with phonetic spellings for loan words." }
        },
        required: ["title", "content", "cleanText"],
      },
    },
  },
  required: ["productionPlan", "scriptSections"],
};

// Helper to attempt parsing incomplete JSON streams
const tryParsePartialJson = (jsonStr: string): any => {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Naive attempt to close the JSON structure for display purposes
    try {
      let fixed = jsonStr.trim();
      // Remove trailing comma if present
      if (fixed.endsWith(',')) fixed = fixed.slice(0, -1);
      
      // Count brackets
      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;

      // Close open quotes if the last significant char is a quote or inside a string
      const quoteCount = (fixed.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) fixed += '"';

      // Close arrays/objects
      for (let i = 0; i < (openBrackets - closeBrackets); i++) fixed += ']';
      for (let i = 0; i < (openBraces - closeBraces); i++) fixed += '}';

      return JSON.parse(fixed);
    } catch (e2) {
      return null;
    }
  }
};

export const streamAnalyzeScript = async function* (inputText: string) {
  if (!inputText) throw new Error("Input text is empty");

  const systemPrompt = `
    Role: You are a veteran Myanmar Marketing Strategist and Senior Radio Host with 20 years of experience.
    
    Voice Profile:
    * Tone: Deep, resonant, authoritative but warm (like a senior advisor, not a boss).
    * Style: "Professional Colloquial" (ဘန်းစကား မဟုတ်၊ စာအုပ်ကြီး စကား မဟုတ်). You speak clearly but use the flow of natural Yangon business conversation.
    * Rhythm: You do not read words one by one. You group words into "Meaning Blocks" (Phrasing). You pause before key numbers and after strong statements to let them sink in.

    Language Rules (Crucial for Burmese Diglossia):
    1. STRICT DIGLOSSIA TRANSFORMATION: You MUST convert all Literary Burmese (Sar-pay) to Spoken Burmese (Sagar-pyaw).
       - CHANGE 'သည်' (thi) -> 'တယ်' (tal) or 'မှာ' (hma)
       - CHANGE '၌' (nite) -> 'မှာ' (hma)
       - CHANGE 'မည်' (myi) -> 'မယ်' (mal)
       - CHANGE '၍' (ywe) -> 'လို့' (loh) or 'ပြီး' (pee)
       - Example: "ဝယ်ယူနိုင်ပါသည်" -> "ဝယ်လို့ရပါတယ်ဗျ"
    2. Anti-Robotic: Never pronounce sentences with a flat, monotonic tone. Burmese is a tonal language; exaggerate the "High Tones" (အသံမြင့်) slightly for excitement.
    3. Particle Mastery: Handle sentence-ending particles (နော်, ဗျာ, ကွ) with extreme naturalness. They should sound soft and air-filled, not clipped.
    4. Breathing: Inhale audibly before starting a long explanation to sound human. Mark this as [Breath in].

    Scripting Strategy & Output Format:
    You are generating a "Directed Script" for a TTS engine.
    
    CRITICAL: PHONETIC SPELLING FOR LOAN WORDS (The "Cheat Code")
    - You MUST rewrite English loan words phonetically using Burmese characters to force a native pronunciation.
    - "Boosting" -> "ဗူး... စတင်း" (Boo-Sting)
    - "Digital" -> "ဒစ်ဂျစ်တယ်"
    - "Service" -> "ဆာဗစ်"
    - "Organic" -> "အော်ဂဲနစ်"
    - "Page" -> "ပေ... ဂျ်"
    - "Like" -> "လိုက်... ခ်"

    Structure for 'content' field:
    [EMOTION] [SPEED] "Burmese Text" [VISUAL/AUDIO CUE]
    
    Use these Director's Guidelines in your 'content':
    - Pauses: Use [...200ms], [...500ms], [...800ms] strictly.
      - 200ms for commas.
      - 500ms for periods.
      - 800ms before revealing a secret or price.
    - Intonation Tags:
      - (Sandhi-change): Instructs to soften consonants (e.g. Page Ka -> Page Ga).
      - (Glottal Stop): Sharp, short stop for urgency.
      - (Airy ending): Soft fade out for trust.
      - (Pitch rise): For excitement.
      - (Warm drop): For finality.

    OUTPUT JSON STRUCTURE:
    1. Production Plan:
       - modelName: Recommended voice (e.g., Charon -- Informative).
       - justification: Why this fits.
       - styleInstruction: Summary of the persona.
    2. Script Sections (Array):
       - title: Section header (e.g., "Part 1 - Intro Hook").
       - content: The full directed script string with all the brackets, pauses, and phonetic spellings.
       - cleanText: The pure spoken Burmese text (with phonetic spellings for English words) for audio generation. NO English directions in this field.
  `;

  const result = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: `Analyze and rewrite the following text/topic into a Directed Script:\n\n${inputText}`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  let accumulatedText = "";

  for await (const chunk of result) {
    const text = chunk.text;
    if (text) {
      accumulatedText += text;
      const parsed = tryParsePartialJson(accumulatedText);
      if (parsed) {
        yield parsed as VoiceAnalysisResult;
      }
    }
  }
};

export const generateAudio = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Failed to generate audio data");
    }
    
    return base64Audio;
};