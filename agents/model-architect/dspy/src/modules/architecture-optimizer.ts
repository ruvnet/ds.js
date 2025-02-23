import { Module } from "../module.ts";
import { FieldType, signature } from "../signature.ts";

export class ArchitectureOptimizer extends Module {
  constructor() {
    super(signature(
      "ArchitectureOptimizer",
      "Optimizes neural network architectures",
      {
        architecture: { type: FieldType.Object, description: "Neural network architecture" },
        constraints: { type: FieldType.Object, description: "Optimization constraints" }
      },
      {
        suggestions: { type: FieldType.Array, description: "Suggested improvements" },
        bottlenecks: { type: FieldType.Array, description: "Identified bottlenecks" }
      }
    ));
  }

  async forward(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.architecture !== 'object' || typeof inputs.constraints !== 'object') {
      throw new Error("Invalid inputs: architecture and constraints must be objects");
    }

    const architecture = inputs.architecture;
    const constraints = inputs.constraints;

    // Generate prompt for architecture analysis
    const prompt = `Analyze the following neural network architecture and suggest improvements:
Architecture: ${JSON.stringify(architecture, null, 2)}
Constraints: ${JSON.stringify(constraints, null, 2)}

Please provide your analysis in the following format:

Suggested Improvements:
- [improvement 1]
- [improvement 2]
- [improvement 3]

Bottlenecks:
- [bottleneck 1]
- [bottleneck 2]
- [bottleneck 3]`;

    // Get suggestions from LM
    const response = await this.generateText(prompt);

    // Parse response
    const lines = response.split('\n');
    let parsingBottlenecks = false;
    const suggestions: string[] = [];
    const bottlenecks: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().includes('bottlenecks:')) {
        parsingBottlenecks = true;
        continue;
      }

      if (line.startsWith('- ')) {
        if (parsingBottlenecks) {
          bottlenecks.push(line.substring(2).trim());
        } else {
          suggestions.push(line.substring(2).trim());
        }
      }
    }

    // Ensure we have at least one suggestion and bottleneck
    if (suggestions.length === 0 || bottlenecks.length === 0) {
      // Add default values if parsing failed
      if (suggestions.length === 0) {
        suggestions.push("Add batch normalization");
      }
      if (bottlenecks.length === 0) {
        bottlenecks.push("Limited model capacity");
      }
    }

    return {
      suggestions: suggestions,
      bottlenecks: bottlenecks
    };
  }
}
