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
    behaviorDescription,
    context,
    timeOfDay,
    severity,
    ageGroup,
    stressors,
    educatorMood,
    teachingStyle,
    learningStyle,
    child
  } = req.body;

  if (!behaviorDescription || !context || !severity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = generateChildBehaviorPrompt({
      behaviorDescription,
      context,
      timeOfDay,
      severity,
      ageGroup,
      stressors,
      educatorMood,
      teachingStyle,
      learningStyle,
      child
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Lumi, an expert early childhood behavior coach specializing in attachment theory, trauma-informed care, and developmental neuroscience. You provide warm, evidence-based strategies for educators working with young children.

Your responses must follow this exact 8-section format:
1. Warm Acknowledgment
2. Observed Behavior
3. Context/Trigger
4. Conceptualization
5. Core Needs & Development
6. Attachment Support
7. Practical Strategies (3-5 specific strategies)
8. Implementation Guidance
9. Why These Strategies Work
10. Future-Readiness Benefit
11. Family Script (optional)

Use warm, non-judgmental language that assumes positive intent. Frame behaviors as communication of needs, not defiance. Emphasize connection before direction and skill-building over compliance.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiText = completion.choices[0]?.message?.content || '';
    const parsedResponse = parseAIResponse(aiText);

    res.status(200).json({ aiResponse: parsedResponse });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate strategy' });
  }
}

function generateChildBehaviorPrompt(context: any): string {
  const childInfo = context.child ? `Child: ${context.child.name}, Age: ${context.child.age || 'unknown'}, Grade: ${context.child.gradeBand}` : '';
  const supportInfo = context.child?.hasIEP || context.child?.hasIFSP ? 
    `Support Plans: ${context.child.hasIEP ? 'IEP' : ''} ${context.child.hasIFSP ? 'IFSP' : ''}`.trim() : '';

  return `Please provide a comprehensive behavior strategy for this situation:

**Behavior Description:** ${context.behaviorDescription}
**Context:** ${context.context.replace(/_/g, ' ')}
**Time of Day:** ${context.timeOfDay || 'Not specified'}
**Severity:** ${context.severity} (${getSeverityDescription(context.severity)})
**Educator Mood:** ${context.educatorMood || 'Not specified'}
**Age Group:** ${context.ageGroup || 'Preschool'}
**Teaching Style:** ${context.teachingStyle || 'Not specified'}
**Learning Style:** ${context.learningStyle || 'Not specified'}
${childInfo}
${supportInfo}
**Current Stressors:** ${context.stressors?.join(', ') || 'None specified'}

Please provide a warm, evidence-based response following the 11-section format. Focus on connection-first approaches and developmental understanding.`;
}

function getSeverityDescription(severity: string): string {
  const descriptions = {
    low: 'Minor disruption, easily managed',
    medium: 'Moderate challenge, required attention',
    high: 'Significant disruption, immediate intervention needed'
  };
  return descriptions[severity as keyof typeof descriptions] || '';
}

function parseAIResponse(aiText: string): any {
  // Parse the AI response into structured format
  const sections = aiText.split(/\*\*\d+\.\s*|\*\*[A-Z][^:]*:\*\*/).filter(s => s.trim());
  
  return {
    warmAcknowledgment: extractSection(aiText, ['warm acknowledgment', 'acknowledgment']),
    observedBehavior: extractSection(aiText, ['observed behavior', 'behavior']),
    contextTrigger: extractSection(aiText, ['context', 'trigger']),
    conceptualization: extractSection(aiText, ['conceptualization', 'understanding']),
    coreNeedsAndDevelopment: extractSection(aiText, ['core needs', 'development']),
    attachmentSupport: extractSection(aiText, ['attachment', 'connection', 'support']),
    practicalStrategies: extractStrategies(aiText),
    implementationGuidance: extractSection(aiText, ['implementation', 'how to use']),
    whyStrategiesWork: extractSection(aiText, ['why', 'work']),
    futureReadinessBenefit: extractSection(aiText, ['future', 'benefit', 'long-term']),
    familyScript: extractSection(aiText, ['family script', 'family communication'])
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

function extractStrategies(text: string): string[] {
  const strategiesSection = extractSection(text, ['practical strategies', 'strategies']);
  if (!strategiesSection) return [];
  
  // Extract bullet points or numbered items
  const strategies = strategiesSection
    .split(/[•\-\d+\.]/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 5);
    
  return strategies;
}