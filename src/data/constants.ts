export const STRESSOR_OPTIONS = [
  // Stressors of Teacher/Educator
  'High ratios or large group sizes',
  'Staff turnover or absences',
  'Emotional fatigue or burnout',
  'Limited planning and preparation time',
  'Simultaneous behavior needs',
  'Parental expectations or disconnect',
  'Limited Family engagement',
  'Family communication style differences or disconnect',
  'Family language/cultural differences',
  'Classroom safety/ concerns',
  
  // Development and Behavior Stressors Brought into Classroom by Children
  'Separation challenges',
  'Strong emotional expressions',
  'Limited self-regulation',
  'Short attention spans',
  'Grief and loss experiences',
  'Peer conflicts',
  'Wide range of in developmental abilities',
  'Talking/expression difficulties',
  'Toileting struggles',
  'Sleep struggles',
  'Sensory under or over reactions',
  'Conflict between kids',
  
  // Family and Community Stressors
  'Food insecurity',
  'Employment insecurity/unemployment',
  'Housing insecurity/unhoused',
  'Community violence',
  'Domestic violence',
  'Incarceration',
  'Inconsistent routines',
  
  // Environment and System Influences
  'Limited or crowded classroom space',
  'TK transition pressures',
  'Resource limitations',
  'Administrative and policy demands',
  'Overwhelming Change/Unpredictability'
];

export const CONTEXT_OPTIONS = [
  'Arrival/Drop-off',
  'Circle Time',
  'Free Play',
  'Meal Time',
  'Transition',
  'Group Activity',
  'Outdoor Play',
  'Rest/Nap Time',
  'Cleanup',
  'Departure/Pick-up',
  'Other'
];

export const GRADE_BAND_OPTIONS = [
  'Infants (<2 years old)',
  'Toddlers (2-3 years old)',
  'Infants and Toddlers (0-3 years old)',
  'Preschool (4-5 years old)',
  'Transitional Kindergarten (4-5 years old)',
  'Kindergarten',
  'First Grade',
  'Second Grade',
  'Third Grade'
];

export const LEARNING_STYLE_OPTIONS = [
  'I learn best with visuals',
  'I prefer listening to explanations',
  'I like written step-by-step guides',
  'A mix of all works for me'
];

export const TEACHING_STYLE_OPTIONS = [
  'I talk, they listen',
  'We learn together',
  'I guide, they explore',
  'I set the stage, they take the lead'
];

export const SEVERITY_DESCRIPTORS = {
  low: 'Minor disruption, easily managed',
  medium: 'Moderate challenge, required attention',
  high: 'Significant disruption, immediate intervention needed'
};

export const TIME_OF_DAY_OPTIONS = [
  { value: 'morning', label: 'Morning (6:00 AM - 11:59 AM)' },
  { value: 'midday', label: 'Mid-day (12:00 PM - 2:59 PM)' },
  { value: 'afternoon', label: 'Afternoon (3:00 PM - 8:00 PM)' }
];

export const INTENSITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

export const DURATION_OPTIONS = [
  { value: 'brief', label: 'Brief (under 1 min)' },
  { value: 'short', label: 'Short (1-5 min)' },
  { value: 'extended', label: 'Extended (5-15 min)' },
  { value: 'prolonged', label: 'Prolonged (15+ min)' }
];

export const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-time' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'escalating', label: 'Escalating trend' }
];

export const ADULT_RESPONSE_OPTIONS = [
  'Comforted/soothed',
  'Redirected activity',
  'Set/Enforced limit',
  'Ignored behavior',
  'Removed child from situation',
  'Other'
];

export const OUTCOME_OPTIONS = [
  'Calmed down',
  'Escalated further',
  'Disengaged/withdrew',
  'Other'
];

export const CONTEXT_TRIGGER_OPTIONS = [
  'Transition',
  'Peer interaction/conflict',
  'Adult limit-setting',
  'Noise/overstimulation',
  'Waiting/sharing',
  'Separation/drop-off',
  'Other'
];