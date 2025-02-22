/**
 * Configuration options for LM generation
 */
export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

/**
 * Abstract interface for language model drivers.
 * All LM implementations must implement this interface.
 */
export interface LMDriver {
  /**
   * Generate output based on the input prompt.
   * @param prompt - The input prompt text
   * @param options - Optional generation parameters
   * @returns A promise that resolves to the generated text
   */
  generate(prompt: string, options?: GenerationOptions): Promise<string>;

  /**
   * Optional method to initialize any resources needed by the LM
   */
  init?(): Promise<void>;

  /**
   * Optional method to clean up resources
   */
  cleanup?(): Promise<void>;
}

/**
 * Error class for LM-related errors
 */
export class LMError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'LMError';
  }
}
