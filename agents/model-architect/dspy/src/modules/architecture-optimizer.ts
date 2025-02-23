import { Module, signature, input, output } from '../index';

/**
 * Module for optimizing neural network architectures
 */
export class ArchitectureOptimizer extends Module {
  constructor() {
    super(signature(
      [
        input('architecture', 'string', 'Neural network architecture in JSON format'),
        input('constraints', 'string', 'Optimization constraints in JSON format')
      ],
      [
        output('suggestions', 'array', 'List of suggested improvements'),
        output('bottlenecks', 'array', 'List of identified bottlenecks')
      ]
    ));
  }

  protected async forward(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const architecture = input.architecture as string;
    const constraints = input.constraints as string;

    const prompt = `Analyze the following neural network architecture and identify bottlenecks and improvements:
Architecture: ${architecture}
Constraints: ${constraints}

List bottlenecks in the format:
"LayerName: issue\n  Recommendation: solution"

List suggestions in the format:
"category: suggestion\n  Expected Impact: impact\n  Confidence: probability"`;

    const response = await this.getLM().generate(prompt);
    const lines = response.split('\n').filter(line => line.trim().length > 0);

    const bottlenecks: string[] = [];
    const suggestions: string[] = [];

    let currentSection = '';
    for (const line of lines) {
      if (line.toLowerCase().includes('bottleneck')) {
        currentSection = 'bottlenecks';
      } else if (line.toLowerCase().includes('suggestion')) {
        currentSection = 'suggestions';
      } else if (line.trim()) {
        if (currentSection === 'bottlenecks') {
          bottlenecks.push(line);
        } else if (currentSection === 'suggestions') {
          suggestions.push(line);
        }
      }
    }

    return {
      suggestions,
      bottlenecks
    };
  }
}
