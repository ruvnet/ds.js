import { ModelArchitecture } from "../types/index.ts";
import { ModelAnalysis } from "../types/metrics.ts";

/**
 * Build prompts for LLM interactions
 */
export class PromptBuilder {
  /**
   * Build prompt for analyzing model architecture
   */
  static buildAnalysisPrompt(
    architecture: ModelArchitecture,
    goals: Record<string, any>
  ): string {
    return `Analyze this neural network architecture and provide detailed metrics and suggestions for improvement. Return valid JSON with double-quoted property names and no comments:

Architecture:
${JSON.stringify(architecture, null, 2)}

Goals:
${JSON.stringify(goals, null, 2)}

Response format:
{
  "metrics": {
    "parameterCount": 1000000,
    "layerCount": 10,
    "computationalComplexity": "O(n^2)",
    "inferenceTime": 50,
    "estimatedMemoryUsage": 500,
    "estimatedGpuUtilization": 0.8,
    "memory": 500,
    "parameters": 1000000,
    "accuracy": 0.95,
    "latency": 50,
    "throughput": 100,
    "powerConsumption": 80
  },
  "bottlenecks": [
    {
      "layer": "Conv2D_1",
      "metric": "parameters",
      "value": 1000000,
      "recommendation": "Reduce filter count"
    }
  ],
  "suggestions": [
    {
      "type": "architecture",
      "description": "Add batch normalization",
      "expectedImpact": {
        "metric": "accuracy",
        "improvement": 0.02
      },
      "confidence": 0.8
    }
  ]
}`;
  }

  /**
   * Build prompt for generating improvement suggestions
   */
  static buildSuggestionsPrompt(
    architecture: ModelArchitecture,
    analysis: ModelAnalysis,
    goals: Record<string, any>
  ): string {
    return `Based on this architecture and analysis, suggest specific improvements. Return valid JSON with double-quoted property names and no comments:

Architecture:
${JSON.stringify(architecture, null, 2)}

Current Analysis:
${JSON.stringify(analysis, null, 2)}

Goals:
${JSON.stringify(goals, null, 2)}

Response format:
{
  "suggestions": [
    {
      "type": "architecture",
      "description": "Add batch normalization",
      "expectedImpact": {
        "metric": "accuracy",
        "improvement": 0.02
      },
      "confidence": 0.8
    }
  ]
}`;
  }

  /**
   * Build prompt for applying improvements
   */
  static buildImprovementsPrompt(
    architecture: ModelArchitecture,
    suggestions: ModelAnalysis["suggestions"]
  ): string {
    return `Apply these improvement suggestions to the architecture. Return a valid JSON object with the following structure:

Current Architecture:
${JSON.stringify(architecture, null, 2)}

Suggestions:
${JSON.stringify(suggestions, null, 2)}

Please return a JSON object with this exact structure:
{
  "layers": [
    {
      "type": "string",
      "filters"?: number,
      "kernelSize"?: [number, number],
      "activation"?: "relu" | "softmax",
      "units"?: number,
      "rate"?: number
    }
  ],
  "inputShape": [number, number, number],
  "outputShape": [number]
}

Make sure to:
1. Use double quotes for all property names and string values
2. Include commas between array elements and object properties
3. Close all arrays with ]
4. Close all objects with }
5. Format numbers without quotes
6. Only use the allowed properties for each layer type

Example response:
{
  "layers": [
    {
      "type": "Conv2D",
      "filters": 32,
      "kernelSize": [3, 3],
      "activation": "relu"
    },
    {
      "type": "BatchNormalization"
    }
  ],
  "inputShape": [224, 224, 3],
  "outputShape": [2]
}`;
  }

  /**
   * Build system prompt for LLM
   */
  static getSystemPrompt(): string {
    return "You are an expert neural network architect focused on optimizing model architectures. Always respond with valid JSON with double-quoted property names and no comments.";
  }
}
