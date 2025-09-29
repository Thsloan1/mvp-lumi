import { Child, BehaviorLog, AIStrategyResponse } from '../types';

interface ScriptGenerationParams {
  child: Child;
  behaviorLog: BehaviorLog;
  parentName: string;
  language: 'english' | 'spanish';
  additionalNotes?: string;
}

export const generateComprehensiveFamilyScript = ({
  child,
  behaviorLog,
  parentName,
  language,
  additionalNotes
}: ScriptGenerationParams): string => {
  if (language === 'spanish') {
    return generateSpanishScript({ child, behaviorLog, parentName, additionalNotes });
  }
  
  return generateEnglishScript({ child, behaviorLog, parentName, additionalNotes });
};

const generateEnglishScript = ({ child, behaviorLog, parentName, additionalNotes }: Omit<ScriptGenerationParams, 'language'>): string => {
  const childName = child.name;
  const context = behaviorLog.context.replace(/_/g, ' ').toLowerCase();
  const behavior = behaviorLog.behaviorDescription;
  const aiResponse = behaviorLog.aiResponse as AIStrategyResponse;

  return `Hi ${parentName},

I wanted to share some observations about ${childName} and the wonderful progress we're seeing together.

**1. Context/Trigger:**
Today during ${context}, ${childName} ${behavior}. This happened when we were ${getContextDescription(behaviorLog.context)}, which is a common time when children need extra support.

**2. Understanding What's Happening:**
${aiResponse?.conceptualization || `This behavior is completely normal for children ${childName}'s age. ${childName} is learning to navigate big feelings and express needs, which shows healthy emotional development. What we're seeing is ${childName} working hard to communicate and manage emotions - this is actually a sign of growth.`}

**3. Core Needs & Developmental Stage:**
${aiResponse?.coreNeedsAndDevelopment || `${childName} is expressing a need for predictability, connection, and support during transitions. This aligns perfectly with typical development for children this age, as their executive function and emotional regulation systems are still developing rapidly. ${childName} is right on track developmentally.`}

**4. Connection & Support:**
${aiResponse?.attachmentSupport || `To help ${childName} feel safe and supported, we've been getting down to eye level, using a calm voice, and staying physically close during challenging moments. We acknowledge feelings with simple words like "I see you're having a hard time" and provide comfort through our calm presence.`}

**5. Practical Strategies:**
Here are the specific approaches we're using:
${aiResponse?.practicalStrategies?.map(strategy => `• ${strategy}`).join('\n') || 
`• **Connection First**: We prioritize emotional safety before any directions or expectations
• **Choice Within Structure**: We offer ${childName} two good choices that both lead to positive outcomes
• **Visual Supports**: We use timers and visual cues to help with transitions
• **Calm Partnership**: Sometimes we simply stay near ${childName} without speaking, letting our presence provide comfort`}

**6. How to Use These Strategies:**
${aiResponse?.implementationGuidance || `We start with connection and safety first. Once ${childName} is calm, we then try the practical strategies. We're giving each approach a few days to see how it works, and we adjust based on what ${childName} responds to best.`}

**7. Why These Strategies Work:**
${aiResponse?.whyStrategiesWork || `These approaches are grounded in attachment theory and developmental neuroscience. They work because they address ${childName}'s underlying needs for safety and connection rather than just the surface behavior. This helps ${childName} build lasting skills for emotional regulation.`}

**8. Long-term Benefits:**
${aiResponse?.futureReadinessBenefit || `These strategies help ${childName} develop emotional regulation, problem-solving skills, and trust in adult relationships - all essential foundations for future learning and social success. ${childName} is building skills that will serve well throughout life.`}

${additionalNotes ? `\n**Additional Notes:**\n${additionalNotes}\n` : ''}

I'd love to hear your thoughts and learn what works well for ${childName} at home. Your insights help us create consistency between home and school.

What have you found that helps ${childName} when they're feeling ${getBehaviorEmotion(behavior)}? Are there particular words, routines, or comfort items that seem to help them feel better?

Warm regards,
[Teacher Name]`;
};

const generateSpanishScript = ({ child, behaviorLog, parentName, additionalNotes }: Omit<ScriptGenerationParams, 'language'>): string => {
  const childName = child.name;
  const context = behaviorLog.context.replace(/_/g, ' ').toLowerCase();
  const behavior = behaviorLog.behaviorDescription;
  const aiResponse = behaviorLog.aiResponse as AIStrategyResponse;

  return `Hola ${parentName},

Quería compartir algunas observaciones sobre ${childName} y el maravilloso progreso que estamos viendo juntos.

**1. Contexto/Desencadenante:**
Hoy durante ${context}, ${childName} ${behavior}. Esto sucedió cuando estábamos ${getContextDescriptionSpanish(behaviorLog.context)}, que es un momento común cuando los niños necesitan apoyo adicional.

**2. Entendiendo lo que está pasando:**
Este comportamiento es completamente normal para niños de la edad de ${childName}. ${childName} está aprendiendo a navegar grandes sentimientos y expresar necesidades, lo que muestra un desarrollo emocional saludable. Lo que estamos viendo es ${childName} trabajando duro para comunicarse y manejar emociones - esto es en realidad una señal de crecimiento.

**3. Necesidades Fundamentales y Etapa de Desarrollo:**
${childName} está expresando una necesidad de predictibilidad, conexión y apoyo durante las transiciones. Esto se alinea perfectamente con el desarrollo típico para niños de esta edad, ya que sus sistemas de función ejecutiva y regulación emocional aún se están desarrollando rápidamente. ${childName} está en el camino correcto del desarrollo.

**4. Conexión y Apoyo:**
Para ayudar a ${childName} a sentirse seguro y apoyado, nos hemos estado poniendo a la altura de sus ojos, usando una voz calmada, y manteniéndonos físicamente cerca durante momentos desafiantes. Reconocemos los sentimientos con palabras simples como "Veo que estás teniendo un momento difícil" y proporcionamos consuelo a través de nuestra presencia calmada.

**5. Estrategias Prácticas:**
Aquí están los enfoques específicos que estamos usando:
• **Conexión Primero**: Priorizamos la seguridad emocional antes que cualquier dirección o expectativa
• **Opciones Dentro de Estructura**: Ofrecemos a ${childName} dos buenas opciones que ambas llevan a resultados positivos
• **Apoyos Visuales**: Usamos temporizadores y señales visuales para ayudar con las transiciones
• **Compañía Tranquila**: A veces simplemente nos quedamos cerca de ${childName} sin hablar, dejando que nuestra presencia proporcione consuelo

**6. Cómo Usar Estas Estrategias:**
Comenzamos con conexión y seguridad primero. Una vez que ${childName} está calmado, entonces probamos las estrategias prácticas. Estamos dando a cada enfoque unos días para ver cómo funciona, y ajustamos basado en lo que ${childName} responde mejor.

**7. Por Qué Funcionan Estas Estrategias:**
Estos enfoques están basados en la teoría del apego y la neurociencia del desarrollo. Funcionan porque abordan las necesidades subyacentes de ${childName} de seguridad y conexión en lugar de solo el comportamiento superficial. Esto ayuda a ${childName} a construir habilidades duraderas para la regulación emocional.

**8. Beneficios a Largo Plazo:**
Estas estrategias ayudan a ${childName} a desarrollar regulación emocional, habilidades para resolver problemas, y confianza en las relaciones con adultos - todas bases esenciales para el futuro aprendizaje y éxito social. ${childName} está construyendo habilidades que servirán bien a lo largo de la vida.

${additionalNotes ? `\n**Notas Adicionales:**\n${additionalNotes}\n` : ''}

Me encantaría escuchar sus pensamientos y aprender qué funciona bien para ${childName} en casa. Sus ideas nos ayudan a crear consistencia entre el hogar y la escuela.

¿Qué han encontrado que ayuda a ${childName} cuando se siente ${getBehaviorEmotionSpanish(behavior)}? ¿Hay palabras particulares, rutinas, o artículos de consuelo que parecen ayudarle a sentirse mejor?

Saludos cordiales,
[Nombre del Maestro]`;
};

const getContextDescription = (context: string): string => {
  const contextMap: Record<string, string> = {
    'circle_time': 'gathering for circle time',
    'transition': 'moving between activities',
    'free_play': 'during free play time',
    'meal_time': 'eating together',
    'cleanup': 'cleaning up our space',
    'arrival_drop_off': 'saying goodbye at drop-off',
    'outdoor_play': 'playing outside',
    'rest_nap_time': 'preparing for rest time'
  };
  
  return contextMap[context] || 'during classroom activities';
};

const getContextDescriptionSpanish = (context: string): string => {
  const contextMap: Record<string, string> = {
    'circle_time': 'reuniéndonos para el tiempo de círculo',
    'transition': 'moviéndonos entre actividades',
    'free_play': 'durante el tiempo de juego libre',
    'meal_time': 'comiendo juntos',
    'cleanup': 'limpiando nuestro espacio',
    'arrival_drop_off': 'despidiéndonos en la entrega',
    'outdoor_play': 'jugando afuera',
    'rest_nap_time': 'preparándonos para el tiempo de descanso'
  };
  
  return contextMap[context] || 'durante las actividades del aula';
};

const getBehaviorEmotion = (behavior: string): string => {
  const lowerBehavior = behavior.toLowerCase();
  if (lowerBehavior.includes('frustrated') || lowerBehavior.includes('angry')) return 'frustrated';
  if (lowerBehavior.includes('sad') || lowerBehavior.includes('crying')) return 'sad';
  if (lowerBehavior.includes('overwhelmed') || lowerBehavior.includes('overstimulated')) return 'overwhelmed';
  if (lowerBehavior.includes('excited') || lowerBehavior.includes('energetic')) return 'excited';
  return 'upset';
};

const getBehaviorEmotionSpanish = (behavior: string): string => {
  const lowerBehavior = behavior.toLowerCase();
  if (lowerBehavior.includes('frustrated') || lowerBehavior.includes('angry')) return 'frustrado';
  if (lowerBehavior.includes('sad') || lowerBehavior.includes('crying')) return 'triste';
  if (lowerBehavior.includes('overwhelmed') || lowerBehavior.includes('overstimulated')) return 'abrumado';
  if (lowerBehavior.includes('excited') || lowerBehavior.includes('energetic')) return 'emocionado';
  return 'molesto';
};

// Auto-generate family script from strategy response
export const autoGenerateFamilyScript = async (
  child: Child,
  behaviorLog: BehaviorLog,
  language: 'english' | 'spanish' = 'english'
): Promise<string> => {
  try {
    return await AIService.generateFamilyScript({
      child,
      behaviorLog,
      parentName: '[Parent Name]',
      language,
      additionalNotes: undefined
    });
  } catch (error) {
    console.error('Error auto-generating family script:', error);
    // Fallback to static generation
    return generateComprehensiveFamilyScript({
      child,
      behaviorLog,
      parentName: '[Parent Name]',
      language,
      additionalNotes: undefined
    });
  }
};