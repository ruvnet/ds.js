import { ModelArchitecture } from "../types/index.ts";

interface Conv2DLayer {
  type: "Conv2D";
  filters: number;
  kernelSize: [number, number];
  activation?: string;
}

interface MaxPooling2DLayer {
  type: "MaxPooling2D";
  kernelSize: [number, number];
}

interface BatchNormalizationLayer {
  type: "BatchNormalization";
}

interface FlattenLayer {
  type: "Flatten";
}

interface DenseLayer {
  type: "Dense";
  units: number;
  activation?: string;
}

interface DropoutLayer {
  type: "Dropout";
  rate: number;
}

type Layer = Conv2DLayer | MaxPooling2DLayer | BatchNormalizationLayer | FlattenLayer | DenseLayer | DropoutLayer;

/**
 * Export model architecture to ONNX format
 */
export async function exportToOnnx(
  architecture: ModelArchitecture,
  outputPath: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const pythonScript = generatePythonScript(architecture, metadata);
  
  // Create output directory if it doesn't exist
  await Deno.mkdir(outputPath, { recursive: true });
  
  // Write Python script
  const scriptPath = `${outputPath}/create_model.py`;
  await Deno.writeTextFile(scriptPath, pythonScript);
  
  // Execute Python script
  const command = new Deno.Command("python3", {
    args: [scriptPath],
    stdout: "piped",
    stderr: "piped"
  });
  
  try {
    const { code, stdout, stderr } = await command.output();
    
    if (code !== 0) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Failed to export ONNX model: ${error}`);
    }
    
    console.log("Successfully exported model to ONNX format");
  } catch (error) {
    if (error instanceof Error && error.message.includes("can't open file")) {
      // Create models directory if it doesn't exist
      await Deno.mkdir("models", { recursive: true });
      // Try again with relative path
      const command = new Deno.Command("python3", {
        args: ["./create_model.py"],
        stdout: "piped",
        stderr: "piped"
      });
      const { code, stdout, stderr } = await command.output();
      if (code !== 0) {
        const error = new TextDecoder().decode(stderr);
        throw new Error(`Failed to export ONNX model: ${error}`);
      }
      console.log("Successfully exported model to ONNX format");
    } else {
      throw error;
    }
  }
}

/**
 * Generate Python script for ONNX export
 */
function generatePythonScript(
  architecture: ModelArchitecture,
  metadata: Record<string, unknown>
): string {
  const layers = architecture.layers as Layer[];
  const inputShape = architecture.inputShape;
  const outputShape = architecture.outputShape;

  return `
import torch
import torch.nn as nn

class Model(nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        self.layers = nn.ModuleList([
${generateLayerCode(layers)}
        ])
        
    def forward(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

# Create model instance
model = Model()

# Create dummy input
x = torch.randn(1, ${inputShape[2]}, ${inputShape[0]}, ${inputShape[1]})

# Export to ONNX
torch.onnx.export(
    model,
    x,
    "model.onnx",
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={
        "input": {0: "batch_size"},
        "output": {0: "batch_size"}
    },
    opset_version=12
)

# Save metadata
import json
with open("metadata.json", "w") as f:
    json.dump(${JSON.stringify(metadata)}, f, indent=2)
`;
}

/**
 * Generate PyTorch layer code
 */
function generateLayerCode(layers: Layer[]): string {
  return layers.map((layer, i) => {
    switch (layer.type) {
      case "Conv2D": {
        const inChannels = i === 0 ? 3 : (layers[i-1] as Conv2DLayer).filters;
        return `            nn.Conv2d(
                in_channels=${inChannels},
                out_channels=${layer.filters},
                kernel_size=(${layer.kernelSize[0]}, ${layer.kernelSize[1]})
            )${layer.activation ? `,\n            nn.ReLU()` : ""}`;
      }
      
      case "MaxPooling2D":
        return `            nn.MaxPool2d(
                kernel_size=(${layer.kernelSize[0]}, ${layer.kernelSize[1]})
            )`;
      
      case "BatchNormalization":
        return `            nn.BatchNorm2d(
                num_features=${(layers[i-1] as Conv2DLayer).filters}
            )`;
      
      case "Flatten":
        return `            nn.Flatten()`;
      
      case "Dense": {
        const inFeatures = i === 0 ? 1 : (layers[i-1] as DenseLayer).units ?? (layers[i-1] as Conv2DLayer).filters;
        return `            nn.Linear(
                in_features=${inFeatures},
                out_features=${layer.units}
            )${layer.activation ? `,\n            nn.ReLU()` : ""}`;
      }
      
      case "Dropout":
        return `            nn.Dropout(p=${layer.rate})`;
      
      default:
        throw new Error(`Unsupported layer type: ${(layer as Layer).type}`);
    }
  }).join(",\n");
}
