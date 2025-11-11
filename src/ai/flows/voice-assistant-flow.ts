'use server';
/**
 * @fileOverview AI farming assistant that responds to voice queries.
 *
 * - voiceAssistantFlow - A function that takes a user query and current weather conditions,
 *   and returns spoken farming advice.
 * - VoiceAssistantInput - The input type for the voiceAssistantFlow function.
 * - VoiceAssistantOutput - The return type for the voiceAssistantFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const VoiceAssistantInputSchema = z.object({
  query: z.string().describe('The user query about farming advice.'),
  weather: z.string().describe('The current weather conditions.'),
  language: z.enum(['en', 'hi', 'mr', 'ta', 'te', 'kn', 'bn', 'pa', 'gu']).describe('The language to respond in.'),
});
export type VoiceAssistantInput = z.infer<typeof VoiceAssistantInputSchema>;

const VoiceAssistantOutputSchema = z.object({
  advice: z.string().describe('The spoken farming advice.'),
  audio: z.string().describe('The audio data of the spoken advice in WAV format as a data URI.'),
});
export type VoiceAssistantOutput = z.infer<typeof VoiceAssistantOutputSchema>;

export async function voiceAssistant(input: VoiceAssistantInput): Promise<VoiceAssistantOutput> {
  return voiceAssistantFlow(input);
}

const advicePrompt = ai.definePrompt({
  name: 'voiceAdvicePrompt',
  input: { schema: VoiceAssistantInputSchema },
  system: `You are KisanAI, an expert farming assistant. Your goal is to provide short, actionable farming advice.
Respond in the language specified by the user.`,
  prompt: `Based on the user’s question and current weather, provide your advice.

User's Question: {{{query}}}
Current Weather: {{{weather}}}
Language: {{{language}}}`,
});

const voiceAssistantFlow = ai.defineFlow(
  {
    name: 'voiceAssistantFlow',
    inputSchema: VoiceAssistantInputSchema,
    outputSchema: VoiceAssistantOutputSchema,
  },
  async input => {
    const { text } = await advicePrompt(input);

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No media returned from TTS.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const audio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      advice: text,
      audio: audio,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
