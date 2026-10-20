/**
 * Classroom and 8th-grade science competition text sanitization filter.
 * Ensures zero offensive, adult, sexual, or pregnancy-related terminology
 * appears anywhere in the application or in AI detection outputs.
 */

const SENSITIVE_WORDS_MAP: Record<string, string> = {
  // Pregnancy & maternity terms
  pregnancy: 'overall vitality',
  pregnant: 'sensitive individuals',
  lactation: 'wellness routines',
  breastfeeding: 'daily wellness',
  maternal: 'family wellness',
  uterine: 'smooth-muscle',
  uterus: 'abdomen',
  abortifacient: 'high-dose precaution',
  contraceptive: 'botanical precaution',
  menses: 'cycle wellness',
  menstruation: 'general comfort',
  menstrual: 'general comfort',
  fertility: 'botanical balance',
  reproduction: 'natural vigor',
  reproductive: 'vitality',

  // Sexual / adult terms
  sexual: 'physical',
  sexually: 'physically',
  aphrodisiac: 'vitality tonic',
  libido: 'daily stamina',
  erectile: 'circulatory',
  penis: 'tissue',
  vagina: 'tissue',
  vaginal: 'dermal',
  genital: 'dermal',
  genitalia: 'skin tissue',
  intercourse: 'activity',
  semen: 'cellular fluid',
  sperm: 'cellular',
  testicle: 'tissue',
  testicles: 'tissue',
  prostate: 'cellular health',
};

/**
 * Sanitizes a single string by replacing any sensitive or adult terms
 * with student-appropriate, wholesome scientific equivalents.
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return text || '';

  let sanitized = text;

  // Process word boundary replacements case-insensitively
  for (const [trigger, replacement] of Object.entries(SENSITIVE_WORDS_MAP)) {
    const regex = new RegExp(`\\b${trigger}\\b`, 'gi');
    sanitized = sanitized.replace(regex, (match) => {
      // Preserve first-letter capitalization if present
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return sanitized;
}

/**
 * Recursively traverses any object or array to sanitize all string fields.
 */
export function sanitizeData<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeText(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeData(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeData(value);
    }
    return result as T;
  }

  return input;
}
