import { LMDriver, getLM } from './lm';
import { ModuleSignature, validateInput, validateOutput } from './signature';

/**
 * Base module class
 */
export abstract class Module {
  private signature: ModuleSignature;

  constructor(signature: ModuleSignature) {
    this.signature = signature;
  }

  /**
   * Get the current language model
   */
  protected getLM(): LMDriver {
    return getLM();
  }

  /**
   * Run the module with the given input
   */
  async run(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Validate input
    validateInput(this.signature.input, input);

    // Run forward pass
    const output = await this.forward(input);

    // Validate output
    validateOutput(this.signature.output, output);

    return output;
  }

  /**
   * Forward pass implementation
   */
  protected abstract forward(input: Record<string, unknown>): Promise<Record<string, unknown>>;
}
