import { getLM } from "./lm.ts";
import { ModuleSignature, validateInput, validateOutput } from "./signature.ts";

export abstract class Module {
  private signature: ModuleSignature;

  constructor(signature: ModuleSignature) {
    this.signature = signature;
  }

  abstract forward(inputs: Record<string, any>): Promise<Record<string, any>>;

  async run(inputs: Record<string, any>): Promise<Record<string, any>> {
    // Validate inputs
    if (!validateInput(this.signature.inputs, inputs)) {
      throw new Error(`Invalid inputs for module ${this.signature.name}`);
    }

    // Run forward pass
    const outputs = await this.forward(inputs);

    // Validate outputs
    if (!validateOutput(this.signature.outputs, outputs)) {
      throw new Error(`Invalid outputs from module ${this.signature.name}`);
    }

    return outputs;
  }

  getSignature(): ModuleSignature {
    return this.signature;
  }

  protected async generateText(prompt: string): Promise<string> {
    const lm = getLM();
    return await lm.generate(prompt);
  }
}
