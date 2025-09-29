import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const {
    challengeDescription,
    context,
    severity,
    gradeLevel,
    classSize,
    stressors,
    educatorMood,
    teachingStyle
  } = req.body;

  if (!challengeDescription || !context || !severity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = generateClassroomPrompt({
      challengeDescription,
      context,
      severity,
      gradeLevel,
      classSize,
      stressors,
      educatorMood,
      teachingStyle
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Lumi, an expert early childhood classroom management coach specializing in group dynamics, trauma-informed care, and social-emotional learning. You provide evidence-based strategies for managing classroom challenges.

Your responses must follow this exact 4-section format:
1. Conceptualization - Understanding the group dynamic
2. Aligned Strategy - Primary recommended approach
3. Test Option - Alternative strategy to try
4. Future-Readiness Benefit - Long-term skills being built

Use warm, supportive language that emphasizes collective regulation, choice within structure, and building classroom community. Focus on prevention and skill-building rather than control.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const aiText = completion.choices[0]?.message?.content || '';
    const parsedResponse = parseClassroomResponse(aiText);

    res.status(200).json({ aiResponse: parsedResponse });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate classroom strategy' });
  }
}

function generateClassroomPrompt(context: any): string {
  return `Please provide a classroom management strategy for this situation:

**Challenge Description:** ${context.challengeDescription}
**Context:** ${context.context.replace(/_/g, ' ')}
**Severity:** ${context.severity} (${getSeverityDescription(context.severity)})
**Grade Level:** ${context.gradeLevel || 'Preschool'}
**Class Size:** ${context.classSize || 15} children
**Educator Mood:** ${context.educatorMood || 'Not specified'}
**Teaching Style:** ${context.teachingStyle || 'Not specified'}
**Current Stressors:** ${context.stressors?.join(', ') || 'None specified'}

Please provide a warm, evidence-based response following the 4-section format. Focus on group regulation and building classroom community.`;
}

function getSeverityDescription(severity: string): string {
  const descriptions = {
    low: 'Minor disruption, class resumes quickly',
    medium: 'Learning slowed, multiple children affected',
    high: 'Classroom halted, significant distress'
  };
  return descriptions[severity as keyof typeof descriptions] || '';
}

function parseClassroomResponse(aiText: string): any {
  return {
    conceptualization: extractSection(aiText, ['conceptualization', 'understanding']),
    alignedStrategy: extractSection(aiText, ['aligned strategy', 'primary', 'recommended']),
    testOption: extractSection(aiText, ['test option', 'alternative', 'another']),
    futureReadinessBenefit: extractSection(aiText, ['future', 'benefit', 'long-term'])
  };
}

function extractSection(text: string, keywords: string[]): string {
  for (const keyword of keywords) {
    const regex = new RegExp(`\\*\\*[^:]*${keyword}[^:]*:\\*\\*\\s*([^*]+)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}