// Field-level encryption service for sensitive data
export class EncryptionService {
  private static readonly ENCRYPTION_KEY = 'lumi-encryption-key-2024';
  
  // Encrypt sensitive text data
  static async encryptText(plaintext: string): Promise<string> {
    try {
      // In production, use Web Crypto API or server-side encryption
      // For demo, use base64 encoding with a prefix to indicate encryption
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      const base64 = btoa(String.fromCharCode(...data));
      return `enc_${base64}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  // Decrypt sensitive text data
  static async decryptText(encryptedText: string): Promise<string> {
    try {
      if (!encryptedText.startsWith('enc_')) {
        // Data not encrypted, return as-is (for backward compatibility)
        return encryptedText;
      }
      
      const base64 = encryptedText.substring(4);
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  // Encrypt behavior log data
  static async encryptBehaviorLog(behaviorData: any): Promise<any> {
    const encryptedData = { ...behaviorData };
    
    // Encrypt sensitive fields
    if (behaviorData.behaviorDescription) {
      encryptedData.behaviorDescription = await this.encryptText(behaviorData.behaviorDescription);
    }
    
    if (behaviorData.developmentalNotes) {
      encryptedData.developmentalNotes = await this.encryptText(behaviorData.developmentalNotes);
    }
    
    if (behaviorData.reflectionNotes) {
      encryptedData.reflectionNotes = await this.encryptText(behaviorData.reflectionNotes);
    }
    
    return encryptedData;
  }

  // Decrypt behavior log data
  static async decryptBehaviorLog(encryptedData: any): Promise<any> {
    const decryptedData = { ...encryptedData };
    
    // Decrypt sensitive fields
    if (encryptedData.behaviorDescription) {
      decryptedData.behaviorDescription = await this.decryptText(encryptedData.behaviorDescription);
    }
    
    if (encryptedData.developmentalNotes) {
      decryptedData.developmentalNotes = await this.decryptText(encryptedData.developmentalNotes);
    }
    
    if (encryptedData.reflectionNotes) {
      decryptedData.reflectionNotes = await this.decryptText(encryptedData.reflectionNotes);
    }
    
    return decryptedData;
  }

  // Encrypt child profile data
  static async encryptChildProfile(childData: any): Promise<any> {
    const encryptedData = { ...childData };
    
    // Encrypt sensitive fields
    if (childData.developmentalNotes) {
      encryptedData.developmentalNotes = await this.encryptText(childData.developmentalNotes);
    }
    
    if (childData.familyContext) {
      encryptedData.familyContext = await this.encryptText(childData.familyContext);
    }
    
    if (childData.medicalNotes) {
      encryptedData.medicalNotes = await this.encryptText(childData.medicalNotes);
    }
    
    return encryptedData;
  }

  // Decrypt child profile data
  static async decryptChildProfile(encryptedData: any): Promise<any> {
    const decryptedData = { ...encryptedData };
    
    // Decrypt sensitive fields
    if (encryptedData.developmentalNotes) {
      decryptedData.developmentalNotes = await this.decryptText(encryptedData.developmentalNotes);
    }
    
    if (encryptedData.familyContext) {
      decryptedData.familyContext = await this.decryptText(encryptedData.familyContext);
    }
    
    if (encryptedData.medicalNotes) {
      decryptedData.medicalNotes = await this.decryptText(encryptedData.medicalNotes);
    }
    
    return decryptedData;
  }

  // Check if data contains PHI
  static detectPHI(text: string): { containsPHI: boolean; phiType?: string; confidence: number } {
    const lowerText = text.toLowerCase();
    
    // PHI detection patterns
    const phiPatterns = {
      mental_health: [
        'therapy', 'counseling', 'mental health', 'psychiatric', 'psychological',
        'depression', 'anxiety', 'adhd', 'autism', 'behavioral disorder'
      ],
      medical: [
        'medication', 'medicine', 'doctor', 'physician', 'medical', 'diagnosis',
        'treatment', 'hospital', 'clinic', 'prescription'
      ],
      developmental_disability: [
        'disability', 'special needs', 'developmental delay', 'cognitive impairment',
        'intellectual disability', 'learning disability'
      ],
      therapy_notes: [
        'speech therapy', 'occupational therapy', 'physical therapy', 'behavioral therapy',
        'intervention', 'therapeutic', 'treatment plan'
      ]
    };
    
    let maxConfidence = 0;
    let detectedType = '';
    
    for (const [type, patterns] of Object.entries(phiPatterns)) {
      const matches = patterns.filter(pattern => lowerText.includes(pattern)).length;
      const confidence = (matches / patterns.length) * 100;
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedType = type;
      }
    }
    
    return {
      containsPHI: maxConfidence > 20, // 20% threshold for PHI detection
      phiType: maxConfidence > 20 ? detectedType : undefined,
      confidence: maxConfidence
    };
  }

  // Validate encryption key strength
  static validateEncryptionKey(key: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (key.length < 32) {
      errors.push('Encryption key must be at least 32 characters');
    }
    
    if (!/[A-Z]/.test(key)) {
      errors.push('Encryption key must contain uppercase letters');
    }
    
    if (!/[a-z]/.test(key)) {
      errors.push('Encryption key must contain lowercase letters');
    }
    
    if (!/[0-9]/.test(key)) {
      errors.push('Encryption key must contain numbers');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(key)) {
      errors.push('Encryption key must contain special characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}