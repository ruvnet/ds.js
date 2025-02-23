/// <reference lib="deno.ns" />

import {
  ModelArchitecture,
  AgentConfig,
  ChatMessage,
  FeedbackPrompt,
  FeedbackResponse,
  TrainingConfig,
  QuantizationConfig,
  ONNXExportConfig
} from "./types/index.ts";

import { architectTools, ArchitectTools } from "./tools/architect.ts";
import { optimizeTools, OptimizeTools } from "./tools/optimize.ts";
import { quantizeTools, QuantizeTools } from "./tools/quantize.ts";

const API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL = Deno.env.get("OPENROUTER_MODEL") || "openai/o3-mini-high";

if (!API_KEY) {
  console.error("Error: OPENROUTER_API_KEY is not set in environment.");
  Deno.exit(1);
}

/**
 * Interactive Model Architect Agent
 */
export class InteractiveArchitectAgent {
  private config: AgentConfig;
  private messages: ChatMessage[] = [];

  constructor(config: Partial<AgentConfig>) {
    this.config = {
      mode: "interactive",
      task: "",
      ...config
    };

    // Initialize system prompt
    this.messages.push({
      role: "system",
      content: this.buildSystemPrompt()
    });
  }

  /**
   * Design and optimize a model architecture with human feedback
   */
  async run(): Promise<ModelArchitecture> {
    try {
      // 1. Design initial architecture
      console.log("Designing initial architecture...");
      const architecture = await this.designInitialArchitecture();

      // 2. Get feedback on initial design
      const approvedArchitecture = await this.getFeedbackOnArchitecture(
        architecture,
        "Initial Architecture"
      );

      // 3. Optimize architecture
      console.log("\nOptimizing architecture...");
      const optimizedArchitecture = await this.optimizeArchitecture(approvedArchitecture);

      // 4. Get feedback on optimization
      const approvedOptimized = await this.getFeedbackOnArchitecture(
        optimizedArchitecture,
        "Optimized Architecture"
      );

      // 5. Quantize model if approved
      console.log("\nProposing quantization...");
      const quantizedArchitecture = await this.quantizeWithApproval(approvedOptimized);

      // 6. Export to ONNX if approved
      console.log("\nProposing ONNX export...");
      await this.exportToONNXWithApproval(quantizedArchitecture);

      return quantizedArchitecture;
    } catch (error) {
      console.error("Error in interactive architect agent:", error);
      throw error;
    }
  }

  /**
   * Get human feedback on architecture
   */
  private async getFeedbackOnArchitecture(
    architecture: ModelArchitecture,
    stage: string
  ): Promise<ModelArchitecture> {
    const prompt: FeedbackPrompt = {
      type: "architecture",
      description: `${stage} Review`,
      currentValue: architecture,
      suggestedValue: architecture
    };

    console.log(`\n=== ${stage} ===`);
    console.log(JSON.stringify(architecture, null, 2));
    console.log("\nDo you want to modify this architecture? (y/n)");

    const response = await this.getUserInput();
    if (response.toLowerCase() === "y") {
      console.log("\nEnter modified architecture (JSON format):");
      const modifiedJson = await this.getUserInput();
      try {
        return JSON.parse(modifiedJson);
      } catch (error) {
        console.error("Invalid JSON. Using original architecture.");
        return architecture;
      }
    }

    return architecture;
  }

  /**
   * Quantize model with human approval
   */
  private async quantizeWithApproval(
    architecture: ModelArchitecture
  ): Promise<ModelArchitecture> {
    console.log("\nProposed Quantization Config:");
    const quantConfig: QuantizationConfig = {
      precision: "fp16",
      layerWise: true
    };
    console.log(JSON.stringify(quantConfig, null, 2));
    console.log("\nProceed with quantization? (y/n)");

    const response = await this.getUserInput();
    if (response.toLowerCase() === "y") {
      const result = await QuantizeTools.quantizeModel(
        architecture,
        quantConfig
      );

      if (!result.success || !result.result?.architecture) {
        throw new Error("Failed to quantize model");
      }

      return result.result.architecture;
    }

    return architecture;
  }

  /**
   * Export to ONNX with human approval
   */
  private async exportToONNXWithApproval(
    architecture: ModelArchitecture
  ): Promise<void> {
    console.log("\nProposed ONNX Export Config:");
    const exportConfig: ONNXExportConfig = {
      filename: "model.onnx",
      opset: 13,
      optimizationLevel: 1
    };
    console.log(JSON.stringify(exportConfig, null, 2));
    console.log("\nProceed with ONNX export? (y/n)");

    const response = await this.getUserInput();
    if (response.toLowerCase() === "y") {
      const result = await QuantizeTools.exportONNX(
        architecture,
        exportConfig
      );

      if (!result.success) {
        throw new Error("Failed to export to ONNX");
      }
    }
  }

  /**
   * Get user input from stdin
   */
  private async getUserInput(): Promise<string> {
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    if (n === null) {
      return "";
    }
    return new TextDecoder().decode(buf.subarray(0, n)).trim();
  }

  // Rest of the methods are same as autonomous agent
  private async designInitialArchitecture(): Promise<ModelArchitecture> {
    const result = await ArchitectTools.designArchitecture(
      this.config.task,
      this.getInputShape(),
      this.getOutputShape(),
      this.config.constraints
    );

    if (!result.success || !result.result?.architecture) {
      throw new Error("Failed to design initial architecture");
    }

    return result.result.architecture;
  }

  private async optimizeArchitecture(
    architecture: ModelArchitecture
  ): Promise<ModelArchitecture> {
    // 1. Profile current performance
    const profileResult = await OptimizeTools.profilePerformance(
      architecture,
      this.getDefaultTrainingConfig()
    );

    if (!profileResult.success) {
      throw new Error("Failed to profile architecture");
    }

    // 2. Perform architecture search
    const searchResult = await OptimizeTools.searchArchitecture(
      architecture,
      this.config.constraints ?? {},
      this.getSearchSpace()
    );

    if (!searchResult.success || !searchResult.result?.architecture) {
      throw new Error("Failed to optimize architecture");
    }

    // 3. Optimize hyperparameters
    const hyperParamResult = await OptimizeTools.optimizeHyperparameters(
      searchResult.result.architecture,
      this.getDefaultTrainingConfig(),
      this.getSearchSpace(),
      this.config.constraints
    );

    if (!hyperParamResult.success) {
      throw new Error("Failed to optimize hyperparameters");
    }

    return searchResult.result.architecture;
  }

  private buildSystemPrompt(): string {
    const allTools = [
      ...architectTools,
      ...optimizeTools,
      ...quantizeTools
    ];

    const toolDescriptions = allTools
      .map(tool => `${tool.name}: ${tool.description}`)
      .join("\n");

    return `You are an interactive neural network architect agent. Your task is to design and optimize neural network architectures for ${this.config.task} with human feedback.

Available tools:
${toolDescriptions}

Follow these steps:
1. Design initial architecture based on task requirements
2. Get human feedback on initial design
3. Optimize architecture through search and profiling
4. Get human feedback on optimization
5. Propose quantization and get approval
6. Propose ONNX export and get approval

Use the tools to accomplish each step and incorporate human feedback.`;
  }

  private getDefaultTrainingConfig(): TrainingConfig {
    return {
      batchSize: 32,
      epochs: 10,
      learningRate: 0.001,
      optimizer: "adam",
      lossFunction: "categorical_crossentropy",
      metrics: ["accuracy"]
    };
  }

  private getSearchSpace(): any {
    return {
      batchSize: [16, 32, 64, 128],
      learningRate: [0.0001, 0.001, 0.01],
      epochs: [10, 50, 100],
      layers: {
        units: [32, 64, 128, 256],
        filters: [16, 32, 64, 128],
        kernelSize: [3, 5, 7]
      }
    };
  }

  private getInputShape(): number[] {
    switch (this.config.task) {
      case "image_classification":
        return [224, 224, 3];
      case "text_classification":
        return [512];
      default:
        throw new Error(`Unsupported task: ${this.config.task}`);
    }
  }

  private getOutputShape(): number[] {
    // For simplicity, assuming binary classification if not specified
    return [2];
  }
}

// CLI interface
if (import.meta.main) {
  const args = Deno.args;
  if (args.length < 1) {
    console.error("Usage: deno run --allow-net --allow-env interactive.ts <task> [dataset] [constraints]");
    Deno.exit(1);
  }

  const [task, dataset, constraintsStr] = args;
  const constraints = constraintsStr ? JSON.parse(constraintsStr) : undefined;

  const agent = new InteractiveArchitectAgent({
    task,
    dataset,
    constraints
  });

  console.log(`Designing model for task: ${task} (interactive mode)`);
  agent.run()
    .then(architecture => {
      console.log("\nFinal Architecture:");
      console.log(JSON.stringify(architecture, null, 2));
    })
    .catch(error => {
      console.error("Error:", error);
      Deno.exit(1);
    });
}
