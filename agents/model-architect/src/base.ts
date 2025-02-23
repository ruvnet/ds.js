import { ModelArchitecture } from "./types/index.ts";

export abstract class ModelArchitectAgent {
  protected task: string;
  protected dataset?: string;

  constructor(config: {
    task: string;
    dataset?: string;
  }) {
    this.task = config.task;
    this.dataset = config.dataset;
  }

  abstract run(): Promise<ModelArchitecture>;
}
