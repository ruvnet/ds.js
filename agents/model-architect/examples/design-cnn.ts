import { AutonomousArchitectAgent } from "../src/autonomous.ts";
import { OptimizationConstraints } from "../src/types/index.ts";

function getConstraints(): OptimizationConstraints {
  return {
    maxParameters: 1000000,
    maxMemory: 1000,
    minAccuracy: 0.95,
    maxLatency: 50,
    minThroughput: 100,
    framework: "pytorch",
    quantization: {
      precision: "fp16" as const,
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
    maxIterations: 10,
    earlyStoppingPatience: 3,
    crossValidationFolds: 5
  };
}

async function runExample() {
  console.log("\nDesigning CNN architecture...\n");
  
  const constraints = getConstraints();
  console.log("Design Constraints:");
  console.log(JSON.stringify(constraints, null, 2));

  const agent = new AutonomousArchitectAgent({
    task: "image_classification",
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

// Run the example
runExample();
