import { LMDriver, GenerationOptions, LMError } from './base';

/**
 * DummyLM provides a mock implementation of the LM interface.
 * Useful for testing and as a fallback during development.
 */
export class DummyLM implements LMDriver {
  private initialized: boolean = false;
  private responses: Map<string, string>;

  constructor(customResponses?: Map<string, string>) {
    this.responses = customResponses || new Map();
  }

  /**
   * Initialize the dummy LM
   */
  public async init(): Promise<void> {
    this.initialized = true;
  }

  /**
   * Generate a response based on the prompt.
   * Returns either a custom response if defined, or a default response.
   */
  public async generate(prompt: string, options?: GenerationOptions): Promise<string> {
    if (!this.initialized) {
      throw new LMError('DummyLM not initialized. Call init() first.');
    }

    // If a custom response is defined for this prompt, return it
    if (this.responses.has(prompt)) {
      return this.responses.get(prompt)!;
    }

    // Generate a deterministic but unique response based on the prompt
    return this.generateDefaultResponse(prompt, options);
  }

  /**
   * Clean up any resources (no-op for DummyLM)
   */
  public async cleanup(): Promise<void> {
    this.initialized = false;
  }

  /**
   * Add or update a custom response for a specific prompt
   */
  public setResponse(prompt: string, response: string): void {
    this.responses.set(prompt, response);
  }

  /**
   * Clear all custom responses
   */
  public clearResponses(): void {
    this.responses.clear();
  }

  /**
   * Generate a default response for prompts without custom responses
   */
  private generateDefaultResponse(prompt: string, options?: GenerationOptions): string {
    const maxTokens = options?.maxTokens || 100;
    return `DummyLM response for prompt: "${prompt}" (limited to ${maxTokens} tokens)`;
  }
}
