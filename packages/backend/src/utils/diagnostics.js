/**
 * diagnostics.js
 *
 * Boot-time environment and configuration diagnostics for CampOS.
 * Verifies that all critical services and secrets are properly configured
 * before the server begins accepting traffic.
 */

const CHECK_PASS = '✅';
const CHECK_WARN = '⚠️ ';
const CHECK_FAIL = '❌';

/**
 * Runs all diagnostics checks and prints a structured report to the console.
 * Exits the process with code 1 if any critical check fails.
 *
 * @param {object} env - The frozen env config object from config/env.js
 */
export const runDiagnostics = (env) => {
  const results = [];
  let hasCriticalFailure = false;

  // ─── Helper ─────────────────────────────────────────────────────────────────
  const check = (label, status, note = '') => {
    results.push({ label, status, note });
    if (status === 'FAIL') hasCriticalFailure = true;
  };

  // ─── Critical Checks ─────────────────────────────────────────────────────────

  // MongoDB URI
  if (env.MONGODB_URI && env.MONGODB_URI.startsWith('mongodb')) {
    check('MongoDB URI', 'PASS');
  } else {
    check('MongoDB URI', 'FAIL', 'MONGODB_URI is missing or malformed.');
  }

  // JWT Secrets
  if (env.JWT_ACCESS_SECRET && env.JWT_ACCESS_SECRET.length >= 32) {
    check('JWT Access Secret', 'PASS');
  } else {
    check('JWT Access Secret', 'FAIL', 'JWT_ACCESS_SECRET must be at least 32 characters.');
  }

  if (env.JWT_REFRESH_SECRET && env.JWT_REFRESH_SECRET.length >= 32) {
    check('JWT Refresh Secret', 'PASS');
  } else {
    check('JWT Refresh Secret', 'FAIL', 'JWT_REFRESH_SECRET must be at least 32 characters.');
  }

  // ─── Warning Checks ──────────────────────────────────────────────────────────

  // Gemini API Key (optional but required for CampAi features)
  if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 10) {
    check('Gemini API Key (CampAi)', 'PASS');
  } else {
    check('Gemini API Key (CampAi)', 'WARN', 'GEMINI_API_KEY not set — CampAi chat & flashcard features will be disabled.');
  }

  // CORS Origin
  if (env.CORS_ORIGIN) {
    check('CORS Origin', 'PASS', env.CORS_ORIGIN);
  } else {
    check('CORS Origin', 'WARN', 'Defaulting to http://localhost:5173');
  }

  // Node Environment
  if (env.NODE_ENV === 'production') {
    check('Environment', 'PASS', 'production');
  } else {
    check('Environment', 'WARN', `Running in "${env.NODE_ENV}" mode — not suitable for public deployment.`);
  }

  // Port
  check('Server Port', 'PASS', `${env.PORT}`);

  // ─── Print Report ────────────────────────────────────────────────────────────
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│         CampOS Boot Diagnostics             │');
  console.log('└─────────────────────────────────────────────┘');

  for (const { label, status, note } of results) {
    const icon = status === 'PASS' ? CHECK_PASS : status === 'WARN' ? CHECK_WARN : CHECK_FAIL;
    const noteStr = note ? `  → ${note}` : '';
    console.log(`  ${icon}  ${label.padEnd(28)}${noteStr}`);
  }

  console.log('─────────────────────────────────────────────\n');

  if (hasCriticalFailure) {
    console.error('❌ Critical configuration errors detected. Please fix the above issues and restart.\n');
    process.exit(1);
  }
};
