import { LMDriver, LMError } from './lm/base';
import { DummyLM } from './lm/dummy';

// Global variable to hold the LM driver
let globalLM: LMDriver | null = null;

/**
 * Configure the global language model driver
 */
export function configureLM(lm: LMDriver): void {
  globalLM = lm;
}

/**
 * Get the currently configured LM driver
 * @throws {LMError} if no LM is configured
 */
export function getLM(): LMDriver {
  if (!globalLM) {
    throw new LMError('No language model configured. Call configureLM() first.');
  }
  return globalLM;
}

// Export LM-related types and implementations
export { LMDriver, GenerationOptions, LMError } from './lm/base';
export { DummyLM } from './lm/dummy';
