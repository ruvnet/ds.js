import { AutonomousArchitectAgent } from "./src/autonomous.ts";
import { InteractiveArchitectAgent } from "./src/interactive.ts";
import { AgentConfig, ModelArchitecture } from "./src/types/index.ts";

export class Agent {
  private agent: AutonomousArchitectAgent | InteractiveArchitectAgent;

  constructor(config: AgentConfig) {
    if (config.mode === "autonomous") {
      this.agent = new AutonomousArchitectAgent(config);
    } else if (config.mode === "interactive") {
      this.agent = new InteractiveArchitectAgent(config);
    } else {
      throw new Error(`Invalid mode: ${config.mode}`);
    }
  }

  async run(): Promise<ModelArchitecture> {
    try {
      const result = await this.agent.run();
      if (this.agent instanceof AutonomousArchitectAgent) {
        // Convert void to ModelArchitecture for autonomous agent
        return {
          inputShape: this.getInputShape(this.agent.task),
          outputShape: this.getOutputShape(this.agent.task),
          layers: this.agent.layers
        };
      }
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unsupported task")) {
        throw error;
      }
      throw new Error(`Failed to run agent: ${error}`);
    }
  }

  private getInputShape(task: string): number[] {
    switch (task) {
      case "image_classification":
        return [224, 224, 3];
      case "text_classification":
        return [512];
      default:
        throw new Error(`Unsupported task type: ${task}`);
    }
  }

  private getOutputShape(task: string): number[] {
    switch (task) {
      case "image_classification":
        return [1000];
      case "text_classification":
        return [2];
      default:
        throw new Error(`Unsupported task type: ${task}`);
    }
  }
}
