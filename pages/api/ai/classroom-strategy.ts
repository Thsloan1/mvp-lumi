import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
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
    const prompt = `You are Lumi, an expert classroom management coach. Provide strategies for this classroom challenge:

**Challenge:** ${challengeDescription}
**Context:** ${context}
**Severity:** ${severity}
**Grade:** ${gradeLevel || 'Preschool'}
**Class Size:** ${classSize || 15}
**Educator Mood:** ${educatorMood || 'Not specified'}
**Stressors:** ${stressors?.join(', ') || 'None'}

Provide a response with these sections:
1. Understanding the group dynamic
2. Primary strategy recommendation
3. Alternative approach to try
4. Long-term benefits for the classroom

Focus on group regulation and building classroom community.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Lumi, an expert classroom management coach specializing in group dynamics and social-emotional learning."
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
    
    const response = {
      conceptualization: extractSection(aiText, 'understanding') || "Group challenges often reflect the collective needs of developing children navigating social learning together.",
      alignedStrategy: extractSection(aiText, 'primary') || "Implement a 'Calm Down Together' routine: Use a visual cue to signal the whole group to take three deep breaths together.",
      testOption: extractSection(aiText, 'alternative') || "Try 'Silent Signals': Develop hand gestures for common needs to reduce verbal disruptions while giving children agency.",
      futureReadinessBenefit: extractSection(aiText, 'benefits') || "These strategies build classroom community and teach children to be aware of collective energy - critical skills for collaboration."
    };

    res.status(200).json({ aiResponse: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response
    const fallbackResponse = {
      conceptualization: "Group challenges often reflect the collective needs of developing children navigating social learning together. These moments are opportunities to build classroom community.",
      alignedStrategy: "Implement a 'Calm Down Together' routine: Use a visual cue (like dimming lights or soft music) to signal the whole group to take three deep breaths together. This creates collective regulation.",
      testOption: "Try 'Silent Signals': Develop hand gestures or visual cues that the whole class learns for common needs (bathroom, water, help). This reduces verbal disruptions.",
      futureReadinessBenefit: "These group strategies build classroom community, teach children to be aware of collective energy, and develop skills for collaboration and mutual support."
    };

    res.status(200).json({ aiResponse: fallbackResponse });
  }
}

function extractSection(text: string, keyword: string): string {
  const lines = text.split('\n');
  let inSection = false;
  let sectionText = '';
  
  for (const line of lines) {
    if (line.toLowerCase().includes(keyword.toLowerCase())) {
      inSection = true;
      continue;
    }
    if (inSection && line.trim().startsWith('**') && !line.toLowerCase().includes(keyword.toLowerCase())) {
      break;
    }
    if (inSection) {
      sectionText += line + '\n';
    }
  }
  
  return sectionText.trim();
}