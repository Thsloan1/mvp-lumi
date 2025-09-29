import React, { useState } from 'react';
import { MessageCircle, Download, Copy, Check, FileText, Globe } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { Child, BehaviorLog } from '../../types';
import { generateComprehensiveFamilyScript } from '../../utils/familyScriptGenerator';

interface FamilyScriptGeneratorProps {
  child?: Child;
  behaviorLog?: BehaviorLog;
  onSave?: (script: string) => void;
}

export const FamilyScriptGenerator: React.FC<FamilyScriptGeneratorProps> = ({
  child,
  behaviorLog,
  onSave
}) => {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<'english' | 'spanish'>('english');
  const [scriptData, setScriptData] = useState({
    parentName: '',
    childName: child?.name || '',
    context: behaviorLog?.context || '',
    behaviorDescription: behaviorLog?.behaviorDescription || '',
    strategiesUsed: behaviorLog?.selectedStrategy || '',
    outcome: '',
    additionalNotes: ''
  });

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' }
  ];

  const generateComprehensiveScript = async () => {
    setLoading(true);
    
    try {
      // Generate comprehensive family script
      const script = generateComprehensiveFamilyScript({
        child: child || {
          id: 'temp',
          name: scriptData.childName,
          gradeBand: 'Preschool (4-5 years old)',
          classroomId: 'temp',
          hasIEP: false,
          hasIFSP: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        behaviorLog: behaviorLog || {
          id: 'temp',
          educatorId: currentUser?.id || '',
          childId: 'temp',
          behaviorDescription: 'general classroom behavior',
          context: scriptData.context || 'classroom activities',
          severity: 'medium' as 'low' | 'medium' | 'high',
          stressors: [],
          createdAt: new Date()
        },
        parentName: scriptData.parentName,
        language,
        additionalNotes: scriptData.additionalNotes
      });
      
      setGeneratedScript(script);
    } catch (error) {
      console.error('Error generating script:', error);
      // Fallback to basic script generation
      const fallbackScript = generateBasicScript();
      setGeneratedScript(fallbackScript);
    } finally {
      setLoading(false);
    }
  };

  const generateBasicScript = (): string => {
    const childName = scriptData.childName || '[Child Name]';
    const parentName = scriptData.parentName || '[Parent Name]';
    const context = scriptData.context || 'during classroom activities';
    const behavior = scriptData.behaviorDescription || 'had some challenging moments';
    
    if (language === 'spanish') {
      return generateSpanishScript(childName, parentName, context, behavior);
    }

    return `Hi ${parentName},

I wanted to share some observations about ${childName} and the wonderful progress we're seeing together.

**1. Context/Trigger:**
Today during ${context}, ${childName} ${behavior}. This happened when we were transitioning between activities, which is a common time when children need extra support.

**2. Understanding What's Happening:**
This behavior is completely normal for children ${childName}'s age. ${childName} is learning to navigate big feelings and express needs, which shows healthy emotional development. What we're seeing is ${childName} working hard to communicate and manage emotions - this is actually a sign of growth.

**3. Core Needs & Developmental Stage:**
${childName} is expressing a need for predictability, connection, and support during transitions. This aligns perfectly with typical development for children this age, as their executive function and emotional regulation systems are still developing rapidly. ${childName} is right on track developmentally.

**4. Connection & Support:**
To help ${childName} feel safe and supported, we've been getting down to eye level, using a calm voice, and staying physically close during challenging moments. We acknowledge feelings with simple words like "I see you're having a hard time" and provide comfort through our calm presence.

**5. Practical Strategies:**
Here are the specific approaches we're using:
• **Connection First**: We prioritize emotional safety before any directions or expectations
• **Choice Within Structure**: We offer ${childName} two good choices that both lead to positive outcomes
• **Visual Supports**: We use timers and visual cues to help with transitions
• **Calm Partnership**: Sometimes we simply stay near ${childName} without speaking, letting our presence provide comfort

**6. How to Use These Strategies:**
We start with connection and safety first. Once ${childName} is calm, we then try the practical strategies. We're giving each approach a few days to see how it works, and we adjust based on what ${childName} responds to best.

**7. Why These Strategies Work:**
These approaches are grounded in attachment theory and developmental neuroscience. They work because they address ${childName}'s underlying needs for safety and connection rather than just the surface behavior. This helps ${childName} build lasting skills for emotional regulation.

**8. Long-term Benefits:**
These strategies help ${childName} develop emotional regulation, problem-solving skills, and trust in adult relationships - all essential foundations for future learning and social success. ${childName} is building skills that will serve well throughout life.

I'd love to hear your thoughts and learn what works well for ${childName} at home. Your insights help us create consistency between home and school.

Warm regards,
${currentUser?.fullName}`;
  };

  const generateSpanishScript = (childName: string, parentName: string, context: string, behavior: string): string => {
    return `Hola ${parentName},

Quería compartir algunas observaciones sobre ${childName} y el maravilloso progreso que estamos viendo juntos.

**1. Contexto/Desencadenante:**
Hoy durante ${context}, ${childName} ${behavior}. Esto sucedió cuando estábamos haciendo la transición entre actividades, que es un momento común cuando los niños necesitan apoyo adicional.

**2. Entendiendo lo que está pasando:**
Este comportamiento es completamente normal para niños de la edad de ${childName}. ${childName} está aprendiendo a navegar grandes sentimientos y expresar necesidades, lo que muestra un desarrollo emocional saludable.

**3. Necesidades Fundamentales y Etapa de Desarrollo:**
${childName} está expresando una necesidad de predictibilidad, conexión y apoyo durante las transiciones. Esto se alinea perfectamente con el desarrollo típico para niños de esta edad.

**4. Conexión y Apoyo:**
Para ayudar a ${childName} a sentirse seguro y apoyado, nos hemos estado poniendo a la altura de sus ojos, usando una voz calmada, y manteniéndonos físicamente cerca durante momentos desafiantes.

**5. Estrategias Prácticas:**
Aquí están los enfoques específicos que estamos usando:
• **Conexión Primero**: Priorizamos la seguridad emocional antes que cualquier dirección
• **Opciones Dentro de Estructura**: Ofrecemos a ${childName} dos buenas opciones
• **Apoyos Visuales**: Usamos temporizadores y señales visuales
• **Compañía Tranquila**: A veces simplemente nos quedamos cerca de ${childName}

**6. Cómo Usar Estas Estrategias:**
Comenzamos con conexión y seguridad primero. Una vez que ${childName} está calmado, entonces probamos las estrategias prácticas.
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(generatedScript);
    }
    // In real implementation, save to child's profile
    console.log('Saving script to child profile:', { childId: child?.id, script: generatedScript });
  };

  const downloadAsPDF = () => {
    // In real implementation, this would generate and download PDF
    console.log('Downloading PDF:', { childName: scriptData.childName, language });
  };

  return (
    <div className="space-y-8">
      {/* Script Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Family Communication Generator
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Input
            label="Parent/Family Name"
            value={scriptData.parentName}
            onChange={(value) => setScriptData(prev => ({ ...prev, parentName: value }))}
            placeholder="Enter parent or family name"
          />
          
          <Input
            label="Child's Name"
            value={scriptData.childName}
            onChange={(value) => setScriptData(prev => ({ ...prev, childName: value }))}
            placeholder="Enter child's name"
            disabled={!!child}
          />
          
          <Select
            label="Language"
            value={language}
            onChange={(value) => setLanguage(value as 'english' | 'spanish')}
            options={languageOptions}
          />
          
          <Input
            label="Additional Notes (Optional)"
            value={scriptData.additionalNotes}
            onChange={(value) => setScriptData(prev => ({ ...prev, additionalNotes: value }))}
            placeholder="Any specific details to include..."
          />
        </div>

        {behaviorLog && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">
              Based on Recent Behavior Log:
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Behavior:</strong> {behaviorLog.behaviorDescription}</p>
              <p><strong>Context:</strong> {behaviorLog.context}</p>
              {behaviorLog.selectedStrategy && (
                <p><strong>Strategy Used:</strong> {behaviorLog.selectedStrategy.substring(0, 100)}...</p>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={generateComprehensiveScript}
          loading={loading}
          icon={MessageCircle}
          className="w-full"
          size="lg"
        >
          Generate Comprehensive Family Communication
        </Button>
      </Card>

      {/* Generated Script */}
      {generatedScript && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Generated Family Communication
              {language === 'spanish' && (
                <span className="ml-2 flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                  <Globe className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Spanish</span>
                </span>
              )}
            </h3>
            <div className="flex space-x-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                icon={copied ? Check : Copy}
                className={copied ? 'text-green-600' : ''}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                onClick={downloadAsPDF}
                variant="outline"
                size="sm"
                icon={Download}
              >
                Download PDF
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                icon={FileText}
              >
                Save to Profile
              </Button>
            </div>
          </div>
          
          <div className="bg-white border border-[#E6E2DD] rounded-xl p-6 max-h-96 overflow-y-auto">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {generatedScript}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
  }
}