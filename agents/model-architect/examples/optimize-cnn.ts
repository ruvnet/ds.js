import { AutonomousArchitectAgent } from "../src/autonomous.ts";
import { OptimizationConstraints } from "../src/types/index.ts";

function getConstraints(iterations: number): OptimizationConstraints {
  return {
    maxParameters: 100000, // Reduced from 10M
    maxMemory: 500, // Reduced from 1000
    minAccuracy: 0.90, // Reduced from 0.95
    maxLatency: 30, // Reduced from 50
    minThroughput: 100,
    framework: "pytorch",
    quantization: {
      precision: "fp16",
      calibrationDataset: "validation"
    },
    allowedLayerTypes: [
      "Conv2D",
      "MaxPooling2D",
      "BatchNormalization",
      "ReLU",
      "Dropout",
      "Dense"
    ],
    skipConnections: true,
    optimizationMethod: "bayesian",
    maxIterations: iterations,
    earlyStoppingPatience: Math.min(iterations - 1, 5),
    crossValidationFolds: Math.min(iterations, 5)
  };
}

async function runExample(mode: string, task: string, iterations: number) {
  console.log(`\nOptimizing ${task} model in ${mode} mode with ${iterations} iterations...\n`);
  
  const constraints = getConstraints(iterations);
  console.log("Optimization Constraints:");
  console.log(JSON.stringify(constraints, null, 2));

  const agent = new AutonomousArchitectAgent({
    task,
    dataset: "CIFAR-10",
    constraints
  });

  try {
    await agent.run();
  } catch (error) {
    console.error("Error in model architect agent:", error);
    throw error;
  }
}

// Get command line arguments
const mode = Deno.args[0] || "auto";
const task = Deno.args[1] || "image_classification";
const iterations = parseInt(Deno.args[2] || "3", 10);

if (isNaN(iterations) || iterations < 1) {
  console.error("Error: iterations must be a positive number");
  Deno.exit(1);
}

// Run the example
runExample(mode, task, iterations);
