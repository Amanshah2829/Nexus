'use server';
/**
 * @fileOverview An AI flow for diagnosing IT issues and suggesting troubleshooting steps.
 *
 * - diagnoseIssue - A function that handles the diagnosis process.
 * - DiagnoseIssueInput - The input type for the diagnoseIssue function.
 * - DiagnoseIssueOutput - The return type for the diagnoseIssue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DiagnoseIssueInputSchema = z.object({
  title: z.string().describe('The title of the complaint or issue.'),
  description: z.string().describe('The detailed description of the issue provided by the user.'),
});
export type DiagnoseIssueInput = z.infer<typeof DiagnoseIssueInputSchema>;

const DiagnoseIssueOutputSchema = z.object({
  probableCauses: z.array(z.string()).describe('A list of 2-3 most likely causes for the reported issue.'),
  troubleshootingSteps: z.array(z.string()).describe('A list of actionable, ordered steps an IT engineer can take to diagnose and resolve the issue.'),
});
export type DiagnoseIssueOutput = z.infer<typeof DiagnoseIssueOutputSchema>;

export async function diagnoseIssue(input: DiagnoseIssueInput): Promise<DiagnoseIssueOutput> {
  return diagnoseIssueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseIssuePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: DiagnoseIssueInputSchema},
  output: {schema: DiagnoseIssueOutputSchema},
  prompt: `You are an expert IT support engineer. Based on the complaint title and description provided, please provide a concise analysis.

Your goal is to help a field engineer quickly understand the problem and how to solve it.

Complaint Title: {{{title}}}
Complaint Description: {{{description}}}

Based on this information, provide:
1.  A list of the most probable causes.
2.  A clear, step-by-step list of troubleshooting actions the engineer should perform.
`,
});

const diagnoseIssueFlow = ai.defineFlow(
  {
    name: 'diagnoseIssueFlow',
    inputSchema: DiagnoseIssueInputSchema,
    outputSchema: DiagnoseIssueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
