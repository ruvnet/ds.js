import { Module, signature, input, output } from '../index';

/**
 * Module for making predictions using a language model
 */
export class PredictModule extends Module {
  constructor() {
    super(signature(
      [
        input('prompt', 'string', 'Input prompt for prediction'),
        input('temperature', 'number', 'Sampling temperature', false)
      ],
      [
        output('prediction', 'string', 'Generated prediction')
      ]
    ));
  }

  protected async forward(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const prompt = input.prompt as string;
    const temperature = (input.temperature as number) || 0.0;

    const prediction = await this.getLM().generate(prompt);

    return {
      prediction
    };
  }
}
