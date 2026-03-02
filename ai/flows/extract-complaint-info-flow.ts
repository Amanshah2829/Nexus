'use server';
/**
 * @fileOverview An AI flow for extracting structured complaint information from unstructured text.
 *
 * - extractComplaintInfo - A function that handles the extraction process.
 * - ExtractComplaintInfoInput - The input type for the extractComplaintInfo function.
 * - ExtractComplaintInfoOutput - The return type for the extractComplaintInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExtractComplaintInfoInputSchema = z.object({
  emailBody: z.string().describe('The full text content of the email reply.'),
});
export type ExtractComplaintInfoInput = z.infer<typeof ExtractComplaintInfoInputSchema>;

const ExtractComplaintInfoOutputSchema = z.object({
  building: z.string().optional().describe('The building or hostel name mentioned. e.g., "Boys Hostel", "Girls Hostel", "Academic Block A".'),
  room: z.string().optional().describe('The room number, including any floor information. e.g., "FF-50", "GF37", "TF 335".'),
  phone: z.string().optional().describe('The contact phone number.'),
});
export type ExtractComplaintInfoOutput = z.infer<typeof ExtractComplaintInfoOutputSchema>;

export async function extractComplaintInfo(input: ExtractComplaintInfoInput): Promise<ExtractComplaintInfoOutput> {
  return extractComplaintInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractComplaintInfoPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: ExtractComplaintInfoInputSchema},
  output: {schema: ExtractComplaintInfoOutputSchema},
  prompt: `You are an expert at extracting structured information from unstructured text.
From the email body provided below, extract the following information:
- The building or hostel name.
- The room number. This may include floor prefixes like FF (First Floor), GF (Ground Floor), TF (Third Floor).
- The user's contact phone number.

If any piece of information is not present, leave the corresponding field empty.

Email Body:
{{{emailBody}}}
`,
});

const extractComplaintInfoFlow = ai.defineFlow(
  {
    name: 'extractComplaintInfoFlow',
    inputSchema: ExtractComplaintInfoInputSchema,
    outputSchema: ExtractComplaintInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
