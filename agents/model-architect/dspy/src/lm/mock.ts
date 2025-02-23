import { LMDriver } from "../lm.ts";

export class MockLM extends LMDriver {
  async generate(prompt: string): Promise<string> {
    return `Suggested Improvements:
- Add batch normalization after convolutional layers
- Increase number of filters in conv layers
- Add dropout for regularization

Bottlenecks:
- Limited model capacity
- Potential overfitting
- High memory usage`;
  }
}
