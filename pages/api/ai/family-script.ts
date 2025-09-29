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
    child,
    behaviorLog,
    parentName,
    language,
    additionalNotes
  } = req.body;

  if (!child || !behaviorLog) {
    return res.status(400).json({ error: 'Child and behavior log data required' });
  }

  try {
    const prompt = generateFamilyScriptPrompt({
      child,
      behaviorLog,
      parentName: parentName || '[Parent Name]',
      language: language || 'english',
      additionalNotes,
      teacherName: user.fullName
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Lumi, an expert in family communication for early childhood educators. You create comprehensive, warm family communication scripts that explain child behavior in developmental terms and provide actionable home strategies.

Your family scripts must follow this exact 8-point format:
1. Context/Trigger - What happened and when
2. Understanding What's Happening - Developmental explanation
3. Core Needs & Developmental Stage - What the child needs
4. Connection & Support - How we're supporting the child
5. Practical Strategies - Specific approaches being used
6. How to Use These Strategies - Implementation guidance
7. Why These Strategies Work - Evidence-based explanation
8. Long-term Benefits - Future-readiness skills

${language === 'spanish' ? 'Write the entire script in Spanish with culturally appropriate language.' : 'Write in warm, accessible English that honors diverse family backgrounds.'}

Use strength-based language that assumes positive intent from both child and family. Avoid deficit-based framing.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const familyScript = completion.choices[0]?.message?.content || '';

    res.status(200).json({ familyScript });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate family script' });
  }
}

function generateFamilyScriptPrompt(context: any): string {
  const childName = context.child.name;
  const parentName = context.parentName;
  const behaviorContext = context.behaviorLog.context.replace(/_/g, ' ');
  const behavior = context.behaviorLog.behaviorDescription;
  const severity = context.behaviorLog.severity;
  const teacherName = context.teacherName;

  return `Please create a comprehensive family communication script for this situation:

**Child:** ${childName} (${context.child.gradeBand})
**Parent/Family:** ${parentName}
**Teacher:** ${teacherName}
**Behavior:** ${behavior}
**Context:** ${behaviorContext}
**Severity:** ${severity}
**Support Plans:** ${context.child.hasIEP ? 'IEP' : ''} ${context.child.hasIFSP ? 'IFSP' : ''}
**Language:** ${context.language}
${context.additionalNotes ? `**Additional Notes:** ${context.additionalNotes}` : ''}

Create a warm, comprehensive family communication that:
- Explains the behavior in developmental terms
- Shares what we're doing at school to support the child
- Offers specific strategies families can try at home
- Builds partnership between home and school
- Uses strength-based, non-judgmental language

Follow the 8-point format exactly and make it feel personal and supportive.`;
}