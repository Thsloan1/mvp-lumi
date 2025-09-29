// Curated Starter Library for Lumi MVP Core
import { Resource } from '../types';

export const STARTER_LIBRARY: Resource[] = [
  // Behavior Strategies
  {
    id: 'tantrum-support',
    title: 'Supporting Big Feelings: Tantrum Strategies',
    description: 'Gentle, connection-first approaches for when children have big emotional moments.',
    type: 'strategy',
    category: 'behavior',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)'],
    settings: ['classroom', 'home', 'childcare'],
    language: 'bilingual',
    isPremium: false,
    familyCompanionId: 'tantrum-support-family',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'tantrum-support-family',
    title: 'Apoyo para Grandes Sentimientos: Estrategias para Berrinches',
    description: 'Family companion guide with gentle strategies for supporting children through big emotions at home.',
    type: 'family_companion',
    category: 'behavior',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)'],
    settings: ['home'],
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'separation-anxiety',
    title: 'Easing Separation: Drop-off Strategies',
    description: 'Building security and trust during challenging drop-off moments.',
    type: 'strategy',
    category: 'behavior',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)'],
    settings: ['classroom', 'childcare'],
    language: 'bilingual',
    isPremium: false,
    familyCompanionId: 'separation-anxiety-family',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'separation-anxiety-family',
    title: 'Facilitando la Separación: Estrategias para la Despedida',
    description: 'Family guide for building confidence and security around drop-off routines.',
    type: 'family_companion',
    category: 'behavior',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)'],
    settings: ['home'],
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'sharing-conflicts',
    title: 'Learning to Share: Peer Conflict Strategies',
    description: 'Supporting children in developing sharing skills and resolving conflicts peacefully.',
    type: 'strategy',
    category: 'behavior',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['classroom', 'childcare', 'home'],
    language: 'bilingual',
    isPremium: false,
    familyCompanionId: 'sharing-conflicts-family',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'sharing-conflicts-family',
    title: 'Aprendiendo a Compartir: Estrategias para Conflictos entre Compañeros',
    description: 'Family strategies for teaching sharing and conflict resolution at home.',
    type: 'family_companion',
    category: 'behavior',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['home'],
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  // Transition Strategies
  {
    id: 'smooth-transitions',
    title: 'Smooth Transitions: Visual Cues & Countdowns',
    description: 'Making transitions predictable and calm with visual supports and preparation.',
    type: 'guide',
    category: 'transitions',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['classroom', 'childcare'],
    language: 'bilingual',
    isPremium: false,
    familyCompanionId: 'smooth-transitions-family',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'smooth-transitions-family',
    title: 'Transiciones Suaves: Señales Visuales y Conteos',
    description: 'Family guide for creating predictable transitions at home.',
    type: 'family_companion',
    category: 'transitions',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['home'],
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  // Routine Strategies
  {
    id: 'morning-routines',
    title: 'Calm Mornings: Arrival & Circle Time',
    description: 'Creating welcoming, predictable morning routines that set a positive tone.',
    type: 'guide',
    category: 'routines',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['classroom', 'childcare'],
    language: 'bilingual',
    isPremium: false,
    familyCompanionId: 'morning-routines-family',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'morning-routines-family',
    title: 'Mañanas Tranquilas: Llegada y Tiempo de Círculo',
    description: 'Family strategies for creating calm, predictable morning routines.',
    type: 'family_companion',
    category: 'routines',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['home'],
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'cleanup-strategies',
    title: 'Making Cleanup Fun: Engagement Strategies',
    description: 'Turning cleanup time into a positive, collaborative experience.',
    type: 'strategy',
    category: 'routines',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['classroom', 'childcare', 'home'],
    language: 'bilingual',
    isPremium: false,
    familyCompanionId: 'cleanup-strategies-family',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'cleanup-strategies-family',
    title: 'Haciendo Divertida la Limpieza: Estrategias de Participación',
    description: 'Family guide for making cleanup time positive and collaborative at home.',
    type: 'family_companion',
    category: 'routines',
    ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['home'],
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  // Communication Strategies
  {
    id: 'family-communication',
    title: 'Positive Family Communication Templates',
    description: 'Scripts and templates for sharing classroom observations with families in supportive ways.',
    type: 'toolkit',
    category: 'communication',
    ageGroups: ['Infants (<2 years old)', 'Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['classroom', 'childcare'],
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  // Development Guides
  {
    id: 'developmental-expectations',
    title: 'Age-Appropriate Expectations Guide',
    description: 'Understanding typical development to set realistic, supportive expectations.',
    type: 'guide',
    category: 'development',
    ageGroups: ['Infants (<2 years old)', 'Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['classroom', 'childcare', 'home'],
    language: 'bilingual',
    isPremium: false,
    familyCompanionId: 'developmental-expectations-family',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'developmental-expectations-family',
    title: 'Guía de Expectativas Apropiadas para la Edad',
    description: 'Family guide for understanding typical development and setting supportive expectations.',
    type: 'family_companion',
    category: 'development',
    ageGroups: ['Infants (<2 years old)', 'Toddlers (2-3 years old)', 'Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
    settings: ['home'],
    language: 'bilingual',
    isPremium: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const RESOURCE_CATEGORIES = [
  { id: 'behavior', label: 'Behavior Support', icon: '🤗' },
  { id: 'transitions', label: 'Transitions', icon: '🔄' },
  { id: 'routines', label: 'Daily Routines', icon: '📅' },
  { id: 'communication', label: 'Family Communication', icon: '💬' },
  { id: 'development', label: 'Child Development', icon: '🌱' }
];

export const RESOURCE_TYPES = [
  { id: 'strategy', label: 'Quick Strategy', icon: '⚡' },
  { id: 'guide', label: 'Educator Guide', icon: '📖' },
  { id: 'toolkit', label: 'Complete Toolkit', icon: '🧰' },
  { id: 'handout', label: 'Family Handout', icon: '📄' },
  { id: 'family_companion', label: 'Family Companion', icon: '👨‍👩‍👧‍👦' }
];

export const SETTINGS = [
  { id: 'classroom', label: 'Classroom' },
  { id: 'childcare', label: 'Childcare Center' },
  { id: 'home', label: 'Home/Family' },
  { id: 'outdoor', label: 'Outdoor/Playground' }
];