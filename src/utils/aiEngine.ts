import { knowledgeLibrary, StrategyTemplate, TheoreticalFramework } from '../data/knowledgeLibrary';
import { AIStrategyResponse, Child } from '../types';

interface BehaviorContext {
  behaviorDescription: string;
  context: string;
  timeOfDay?: string;
  severity: 'low' | 'medium' | 'high';
  ageGroup: string;
  stressors: string[];
  educatorMood?: string;
  teachingStyle?: string;
  learningStyle?: string;
  child?: Child;
}

interface ClassroomContext {
  challengeDescription: string;
  context: string;
  severity: 'low' | 'medium' | 'high';
  gradeLevel: string;
  classSize: number;
  stressors: string[];
  educatorMood?: string;
  teachingStyle?: string;
}

export class LumiAIEngine {
  private knowledgeBase = knowledgeLibrary;

  // Generate child behavior strategy
  async generateChildBehaviorStrategy(context: BehaviorContext): Promise<AIStrategyResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Parse behavior description for context clues
    const parsedContext = this.parseContextFromDescription(context.behaviorDescription);
    
    // Get child's behavior history for longitudinal analysis
    const behaviorHistory = this.getBehaviorHistory(context.child?.id || '');
    
    // Get applicable frameworks
    const applicableFrameworks = this.getApplicableFrameworks({...context, ...parsedContext});
    
    // Get strategy templates
    const strategyTemplates = this.getStrategyTemplates({...context, ...parsedContext}, applicableFrameworks);
    
    // Generate warm acknowledgment
    const warmAcknowledgment = this.generateWarmAcknowledgment({...context, ...parsedContext});
    
    // Extract observed behavior and context
    const observedBehavior = context.behaviorDescription;
    const contextTrigger = (parsedContext.context || context.context) + (parsedContext.timeOfDay || context.timeOfDay ? `, ${parsedContext.timeOfDay || context.timeOfDay}` : '');
    
    // Generate conceptualization
    const conceptualization = this.generateConceptualization({...context, ...parsedContext}, applicableFrameworks, behaviorHistory);
    
    // Generate core needs and developmental analysis
    const coreNeedsAndDevelopment = this.generateCoreNeedsAndDevelopment({...context, ...parsedContext}, applicableFrameworks);
    
    // Generate attachment support
    const attachmentSupport = this.generateAttachmentSupport({...context, ...parsedContext}, applicableFrameworks);
    
    // Generate practical strategies
    const practicalStrategies = this.generatePracticalStrategies({...context, ...parsedContext}, strategyTemplates);
    
    // Generate implementation guidance
    const implementationGuidance = this.generateImplementationGuidance({...context, ...parsedContext}, strategyTemplates[0]);
    
    // Generate why strategies work
    const whyStrategiesWork = this.generateWhyStrategiesWork({...context, ...parsedContext}, strategyTemplates[0]);
    
    // Generate future-readiness benefit  
    const futureReadinessBenefit = this.generateFutureReadinessBenefit({...context, ...parsedContext}, strategyTemplates[0]);
    
    // Generate family script if applicable
    const familyScript = this.generateFamilyScript({...context, ...parsedContext});

    return {
      warmAcknowledgment,
      observedBehavior,
      contextTrigger,
      conceptualization,
      coreNeedsAndDevelopment,
      attachmentSupport,
      practicalStrategies,
      implementationGuidance,
      whyStrategiesWork,
      futureReadinessBenefit,
      familyScript
    };
  }

  // Generate classroom strategy
  async generateClassroomStrategy(context: ClassroomContext): Promise<AIStrategyResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Parse challenge description for context clues
    const parsedContext = this.parseClassroomContextFromDescription(context.challengeDescription);
    
    const applicableFrameworks = this.getApplicableFrameworksForClassroom(context);
    const strategyTemplates = this.getClassroomStrategyTemplates({...context, ...parsedContext}, applicableFrameworks);
    
    const conceptualization = this.generateClassroomConceptualization({...context, ...parsedContext}, applicableFrameworks);
    const alignedStrategy = this.generateClassroomAlignedStrategy({...context, ...parsedContext}, strategyTemplates[0]);
    const testOption = this.generateClassroomTestOption({...context, ...parsedContext}, strategyTemplates[1] || strategyTemplates[0]);
    const futureReadinessBenefit = this.generateClassroomFutureReadinessBenefit({...context, ...parsedContext}, strategyTemplates[0]);

    return {
      conceptualization,
      alignedStrategy,
      testOption,
      futureReadinessBenefit
    };
  }

  private getApplicableFrameworks(context: BehaviorContext): TheoreticalFramework[] {
    const frameworks = [];
    
    // Always include attachment theory for connection-based approach
    const attachmentFramework = this.knowledgeBase.getFramework('attachment_theory');
    if (attachmentFramework) frameworks.push(attachmentFramework);
    
    // Include IECMH for relationship-focused strategies
    const iecmhFramework = this.knowledgeBase.getFramework('iecmh');
    if (iecmhFramework) frameworks.push(iecmhFramework);
    
    // Include developmental neuroscience for age-appropriate strategies
    const devNeuroFramework = this.knowledgeBase.getFramework('developmental_neuroscience');
    if (devNeuroFramework) frameworks.push(devNeuroFramework);
    
    // Include trauma-informed care for medium/high severity
    if (context.severity === 'medium' || context.severity === 'high') {
      const traumaFramework = this.knowledgeBase.getFramework('trauma_informed_care');
      if (traumaFramework) frameworks.push(traumaFramework);
    }
    
    // Always include SEL for skill-building focus
    const selFramework = this.knowledgeBase.getFramework('sel');
    if (selFramework) frameworks.push(selFramework);
    
    return frameworks;
  }

  private parseContextFromDescription(description: string): Partial<BehaviorContext> {
    const parsed: Partial<BehaviorContext> = {};
    const lowerDesc = description.toLowerCase();
    
    // Parse context
    if (lowerDesc.includes('circle time') || lowerDesc.includes('circle')) {
      parsed.context = 'circle_time';
    } else if (lowerDesc.includes('transition') || lowerDesc.includes('transitioning')) {
      parsed.context = 'transition';
    } else if (lowerDesc.includes('free play') || lowerDesc.includes('play time')) {
      parsed.context = 'free_play';
    } else if (lowerDesc.includes('meal') || lowerDesc.includes('lunch') || lowerDesc.includes('snack')) {
      parsed.context = 'meal_time';
    } else if (lowerDesc.includes('cleanup') || lowerDesc.includes('clean up')) {
      parsed.context = 'cleanup';
    } else if (lowerDesc.includes('arrival') || lowerDesc.includes('drop off') || lowerDesc.includes('drop-off')) {
      parsed.context = 'arrival_drop_off';
    } else if (lowerDesc.includes('outdoor') || lowerDesc.includes('playground')) {
      parsed.context = 'outdoor_play';
    } else if (lowerDesc.includes('nap') || lowerDesc.includes('rest')) {
      parsed.context = 'rest_nap_time';
    }
    
    // Parse time of day
    if (lowerDesc.includes('morning') || lowerDesc.includes('early')) {
      parsed.timeOfDay = 'morning';
    } else if (lowerDesc.includes('afternoon') || lowerDesc.includes('late')) {
      parsed.timeOfDay = 'afternoon';
    } else if (lowerDesc.includes('midday') || lowerDesc.includes('noon') || lowerDesc.includes('lunch time')) {
      parsed.timeOfDay = 'midday';
    }
    
    // Parse severity indicators
    if (lowerDesc.includes('meltdown') || lowerDesc.includes('aggressive') || lowerDesc.includes('violent') || lowerDesc.includes('screaming')) {
      parsed.severity = 'high';
    } else if (lowerDesc.includes('frustrated') || lowerDesc.includes('upset') || lowerDesc.includes('crying')) {
      parsed.severity = 'medium';
    } else if (lowerDesc.includes('minor') || lowerDesc.includes('small') || lowerDesc.includes('brief')) {
      parsed.severity = 'low';
    }
    
    return parsed;
  }

  private parseClassroomContextFromDescription(description: string): Partial<ClassroomContext> {
    const parsed: Partial<ClassroomContext> = {};
    const lowerDesc = description.toLowerCase();
    
    // Parse context
    if (lowerDesc.includes('transition') || lowerDesc.includes('transitioning')) {
      parsed.context = 'transition';
    } else if (lowerDesc.includes('circle time') || lowerDesc.includes('circle')) {
      parsed.context = 'circle_time';
    } else if (lowerDesc.includes('group work') || lowerDesc.includes('group activity')) {
      parsed.context = 'group_work';
    } else if (lowerDesc.includes('meal') || lowerDesc.includes('lunch') || lowerDesc.includes('snack')) {
      parsed.context = 'meal_time';
    } else if (lowerDesc.includes('play time') || lowerDesc.includes('free play')) {
      parsed.context = 'play_time';
    } else if (lowerDesc.includes('cleanup') || lowerDesc.includes('clean up')) {
      parsed.context = 'cleanup';
    }
    
    // Parse severity indicators
    if (lowerDesc.includes('chaos') || lowerDesc.includes('complete disruption') || lowerDesc.includes('halted')) {
      parsed.severity = 'high';
    } else if (lowerDesc.includes('disrupted') || lowerDesc.includes('slowed') || lowerDesc.includes('difficult')) {
      parsed.severity = 'medium';
    } else if (lowerDesc.includes('minor') || lowerDesc.includes('small') || lowerDesc.includes('brief')) {
      parsed.severity = 'low';
    }
    
    return parsed;
  }

  private getApplicableFrameworksForClassroom(context: ClassroomContext): TheoreticalFramework[] {
    const frameworks = [];
    
    // Include IECMH for group regulation
    const iecmhFramework = this.knowledgeBase.getFramework('iecmh');
    if (iecmhFramework) frameworks.push(iecmhFramework);
    
    // Include SEL for group skills
    const selFramework = this.knowledgeBase.getFramework('sel');
    if (selFramework) frameworks.push(selFramework);
    
    // Include trauma-informed care for safety and choice
    const traumaFramework = this.knowledgeBase.getFramework('trauma_informed_care');
    if (traumaFramework) frameworks.push(traumaFramework);
    
    return frameworks;
  }

  private getStrategyTemplates(context: BehaviorContext, frameworks: TheoreticalFramework[]): StrategyTemplate[] {
    const frameworkIds = frameworks.map(f => f.id);
    
    return this.knowledgeBase.getStrategyTemplates({
      frameworks: frameworkIds,
      ageGroup: this.mapAgeGroup(context.ageGroup),
      context: context.context,
      severity: context.severity
    });
  }

  private getClassroomStrategyTemplates(context: ClassroomContext, frameworks: TheoreticalFramework[]): StrategyTemplate[] {
    const frameworkIds = frameworks.map(f => f.id);
    
    return this.knowledgeBase.getStrategyTemplates({
      frameworks: frameworkIds,
      ageGroup: this.mapAgeGroup(context.gradeLevel),
      context: context.context,
      severity: context.severity
    });
  }

  private generateWarmAcknowledgment(context: BehaviorContext): string {
    const childName = context.child?.name || 'this child';
    const intensityMap = {
      'low': 'had a challenging moment',
      'medium': 'had a really hard time', 
      'high': 'had a very hard time'
    };
    
    const moodMap = {
      'overwhelmed': "I can see this was overwhelming for you too.",
      'frustrated': "I understand this was frustrating.",
      'angry': "I can feel how difficult this moment was for you.",
      'managing': "Thank you for staying present during this challenge.",
      'okay': "I appreciate you sharing this with me.",
      'calm': "Your calm presence made a difference."
    };
    
    let acknowledgment = `Thank you for that important information. ${childName} ${intensityMap[context.severity]} and needs your support. `;
    
    if (context.educatorMood && moodMap[context.educatorMood as keyof typeof moodMap]) {
      acknowledgment += moodMap[context.educatorMood as keyof typeof moodMap] + ' ';
    }
    
    acknowledgment += `I'm so glad ${childName} has you to help. Here are some ideas for you to think about and try.`;
    
    return acknowledgment;
  }

  private getBehaviorHistory(childId: string): any[] {
    // In real implementation, this would fetch from database
    return [];
  }

  private generateConceptualization(context: BehaviorContext, frameworks: TheoreticalFramework[], history: any[]): string {
    const attachmentFramework = frameworks.find(f => f.id === 'attachment_theory');
    const devNeuroFramework = frameworks.find(f => f.id === 'developmental_neuroscience');
    
    let conceptualization = `This behavior appears to be a normal part of child development. `;
    
    if (attachmentFramework) {
      conceptualization += `When children ${this.normalizeLanguage(context.behaviorDescription)}, they're often communicating important needs or working through developmental challenges. `;
    }
    
    if (devNeuroFramework && (context.severity === 'medium' || context.severity === 'high')) {
      conceptualization += `This is especially common during ${context.context.toLowerCase()} when children may feel overwhelmed or uncertain about expectations. `;
    }
    
    conceptualization += `Remember that building skills takes time, and your warm, consistent support helps them learn.`;
    
    
    return conceptualization;
  }

  private generateClassroomConceptualization(context: ClassroomContext, frameworks: TheoreticalFramework[]): string {
    let conceptualization = `Group challenges often reflect the collective needs of developing children navigating social learning together. `;
    
    conceptualization += `When ${this.normalizeLanguage(context.challengeDescription)}, the classroom community is working through important developmental tasks like cooperation, turn-taking, and emotional co-regulation. `;
    
    if (context.stressors.length > 0) {
      conceptualization += `The stressors you've identified - like ${context.stressors.slice(0, 2).join(' and ')} - are common challenges that affect group dynamics. `;
    }
    
    conceptualization += `These moments are opportunities to build classroom community and teach valuable life skills.`;
    
    return conceptualization;
  }

  private generateCoreNeedsAndDevelopment(context: BehaviorContext, frameworks: TheoreticalFramework[]): string {
    const attachmentFramework = frameworks.find(f => f.id === 'attachment_theory');
    const traumaFramework = frameworks.find(f => f.id === 'trauma_informed_care');
    const devNeuroFramework = frameworks.find(f => f.id === 'developmental_neuroscience');
    
    let needs = `**Core Needs:** Based on what you've described, ${this.normalizeLanguage(context.behaviorDescription)} often signals that a child needs: `;
    
    if (context.severity === 'high') {
      needs += `safety and emotional regulation support, `;
    }
    
    if (attachmentFramework) {
      needs += `connection and reassurance from trusted adults, `;
    }
    
    if (context.context.includes('transition')) {
      needs += `predictability and time to process changes, `;
    }
    
    needs += `and opportunities to practice the skills they're still developing.`;
    
    if (devNeuroFramework) {
      needs += `\n\n**Developmental Context:** This behavior is `;
      if (context.child?.age && context.child.age < 4) {
        needs += `very typical for children this age, as their executive function and emotional regulation systems are still developing rapidly.`;
      } else {
        needs += `within the normal range of development, as children are still learning to manage complex emotions and social situations.`;
      }
    }
    
    return needs;
  }

  private generateAttachmentSupport(context: BehaviorContext, frameworks: TheoreticalFramework[]): string {
    const attachmentFramework = frameworks.find(f => f.id === 'attachment_theory');
    const iecmhFramework = frameworks.find(f => f.id === 'iecmh');
    
    let support = `To help this child feel safe and connected, you can: `;
    
    if (context.severity === 'medium' || context.severity === 'high') {
      support += `Get down to their eye level and use a calm, warm voice. `;
    }
    
    if (attachmentFramework) {
      support += `Acknowledge their feelings with simple words like "I see you're having a hard time." `;
    }
    
    if (iecmhFramework) {
      support += `Stay physically close and breathe calmly yourself - your regulation helps them regulate. `;
    }
    
    return support + `Remember, your calm presence is the most powerful tool you have.`;
  }

  private generateAlignedStrategy(context: BehaviorContext, template: StrategyTemplate): string {
    if (!template) {
      return this.getDefaultChildStrategy(context);
    }
    
    let strategy = template.template;
    
    // Customize based on context
    if (context.severity === 'high' && !strategy.includes('connection')) {
      strategy = `First, focus on connection and safety. ${strategy}`;
    }
    
    // Add educator mood consideration
    if (context.educatorMood === 'overwhelmed') {
      strategy += ` Remember to take a breath yourself first - your calm presence is the most important tool you have.`;
    }
    
    return strategy;
  }

  private generatePracticalStrategies(context: BehaviorContext, templates: StrategyTemplate[]): string[] {
    const strategies: string[] = [];
    
    // Primary strategy based on context and severity
    if (context.severity === 'high') {
      strategies.push(`**Connection First**: Get down to their eye level and say "I'm here with you. You're safe." Wait for their breathing to slow before offering any choices or directions.`);
    }
    
    // Context-specific strategies
    if (context.context.includes('transition')) {
      strategies.push(`**Transition Support**: Give a 2-minute warning with a visual timer. Say "In 2 minutes, we'll clean up and then go outside. What would you like to finish first?"`);
    }
    
    // Template-based strategies
    templates.slice(0, 2).forEach(template => {
      if (template) {
        strategies.push(`**${template.name}**: ${template.template}`);
      }
    });
    
    // Ensure we have at least 3 strategies
    while (strategies.length < 3) {
      strategies.push(this.getDefaultChildStrategy(context));
    }
    
    return strategies.slice(0, 5); // Max 5 strategies
  }

  private generateClassroomAlignedStrategy(context: ClassroomContext, template: StrategyTemplate): string {
    if (!template) {
      return this.getDefaultClassroomStrategy(context);
    }
    
    let strategy = template.template;
    
    // Customize for classroom size
    if (context.classSize > 15) {
      strategy = strategy.replace('whole group', 'small groups first, then whole group');
    }
    
    return strategy;
  }

  private generateTestOption(context: BehaviorContext, template: StrategyTemplate): string {
    const quietPartnership = this.knowledgeBase.getStrategyTemplates({
      frameworks: ['attachment_theory', 'iecmh']
    }).find(t => t.id === 'quiet_partnership');
    
    if (quietPartnership && template?.id !== 'quiet_partnership') {
      return quietPartnership.template;
    }
    
    return `Consider the "Pause and Breathe" technique: Take a moment to breathe deeply yourself, then invite the child to breathe with you. Sometimes slowing down together is exactly what's needed before trying any other strategy.`;
  }

  private generateClassroomTestOption(context: ClassroomContext, template: StrategyTemplate): string {
    return `Try "Silent Signals": Develop hand gestures or visual cues that the whole class learns for common needs (bathroom, water, help). This reduces verbal disruptions while giving children agency to communicate their needs appropriately.`;
  }

  private generateWhyStrategiesWork(context: BehaviorContext, template: StrategyTemplate): string {
    let explanation = `**Why These Strategies Work:** These approaches are grounded in `;
    
    if (template?.frameworks.includes('attachment_theory')) {
      explanation += `attachment theory, which shows that children learn best when they feel safe and connected. `;
    }
    
    if (template?.frameworks.includes('developmental_neuroscience')) {
      explanation += `developmental neuroscience, which tells us that young brains need co-regulation before they can self-regulate. `;
    }
    
    if (template?.frameworks.includes('trauma_informed_care')) {
      explanation += `trauma-informed care principles, emphasizing choice and safety over control. `;
    }
    
    explanation += `By addressing the underlying need rather than just the surface behavior, we help children build lasting skills for emotional regulation and social connection.`;
    
    return explanation;
  }

  private generateFutureReadinessBenefit(context: BehaviorContext, template: StrategyTemplate): string {
    if (template?.futureReadinessBenefits.length) {
      const benefits = template.futureReadinessBenefits.slice(0, 2);
      return `These strategies help build ${benefits.join(' and ').toLowerCase()} - all essential for success in school and life. Children who learn to navigate big feelings with supportive adults develop resilience and confidence that serves them throughout their lives.`;
    }
    
    return `These approaches help children develop emotional regulation, problem-solving skills, and trust in adult relationships - all essential foundations for future learning and social success.`;
  }

  private generateClassroomFutureReadinessBenefit(context: ClassroomContext, template: StrategyTemplate): string {
    if (template?.futureReadinessBenefits.length) {
      const benefits = template.futureReadinessBenefits.slice(0, 2);
      return `These group regulation strategies ${benefits.join(' and ').toLowerCase()}. These are critical 21st-century skills for working effectively in teams and contributing positively to any community.`;
    }
    
    return `These group strategies build classroom community, teach children to be aware of collective energy, and develop skills for collaboration and mutual support - critical abilities for thriving in our interconnected world.`;
  }

  private generateImplementationGuidance(context: BehaviorContext, template: StrategyTemplate): string {
    let guidance = `**How to use these strategies**: `;
    
    if (context.severity === 'high') {
      guidance += `Start with connection and safety first. Once the child is calm, then try the practical strategies. `;
    }
    
    guidance += `Try one strategy at a time and give it a few days to see if it's working. Remember, consistency is more important than perfection. If one approach isn't working, try another - every child is different.`;
    
    return guidance;
  }

  private generateFamilyScript(context: BehaviorContext): string {
    const normalizedBehavior = this.normalizeLanguage(context.behaviorDescription);
    
    return `Hi [Parent Name], I wanted to share what happened with [Child Name] today. During ${context.context.toLowerCase()}, [he/she] ${normalizedBehavior}. This is completely normal for children [his/her] age and shows [he/she] is learning to express [his/her] feelings and needs. We stayed close and helped [him/her] feel safe and supported. At home, you can try acknowledging [his/her] feelings first ("I see you're upset"), then offering simple choices when [he/she] is calm enough to hear you. These moments are actually opportunities for [him/her] to practice important emotional skills.`;
  }

  private normalizeLanguage(description: string): string {
    const guidelines = this.knowledgeBase.getLanguageGuidelines('tone');
    
    let normalized = description.toLowerCase();
    
    // Apply language transformations based on guidelines
    guidelines.forEach(guideline => {
      guideline.examples.forEach(example => {
        if (normalized.includes(example.avoid.toLowerCase())) {
          normalized = normalized.replace(example.avoid.toLowerCase(), example.preferred.toLowerCase());
        }
      });
    });
    
    return normalized;
  }

  private mapAgeGroup(ageGroup: string): string {
    const mapping: { [key: string]: string } = {
      'Infants (<2 years old)': 'infants',
      'Toddlers (2-3 years old)': 'toddlers',
      'Infants and Toddlers (0-3 years old)': 'toddlers',
      'Preschool (4-5 years old)': 'preschool',
      'Transitional Kindergarten (4-5 years old)': 'tk',
      'Kindergarten': 'kindergarten',
      'First Grade': 'kindergarten',
      'Second Grade': 'kindergarten',
      'Third Grade': 'kindergarten'
    };
    
    return mapping[ageGroup] || 'preschool';
  }

  private getDefaultChildStrategy(context: BehaviorContext): string {
    return `Try the "Connection Before Direction" approach: First, get down to the child's eye level and acknowledge their feelings with simple, warm words like "I see you're having a hard time." Then, offer two simple choices that both lead to the same positive outcome. This respects their growing autonomy while maintaining necessary boundaries.`;
  }

  private getDefaultClassroomStrategy(context: ClassroomContext): string {
    return `Implement a "Calm Down Together" routine: Use a visual cue (like dimming lights or playing soft music) to signal the whole group to take three deep breaths together. This creates collective regulation and teaches children that everyone sometimes needs to reset. Follow with a simple, engaging activity that rebuilds positive group energy.`;
  }
}

// Global AI engine instance
export const lumiAIEngine = new LumiAIEngine();