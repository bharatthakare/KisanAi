'use server';
/**
 * @fileOverview AI farming assistant that speaks the advice using text-to-speech.
 *
 * - assistantSpeaksAdvice - A function that takes a user query and current weather conditions,
 *   and returns spoken farming advice.
 * - AssistantSpeaksAdviceInput - The input type for the assistantSpeaksAdvice function.
 * - AssistantSpeaksAdviceOutput - The return type for the assistantSpeaksAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const AssistantSpeaksAdviceInputSchema = z.object({
  query: z.string().describe('The user query about farming advice.'),
  weather: z.string().describe('The current weather conditions.'),
  language: z.enum(['en', 'hi', 'mr']).describe('The language to respond in.'),
});
export type AssistantSpeaksAdviceInput = z.infer<typeof AssistantSpeaksAdviceInputSchema>;

const AssistantSpeaksAdviceOutputSchema = z.object({
  advice: z.string().describe('The spoken farming advice.'),
  audio: z.string().describe('The audio data of the spoken advice in WAV format as a data URI.'),
});
export type AssistantSpeaksAdviceOutput = z.infer<typeof AssistantSpeaksAdviceOutputSchema>;

export async function assistantSpeaksAdvice(input: AssistantSpeaksAdviceInput): Promise<AssistantSpeaksAdviceOutput> {
  return assistantSpeaksAdviceFlow(input);
}

const advicePrompt = ai.definePrompt({
  name: 'advicePrompt',
  input: { schema: AssistantSpeaksAdviceInputSchema },
  prompt: `You are KisanAI. Based on the user’s question and current weather, give short, actionable farming advice in the selected language (English, Hindi, or Marathi).\n\nUser's Question: {{{query}}}\nCurrent Weather: {{{weather}}}\nLanguage: {{{language}}}`,
});

const assistantSpeaksAdviceFlow = ai.defineFlow(
  {
    name: 'assistantSpeaksAdviceFlow',
    inputSchema: AssistantSpeaksAdviceInputSchema,
    outputSchema: AssistantSpeaksAdviceOutputSchema,
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
