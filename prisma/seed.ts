import { PrismaClient, Language, ResourceType, ResourceCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Theoretical Frameworks
  console.log('📚 Seeding theoretical frameworks...')
  
  const attachmentTheory = await prisma.theoreticalFramework.upsert({
    where: { name: 'Attachment Theory' },
    update: {},
    create: {
      name: 'Attachment Theory',
      coreIdea: 'Children need a secure base; behavior often signals a need for safety/connection.',
      productPrinciples: [
        'Use warm, supportive tone in all interactions',
        'Assume skill-building needs, not willful defiance',
        'Prioritize co-regulation prompts before teaching',
        'Frame behaviors as communication of needs'
      ],
      aiHooks: [
        'Use "Name–Normalize–Guide" framing structure',
        'Avoid blame language toward child or educator',
        'Include connection-building steps in strategies',
        'Emphasize safety and predictability'
      ],
      languagePatterns: [
        'had a hard time with',
        'was working on',
        'needed support with',
        'let\'s help them feel safe'
      ],
      avoidancePatterns: [
        'refused to',
        'wouldn\'t listen',
        'being defiant',
        'acting out'
      ]
    }
  })

  const iecmh = await prisma.theoreticalFramework.upsert({
    where: { name: 'Infant & Early Childhood Mental Health (IECMH)' },
    update: {},
    create: {
      name: 'Infant & Early Childhood Mental Health (IECMH)',
      coreIdea: 'Relationships drive regulation and learning.',
      productPrinciples: [
        'Include adult co-regulation in all strategies',
        'Emphasize frequent, predictable routines',
        'Suggest gentle, predictable transitions',
        'Support educator emotional state as part of system'
      ],
      aiHooks: [
        'Adult role = co-regulator, not controller',
        'Reflect educator mood as part of strategy selection',
        'Include relationship repair when needed',
        'Emphasize attunement and responsiveness'
      ],
      languagePatterns: [
        'let\'s stay calm together',
        'I\'m here with you',
        'we can figure this out',
        'you\'re safe with me'
      ],
      avoidancePatterns: [
        'make them comply',
        'get control of',
        'force them to',
        'demand that they'
      ]
    }
  })

  const devNeuro = await prisma.theoreticalFramework.upsert({
    where: { name: 'Developmental Neuroscience' },
    update: {},
    create: {
      name: 'Developmental Neuroscience',
      coreIdea: 'Executive function develops over time; stress narrows capacity.',
      productPrinciples: [
        'Chunk tasks into manageable steps',
        'Reduce cognitive demands during dysregulation',
        'Provide clear visual and time cues',
        'Use concrete, sequential instructions'
      ],
      aiHooks: [
        'Include countdowns and visual supports',
        'Use first–then language structure',
        'Assign clear, simple roles',
        'Keep wait-times developmentally appropriate'
      ],
      languagePatterns: [
        'first we will, then we will',
        'in 2 minutes we will',
        'your job is to',
        'let\'s count together'
      ],
      avoidancePatterns: [
        'you should know better',
        'remember what I said',
        'pay attention',
        'focus harder'
      ]
    }
  })

  const traumaInformed = await prisma.theoreticalFramework.upsert({
    where: { name: 'Trauma-Informed Care' },
    update: {},
    create: {
      name: 'Trauma-Informed Care',
      coreIdea: 'Prioritize safety, choice, collaboration; reduce re-triggering.',
      productPrinciples: [
        'Always offer choices within boundaries',
        'Avoid power struggles and control battles',
        'Use "when/then" language instead of threats',
        'Include repair strategies after difficult moments'
      ],
      aiHooks: [
        'Offer two regulated choices in strategies',
        'De-escalate first, teach later approach',
        'Include safety and predictability elements',
        'Avoid re-traumatizing language or approaches'
      ],
      languagePatterns: [
        'would you like to... or...?',
        'when you\'re ready',
        'let\'s try this together',
        'you get to choose'
      ],
      avoidancePatterns: [
        'if you don\'t... then',
        'you have to',
        'because I said so',
        'stop that right now'
      ]
    }
  })

  const sel = await prisma.theoreticalFramework.upsert({
    where: { name: 'Social-Emotional Learning (SEL)' },
    update: {},
    create: {
      name: 'Social-Emotional Learning (SEL)',
      coreIdea: 'Self-awareness, self-management, social awareness, relationships, decision-making.',
      productPrinciples: [
        'Connect all strategies to SEL competencies',
        'Build skills for collaboration and adaptability',
        'Include reflection and self-awareness components',
        'Emphasize relationship-building outcomes'
      ],
      aiHooks: [
        'Map strategies to specific SEL competencies',
        'Include "Future-Readiness Benefit" connections',
        'Emphasize skill-building over compliance',
        'Connect to long-term development goals'
      ],
      languagePatterns: [
        'this helps you learn to',
        'you\'re building skills for',
        'this will help you when',
        'you\'re learning how to'
      ],
      avoidancePatterns: [
        'just behave',
        'be good',
        'follow the rules',
        'do what you\'re told'
      ]
    }
  })

  // Seed Strategy Templates
  console.log('🎯 Seeding strategy templates...')
  
  await prisma.strategyTemplate.upsert({
    where: { name: 'Connection Before Direction' },
    update: {},
    create: {
      name: 'Connection Before Direction',
      frameworks: [attachmentTheory.id, iecmh.id, traumaInformed.id],
      ageGroups: ['infants', 'toddlers', 'preschool', 'tk', 'kindergarten'],
      contexts: ['transition', 'group_activity', 'conflict', 'emotional_dysregulation'],
      severity: ['medium', 'high'],
      template: 'First, get down to the child\'s eye level and acknowledge their feelings with simple, warm words like "I see you\'re having a hard time." Then, offer two simple choices that both lead to the same positive outcome. This respects their growing autonomy while maintaining necessary boundaries.',
      variations: [
        'For younger children: Use fewer words and more physical comfort',
        'For older children: Include more verbal processing of emotions',
        'During high stress: Focus only on connection, save direction for later'
      ],
      futureReadinessBenefits: [
        'Builds emotional regulation skills',
        'Develops trust in adult relationships',
        'Strengthens problem-solving abilities',
        'Supports resilience and confidence'
      ]
    }
  })

  await prisma.strategyTemplate.upsert({
    where: { name: 'Quiet Partnership' },
    update: {},
    create: {
      name: 'Quiet Partnership',
      frameworks: [attachmentTheory.id, iecmh.id, devNeuro.id],
      ageGroups: ['toddlers', 'preschool', 'tk'],
      contexts: ['emotional_dysregulation', 'overwhelm', 'sensory_sensitivity'],
      severity: ['low', 'medium', 'high'],
      template: 'Stand or sit near the child without immediately speaking. Sometimes your calm, supportive presence alone can help them regulate. If they seem ready, you might softly narrate what you see: "You\'re working really hard right now."',
      variations: [
        'For sensory-sensitive children: Maintain more physical distance',
        'For attachment-seeking children: Offer gentle physical comfort',
        'During high intensity: Simply be present without words'
      ],
      futureReadinessBenefits: [
        'Teaches self-regulation through co-regulation',
        'Builds capacity for independent coping',
        'Develops awareness of internal states',
        'Strengthens sense of safety and support'
      ]
    }
  })

  await prisma.strategyTemplate.upsert({
    where: { name: 'First-Then Structure' },
    update: {},
    create: {
      name: 'First-Then Structure',
      frameworks: [devNeuro.id, sel.id, traumaInformed.id],
      ageGroups: ['toddlers', 'preschool', 'tk', 'kindergarten'],
      contexts: ['transition', 'routine', 'task_completion', 'group_activity'],
      severity: ['low', 'medium'],
      template: 'Use clear, visual "first-then" language: "First we clean up the blocks, then we go outside." Consider using pictures or gestures to support understanding. Break larger tasks into smaller, manageable steps.',
      variations: [
        'For visual learners: Use picture cards or visual schedules',
        'For auditory learners: Use songs or rhythmic patterns',
        'For kinesthetic learners: Include movement or hand gestures'
      ],
      futureReadinessBenefits: [
        'Develops executive function skills',
        'Builds understanding of sequences and planning',
        'Supports task completion and follow-through',
        'Strengthens working memory and attention'
      ]
    }
  })

  // Seed Language Guidelines
  console.log('📝 Seeding language guidelines...')
  
  await prisma.languageGuideline.upsert({
    where: { id: 'plain-language' },
    update: {},
    create: {
      id: 'plain-language',
      category: 'tone',
      rule: 'Use plain, nonjudgmental language that assumes positive intent',
      examples: [
        {
          preferred: 'had a hard time starting the activity',
          avoid: 'refused to participate'
        },
        {
          preferred: 'needed support with sharing',
          avoid: 'wouldn\'t share'
        },
        {
          preferred: 'was working on staying calm',
          avoid: 'had a meltdown'
        }
      ]
    }
  })

  await prisma.languageGuideline.upsert({
    where: { id: 'skill-building' },
    update: {},
    create: {
      id: 'skill-building',
      category: 'framing',
      rule: 'Emphasize skills to build, not compliance to achieve',
      examples: [
        {
          preferred: 'learning to wait for their turn',
          avoid: 'needs to follow directions'
        },
        {
          preferred: 'building skills for asking for help',
          avoid: 'must raise hand properly'
        },
        {
          preferred: 'practicing gentle touches',
          avoid: 'stop hitting'
        }
      ]
    }
  })

  // Seed Resources
  console.log('📚 Seeding resources...')
  
  await prisma.resource.upsert({
    where: { id: 'tantrum-support' },
    update: {},
    create: {
      id: 'tantrum-support',
      title: 'Supporting Big Feelings: Tantrum Strategies',
      description: 'Gentle, connection-first approaches for when children have big emotional moments.',
      type: ResourceType.STRATEGY,
      category: ResourceCategory.BEHAVIOR,
      ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)'],
      settings: ['classroom', 'home', 'childcare'],
      language: Language.ENGLISH,
      isPremium: false,
      familyCompanionId: 'tantrum-support-family'
    }
  })

  await prisma.resource.upsert({
    where: { id: 'separation-anxiety' },
    update: {},
    create: {
      id: 'separation-anxiety',
      title: 'Easing Separation: Drop-off Strategies',
      description: 'Building security and trust during challenging drop-off moments.',
      type: ResourceType.STRATEGY,
      category: ResourceCategory.BEHAVIOR,
      ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)'],
      settings: ['classroom', 'childcare'],
      language: Language.ENGLISH,
      isPremium: false,
      familyCompanionId: 'separation-anxiety-family'
    }
  })

  await prisma.resource.upsert({
    where: { id: 'smooth-transitions' },
    update: {},
    create: {
      id: 'smooth-transitions',
      title: 'Smooth Transitions: Visual Cues & Countdowns',
      description: 'Making transitions predictable and calm with visual supports and preparation.',
      type: ResourceType.GUIDE,
      category: ResourceCategory.TRANSITIONS,
      ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
      settings: ['classroom', 'childcare'],
      language: Language.ENGLISH,
      isPremium: false,
      familyCompanionId: 'smooth-transitions-family'
    }
  })

  // Seed Family Communication Scripts
  console.log('💬 Seeding family communication scripts...')
  
  await prisma.familyCommunicationScript.upsert({
    where: { id: 'tantrum-explanation' },
    update: {},
    create: {
      id: 'tantrum-explanation',
      title: 'Explaining Tantrums to Families',
      category: 'behavior_explanation',
      scenario: 'When a child has frequent emotional outbursts',
      script: `Hi [Parent Name], I wanted to share what I observed with [Child Name] today. During our transition to cleanup time, [he/she] had some big feelings and needed extra support to feel calm again. This is completely normal for children [his/her] age - their brains are still learning how to handle disappointment and changes. What I saw was [Child Name] working hard to express [his/her] feelings, even though it came out as crying and frustration. We stayed close, helped [him/her] take some deep breaths, and [he/she] was able to rejoin the group when ready. These moments are actually opportunities for [him/her] to practice emotional skills that will serve [him/her] well throughout life.`,
      familyHandoutId: 'tantrum-support-family',
      language: Language.ENGLISH,
      isPremium: false
    }
  })

  await prisma.familyCommunicationScript.upsert({
    where: { id: 'biting-explanation' },
    update: {},
    create: {
      id: 'biting-explanation',
      title: 'Explaining Biting Behaviors',
      category: 'behavior_explanation',
      scenario: 'When a child bites peers or adults',
      script: `Hello [Parent Name], I wanted to let you know about something that happened with [Child Name] today. During playtime, [he/she] bit [peer/adult] when [he/she] was feeling frustrated about sharing a toy. I know this can be concerning, but biting is actually very common for toddlers and young children. At this age, [Child Name]'s language skills are still developing, and sometimes [his/her] body tries to communicate what [his/her] words can't yet express. We immediately helped [him/her] understand that biting hurts friends, and we practiced using words like "my turn" instead. We're working on giving [him/her] the tools to express [his/her] needs in ways that keep everyone safe.`,
      language: Language.ENGLISH,
      isPremium: false
    }
  })

  console.log('✅ Database seeded successfully!')

  // Seed sample organization for testing
  console.log('🏢 Seeding sample organization...')
  
  const sampleOrg = await prisma.organization.create({
    data: {
      name: 'Sunshine Elementary School',
      type: 'school',
      owner: {
        create: {
          clerkId: 'sample_owner_clerk_id',
          email: 'admin@sunshine-elementary.edu',
          fullName: 'Dr. Maria Rodriguez',
          role: 'ADMIN',
          organizationRole: 'OWNER',
          onboardingStatus: 'COMPLETE'
        }
      },
      subscription: {
        create: {
          plan: 'pro',
          maxSeats: 10,
          activeSeats: 1,
          status: 'ACTIVE'
        }
      }
    }
  })

  console.log('✅ Sample organization created!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })