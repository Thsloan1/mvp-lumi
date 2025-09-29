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
    const prompt = `You are Lumi, an expert early childhood behavior coach. Provide a warm, evidence-based strategy for this behavior:

**Behavior:** ${behaviorDescription}
**Context:** ${context}
**Time:** ${timeOfDay || 'Not specified'}
**Severity:** ${severity}
**Educator Mood:** ${educatorMood || 'Not specified'}
**Child Age:** ${ageGroup || 'Preschool'}
**Stressors:** ${stressors?.join(', ') || 'None'}

Provide a response with these sections:
1. Warm acknowledgment
2. Understanding the behavior
3. Practical strategies (3-5 specific approaches)
4. Implementation guidance
5. Why these work
6. Long-term benefits

Use warm, non-judgmental language that assumes positive intent.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Lumi, an expert early childhood behavior coach specializing in attachment theory and trauma-informed care. Provide warm, evidence-based strategies."
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
    
    // Parse response into structured format
    const response = {
      warmAcknowledgment: extractSection(aiText, 'acknowledgment') || "Thank you for sharing this with me. This child needs your support, and I'm glad they have you to help.",
      conceptualization: extractSection(aiText, 'understanding') || "This behavior is a normal part of child development and shows the child is working through important developmental tasks.",
      practicalStrategies: extractStrategies(aiText) || [
        "Get down to the child's eye level and acknowledge their feelings",
        "Offer two simple choices that both lead to positive outcomes",
        "Use calm, predictable routines to build security"
      ],
      implementationGuidance: extractSection(aiText, 'implementation') || "Start with connection first, then try the strategies. Give each approach a few days to see if it's working.",
      whyStrategiesWork: extractSection(aiText, 'why') || "These approaches address the child's underlying needs for safety and connection, helping them build lasting emotional regulation skills.",
      futureReadinessBenefit: extractSection(aiText, 'benefits') || "These strategies help build emotional regulation, problem-solving skills, and trust in relationships - essential for future success."
    };

    res.status(200).json({ aiResponse: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response if OpenAI fails
    const fallbackResponse = {
      warmAcknowledgment: "Thank you for sharing this with me. This child needs your support, and I'm glad they have you to help.",
      conceptualization: "This behavior is a normal part of child development. The child is working through important developmental tasks and learning to express their needs.",
      practicalStrategies: [
        "**Connection First**: Get down to the child's eye level and acknowledge their feelings with simple, warm words like 'I see you're having a hard time.'",
        "**Choice Within Structure**: Offer two simple choices that both lead to the same positive outcome to respect their growing autonomy.",
        "**Calm Partnership**: Stay physically close and breathe calmly yourself - your regulation helps them regulate."
      ],
      implementationGuidance: "Start with connection and safety first. Once the child is calm, then try the practical strategies. Give each approach a few days to see if it's working.",
      whyStrategiesWork: "These approaches are grounded in attachment theory and developmental neuroscience. They address underlying needs rather than just surface behavior.",
      futureReadinessBenefit: "These strategies help children develop emotional regulation, problem-solving skills, and trust in adult relationships - essential foundations for future learning."
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

function extractStrategies(text: string): string[] {
  const strategiesSection = extractSection(text, 'strategies');
  if (!strategiesSection) return [];
  
  const strategies = strategiesSection
    .split(/[•\-\d+\.]/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 5);
    
  return strategies;
}