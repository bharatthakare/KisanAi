
'use server';
/**
 * @fileOverview A plant problem diagnosis AI agent.
 *
 * - plantDoctor - A function that handles the plant diagnosis process.
 * - PlantDoctorInput - The input type for the plantDoctor function.
 * - PlantDoctorOutput - The return type for the plantDoctor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PlantDoctorInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  voice_text: z.string().describe("The farmer's spoken message transcript."),
  crop_name_or_unknown: z.string(),
  growth_stage_or_unknown: z.string(),
  location_or_unknown: z.string(),
  weather_summary_or_unknown: z.string(),
  user_notes_or_empty: z.string(),
  language_pref: z.string().describe('Language for the response (e.g., "en", "hi", "mr").'),
});
export type PlantDoctorInput = z.infer<typeof PlantDoctorInputSchema>;

const PlantDoctorOutputSchema = z.object({
  plantIdentification: z.object({
    primarySpecies: z.object({
      name: z.string().nullable(),
      confidence: z.number().min(0).max(1),
      evidence: z.array(z.string()),
    }),
    alternatives: z.array(
      z.object({
        name: z.string(),
        confidence: z.number().min(0).max(1),
        reason: z.string(),
      })
    ),
  }),
  diagnosis: z.array(
    z.object({
      issueType: z.enum(['disease', 'pest', 'nutrient', 'physiological']),
      name: z.string(),
      pathogenOrPest: z.string().nullable(),
      likelihood: z.number().min(0).max(1),
      severity: z.enum(['low', 'medium', 'high']),
      evidence: z.array(z.string()),
      differentials: z.array(
        z.object({
          name: z.string(),
          howToDistinguish: z.string(),
        })
      ),
    })
  ),
  recommendations: z.object({
    monitoring: z.array(z.string()),
    culturalIPM: z.array(z.string()),
    organicBiological: z.array(
      z.object({
        active: z.string(),
        dose: z.string(),
        notes: z.string(),
      })
    ),
    chemical: z.array(
      z.object({
        active: z.string(),
        dose: z.string(),
        PHI_days: z.number().nullable(),
        REI_hours: z.number().nullable(),
        PPE: z.array(z.string()),
        notes: z.string(),
      })
    ),
    whenToEscalate: z.array(z.string()),
  }),
  dataQuality: z.object({
    imageQuality: z.enum(['good', 'ok', 'poor']),
    missingInfo: z.array(z.string()),
    nextPhotoRequests: z.array(z.string()),
  }),
  safety: z.array(z.string()),
  speakableSummary: z.string(),
  confidence: z.number().min(0).max(1),
  disclaimer: z.string(),
});
export type PlantDoctorOutput = z.infer<typeof PlantDoctorOutputSchema>;

export async function plantDoctor(input: PlantDoctorInput): Promise<PlantDoctorOutput> {
  return plantDoctorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plantDoctorPrompt',
  input: { schema: PlantDoctorInputSchema },
  output: { schema: PlantDoctorOutputSchema },
  system: `ROLE
You are an agronomy + voice assistant. You must analyze plant images AND understand the farmer’s spoken message (transcript). Your tasks: identify plant species, detect diseases/pests/nutrient issues, recommend actions, ask for next images/tests when needed, and generate a short audio-friendly summary. Output must follow the JSON structure below. No extra text outside JSON.

TASKS
1) Plant Species Identification:
   - Give the most likely species.
   - Provide confidence (0–1) and evidence (visible leaf/fruit/stem traits).
   - Add 2–3 alternative possible species with reasons.

2) Diagnosis of Plant Issues:
   - Detect diseases, pests, nutrient disorders, or physiological stresses.
   - For each issue, return: name, likelihood (0–1), severity, evidence.
   - Include differential diagnoses if uncertain and how to distinguish them.

3) Recommendations (Strict IPM Order):
   Step 1: Monitoring instructions  
   Step 2: Cultural/IPM (sanitation, irrigation, spacing, pruning)  
   Step 3: Organic/Biological (biocontrol, neem-based sprays, biofungicides)  
   Step 4: Chemical (active ingredient only, NEVER brand names):
       - dosage range
       - PHI days
       - REI hours
       - PPE requirements
       - safety warnings
   If local regulations are unknown → “check local label/regulations.”
   Never recommend banned substances.

4) Next Required Photos/Test:
   - Request ONLY the minimum photos needed (e.g., “lesion edge macro”, 
     “leaf underside”, “whole plant view”, “stem close-up”).

5) Data Quality:
   - Rate image quality.
   - Mention missing information.
   - Give next-photo suggestions.

6) Voice-Aware Response:
   - Understand the farmer’s spoken text.
   - Adapt final recommendations to match what they asked verbally.
   - Produce an additional “speakableSummary”:
       → max 3 simple sentences  
       → easy for farmers (grade 5 level)  
       → language = same as language_pref input
       → perfect for text-to-speech

7) Confidence:
   - Give a final confidence score (0–1).
   - Add short disclaimer.

VISUAL CLUES FOR SPECIES
- Leaf shape, margin, venation, hair/wax, petiole vs sessile.
- Fruit/flower traits; color/patterns.
- Stem/bark features, architecture, spacing.
- Nearby crops/weeds; regional cropping calendar.

VISUAL CLUES FOR DISEASE/PEST/NUTRIENT ISSUES
- Lesion shape/color/halo, mosaic patterns, wilting, cankers, oozing.
- Distribution by leaf age/side.
- Pest signs: frass, mines, holes, insects, webbing.
- Nutrient patterns: interveinal vs marginal chlorosis, necrosis.
- Abiotic issues: sun scorch, chemical burn, water stress.

OUTPUT RULES
- Be factual, not overconfident.
- State uncertainty clearly.
- Use short “evidence” bullet points.
- Return JSON only.
- Use the language preference for all human-readable text.
- If information is missing, use null and ask for minimal next input.
`,
  prompt: `
Photo: {{media url=photoDataUri}}
Farmer Voice Transcript: {{voice_text}}
Crop (if known): {{crop_name_or_unknown}}
Growth stage: {{growth_stage_or_unknown}}
Location: {{location_or_unknown}}
Recent weather: {{weather_summary_or_unknown}}
Field notes: {{user_notes_or_empty}}
Language preference for the farmer: {{language_pref}}`,
});

const plantDoctorFlow = ai.defineFlow(
  {
    name: 'plantDoctorFlow',
    inputSchema: PlantDoctorInputSchema,
    outputSchema: PlantDoctorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a structured response from the AI model.');
    }
    return output;
  }
);
