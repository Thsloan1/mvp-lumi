export interface TheoreticalFramework {
  id: string;
  name: string;
  coreIdea: string;
  productPrinciples: string[];
  aiHooks: string[];
  languagePatterns: string[];
  avoidancePatterns: string[];
}

export interface StrategyTemplate {
  id: string;
  name: string;
  frameworks: string[]; // Framework IDs this strategy aligns with
  ageGroups: string[];
  contexts: string[];
  severity: ('low' | 'medium' | 'high')[];
  template: string;
  variations: string[];
  futureReadinessBenefits: string[];
}

export interface LanguageGuideline {
  id: string;
  category: 'tone' | 'framing' | 'avoidance' | 'cultural';
  rule: string;
  examples: {
    preferred: string;
    avoid: string;
  }[];
}

// Core Theoretical Frameworks
export const THEORETICAL_FRAMEWORKS: TheoreticalFramework[] = [
  {
    id: 'attachment_theory',
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
  },
  {
    id: 'iecmh',
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
  },
  {
    id: 'developmental_neuroscience',
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
  },
  {
    id: 'trauma_informed_care',
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
  },
  {
    id: 'sel',
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
  },
  {
    id: 'culturally_responsive',
    name: 'Culturally & Linguistically Responsive Practice',
    coreIdea: 'Honor home language/culture; build partnership with families.',
    productPrinciples: [
      'Generate bilingual family communication notes',
      'Use plain-language, accessible explanations',
      'Preserve cultural names and terms respectfully',
      'Build on family and cultural strengths'
    ],
    aiHooks: [
      'Include respectful cultural considerations',
      'Encourage family partnership and strengths',
      'Avoid deficit-based language about families',
      'Support home-school connection building'
    ],
    languagePatterns: [
      'building on what families do well',
      'honoring home practices',
      'connecting school and home',
      'celebrating cultural strengths'
    ],
    avoidancePatterns: [
      'families need to',
      'parents should',
      'cultural barriers',
      'language problems'
    ]
  }
];

// Language Guidelines for AI Outputs
export const LANGUAGE_GUIDELINES: LanguageGuideline[] = [
  {
    id: 'plain_language',
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
  },
  {
    id: 'skill_building',
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
  },
  {
    id: 'developmental_normal',
    category: 'framing',
    rule: 'Normalize developmental variability; avoid pathologizing language',
    examples: [
      {
        preferred: 'this is common for children this age',
        avoid: 'this behavior is concerning'
      },
      {
        preferred: 'developing at their own pace',
        avoid: 'behind developmentally'
      },
      {
        preferred: 'learning these important skills',
        avoid: 'has deficits in'
      }
    ]
  },
  {
    id: 'shared_responsibility',
    category: 'framing',
    rule: 'Use "we" framing for shared responsibility between adult and child',
    examples: [
      {
        preferred: 'we can work on this together',
        avoid: 'they need to learn'
      },
      {
        preferred: 'let\'s practice this skill',
        avoid: 'make them practice'
      },
      {
        preferred: 'we\'ll figure this out',
        avoid: 'they have to change'
      }
    ]
  },
  {
    id: 'connection_first',
    category: 'tone',
    rule: 'Include calming/connection step before skill practice for Medium/High severity',
    examples: [
      {
        preferred: 'First, let\'s help them feel safe, then we can practice...',
        avoid: 'They need to learn that...'
      },
      {
        preferred: 'Once they\'re calm, we can work on...',
        avoid: 'Immediately redirect them to...'
      },
      {
        preferred: 'After connecting, try...',
        avoid: 'Correct the behavior by...'
      }
    ]
  },
  {
    id: 'cultural_respect',
    category: 'cultural',
    rule: 'Honor family practices and avoid deficit-based cultural assumptions',
    examples: [
      {
        preferred: 'building on family strengths',
        avoid: 'overcoming family barriers'
      },
      {
        preferred: 'connecting home and school practices',
        avoid: 'teaching proper behavior'
      },
      {
        preferred: 'celebrating what families do well',
        avoid: 'fixing family problems'
      }
    ]
  }
];

// Strategy Templates organized by framework alignment
export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'connection_before_direction',
    name: 'Connection Before Direction',
    frameworks: ['attachment_theory', 'iecmh', 'trauma_informed_care'],
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
  },
  {
    id: 'quiet_partnership',
    name: 'Quiet Partnership',
    frameworks: ['attachment_theory', 'iecmh', 'developmental_neuroscience'],
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
  },
  {
    id: 'first_then_structure',
    name: 'First-Then Structure',
    frameworks: ['developmental_neuroscience', 'sel', 'trauma_informed_care'],
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
  },
  {
    id: 'calm_down_together',
    name: 'Calm Down Together',
    frameworks: ['iecmh', 'sel', 'trauma_informed_care'],
    ageGroups: ['toddlers', 'preschool', 'tk', 'kindergarten'],
    contexts: ['group_activity', 'transition', 'classroom_climate'],
    severity: ['medium', 'high'],
    template: 'Use a visual cue (like dimming lights or playing soft music) to signal the whole group to take three deep breaths together. This creates collective regulation and teaches children that everyone sometimes needs to reset. Follow with a simple, engaging activity that rebuilds positive group energy.',
    variations: [
      'For younger groups: Use simple breathing with stuffed animals',
      'For older groups: Include mindfulness or body awareness',
      'For high energy: Include gentle movement or stretching'
    ],
    futureReadinessBenefits: [
      'Builds classroom community and cooperation',
      'Teaches collective emotional regulation',
      'Develops awareness of group dynamics',
      'Strengthens collaboration and mutual support skills'
    ]
  },
  {
    id: 'choice_within_structure',
    name: 'Choice Within Structure',
    frameworks: ['trauma_informed_care', 'sel', 'culturally_responsive'],
    ageGroups: ['toddlers', 'preschool', 'tk', 'kindergarten'],
    contexts: ['routine', 'conflict', 'task_completion', 'transition'],
    severity: ['low', 'medium'],
    template: 'Offer two acceptable choices that both meet your goal: "Would you like to walk to circle time or hop like a bunny?" This gives children agency while maintaining necessary structure and routines.',
    variations: [
      'For strong-willed children: Offer choices throughout the day',
      'For anxious children: Keep choices simple and predictable',
      'For younger children: Use concrete, visual choices'
    ],
    futureReadinessBenefits: [
      'Develops decision-making and autonomy',
      'Builds sense of agency and empowerment',
      'Strengthens problem-solving skills',
      'Supports self-advocacy and communication'
    ]
  }
];

// SEL Competency Mapping
export const SEL_COMPETENCIES = {
  self_awareness: [
    'Recognizing emotions',
    'Understanding strengths and challenges',
    'Developing self-confidence'
  ],
  self_management: [
    'Regulating emotions',
    'Managing stress',
    'Setting and achieving goals',
    'Showing self-discipline'
  ],
  social_awareness: [
    'Taking others\' perspectives',
    'Showing empathy',
    'Understanding social norms',
    'Recognizing family and community resources'
  ],
  relationship_skills: [
    'Communicating clearly',
    'Listening actively',
    'Cooperating',
    'Seeking and offering help',
    'Resolving conflicts constructively'
  ],
  responsible_decision_making: [
    'Making constructive choices',
    'Evaluating consequences',
    'Considering ethical standards',
    'Contributing to community well-being'
  ]
};

// Future-Readiness Skills Mapping
export const FUTURE_READINESS_SKILLS = {
  adaptability: [
    'Flexibility in changing situations',
    'Resilience in face of challenges',
    'Openness to new experiences'
  ],
  collaboration: [
    'Working effectively in teams',
    'Contributing to group goals',
    'Respecting diverse perspectives'
  ],
  communication: [
    'Expressing ideas clearly',
    'Active listening',
    'Digital communication skills'
  ],
  creativity: [
    'Innovative thinking',
    'Problem-solving',
    'Artistic expression'
  ],
  critical_thinking: [
    'Analyzing information',
    'Making reasoned decisions',
    'Questioning assumptions'
  ],
  cultural_competence: [
    'Understanding diverse perspectives',
    'Communicating across cultures',
    'Appreciating global interconnectedness'
  ]
};

// Knowledge Library Management Functions
export class KnowledgeLibrary {
  private frameworks: TheoreticalFramework[];
  private guidelines: LanguageGuideline[];
  private templates: StrategyTemplate[];

  constructor() {
    this.frameworks = [...THEORETICAL_FRAMEWORKS];
    this.guidelines = [...LANGUAGE_GUIDELINES];
    this.templates = [...STRATEGY_TEMPLATES];
  }

  // Get framework by ID
  getFramework(id: string): TheoreticalFramework | undefined {
    return this.frameworks.find(f => f.id === id);
  }

  // Get applicable frameworks for a given context
  getApplicableFrameworks(context: {
    severity: 'low' | 'medium' | 'high';
    ageGroup: string;
    behaviorType: string;
  }): TheoreticalFramework[] {
    // Logic to determine which frameworks apply based on context
    // This would be expanded based on specific rules
    return this.frameworks;
  }

  // Get strategy templates matching criteria
  getStrategyTemplates(criteria: {
    frameworks?: string[];
    ageGroup?: string;
    context?: string;
    severity?: 'low' | 'medium' | 'high';
  }): StrategyTemplate[] {
    return this.templates.filter(template => {
      if (criteria.frameworks && !criteria.frameworks.some(f => template.frameworks.includes(f))) {
        return false;
      }
      if (criteria.ageGroup && !template.ageGroups.includes(criteria.ageGroup)) {
        return false;
      }
      if (criteria.context && !template.contexts.includes(criteria.context)) {
        return false;
      }
      if (criteria.severity && !template.severity.includes(criteria.severity)) {
        return false;
      }
      return true;
    });
  }

  // Get language guidelines by category
  getLanguageGuidelines(category?: string): LanguageGuideline[] {
    if (category) {
      return this.guidelines.filter(g => g.category === category);
    }
    return this.guidelines;
  }

  // Update framework (for admin use)
  updateFramework(id: string, updates: Partial<TheoreticalFramework>): boolean {
    const index = this.frameworks.findIndex(f => f.id === id);
    if (index !== -1) {
      this.frameworks[index] = { ...this.frameworks[index], ...updates };
      return true;
    }
    return false;
  }

  // Add new strategy template
  addStrategyTemplate(template: StrategyTemplate): void {
    this.templates.push(template);
  }

  // Update strategy template
  updateStrategyTemplate(id: string, updates: Partial<StrategyTemplate>): boolean {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updates };
      return true;
    }
    return false;
  }

  // Get all data for export/backup
  exportKnowledgeBase() {
    return {
      frameworks: this.frameworks,
      guidelines: this.guidelines,
      templates: this.templates,
      selCompetencies: SEL_COMPETENCIES,
      futureReadinessSkills: FUTURE_READINESS_SKILLS
    };
  }

  // Import knowledge base data
  importKnowledgeBase(data: any): void {
    if (data.frameworks) this.frameworks = data.frameworks;
    if (data.guidelines) this.guidelines = data.guidelines;
    if (data.templates) this.templates = data.templates;
  }
}

// Global knowledge library instance
export const knowledgeLibrary = new KnowledgeLibrary();