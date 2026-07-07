/**
 * Zero-Trust Secret Auditing Script
 * Evaluates credentials strength, environment visibility, and checks for accidental exposures.
 */

interface CryptographicSecretDefinition {
  name: string;
  minLength: number;
  patternPrefix?: string;
  isSensitiveServerSecret: boolean;
}

const REQUIRED_SECRETS: CryptographicSecretDefinition[] = [
  {
    name: 'POLLINATIONS_APP_KEY',
    minLength: 16,
    patternPrefix: 'pk_',
    isSensitiveServerSecret: true
  },
  {
    name: 'UPSTASH_REDIS_REST_URL',
    minLength: 25,
    isSensitiveServerSecret: true
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    minLength: 25,
    isSensitiveServerSecret: true
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    minLength: 20,
    patternPrefix: 'AIzaSy',
    isSensitiveServerSecret: false // Public API key, safe for frontend exposure
  }
];

export function executeSecurityLockdownAudit(): void {
  // Only run in server environments to prevent browser bundle runtime failure
  if (typeof window !== 'undefined') return;

  console.log('[DevSecOps] Initializing Cryptographic Secret Verification Audit...');
  const validationErrors: string[] = [];

  for (const secret of REQUIRED_SECRETS) {
    const value = process.env[secret.name];

    // 1. Presence validation check
    if (!value) {
      validationErrors.push(`CRITICAL CONFIG FAILURE: ${secret.name} is missing in active environment variables.`);
      continue;
    }

    // 2. Length check
    if (value.length < secret.minLength) {
      validationErrors.push(`STRENGTH WARNING: ${secret.name} is too short (Length is ${value.length}, required min: ${secret.minLength}). Possible dummy value.`);
    }

    // 3. Prefix Pattern check (e.g., sk_, pk_, AIzaSy)
    if (secret.patternPrefix && !value.startsWith(secret.patternPrefix)) {
      validationErrors.push(`PATTERN ANOMALY: ${secret.name} does not match expected prefix pattern (Expected prefix: "${secret.patternPrefix}").`);
    }

    // 4. Verification of Client-Side Secret Leak
    // Verify that NO server-sensitive secrets are prefixed with NEXT_PUBLIC_ in process.env
    if (secret.isSensitiveServerSecret) {
      const publicEquivalentName = `NEXT_PUBLIC_${secret.name}`;
      if (process.env[publicEquivalentName]) {
        validationErrors.push(`EXPOSURE DANGER: Sensitive server credential ${secret.name} is exposed to browser bundles via ${publicEquivalentName}!`);
      }
    }
  }

  // Check for common default local dev settings in production
  if (process.env.NODE_ENV === 'production') {
    const dbHost = process.env.DATABASE_HOST || '';
    if (dbHost.includes('localhost') || dbHost.includes('127.0.0.1')) {
      validationErrors.push('ENVIRONMENT COLLISION: Localhost database endpoint configured in production mode.');
    }
  }

  if (validationErrors.length > 0) {
    console.error('\n======================================================================');
    console.error('     CRYPTOGRAPHIC SECRET CONFIGURATION AUDIT REPORT: CRITICAL FAILURES');
    console.error('======================================================================');
    validationErrors.forEach(err => console.error(` [!] ${err}`));
    console.error('======================================================================\n');
    
    // Prevent server bootstrap in production if severe vulnerability is detected
    // but bypass throwing errors during Next.js compile/build pre-rendering step.
    const isNextBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_IS_BUILDING === 'true';
    if (process.env.NODE_ENV === 'production' && !isNextBuild) {
      throw new Error('Lockdown active: Server startup aborted due to critical credential configuration failures.');
    } else {
      console.warn('[DevSecOps] Build phase or fallback detected. Strict runtime crash skipped.');
    }
  } else {
    console.log('[DevSecOps] Secret configuration audit completed. Status: SECURE.');
  }
}

// Automatically execute on import to guarantee verification at server startup
executeSecurityLockdownAudit();
