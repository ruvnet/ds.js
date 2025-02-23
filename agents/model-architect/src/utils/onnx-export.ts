import type { ModelArchitecture } from "../types/index.ts";
import { torch } from "./mock-pytorch.ts";
import { ensureDir } from "https://deno.land/std@0.220.1/fs/mod.ts";
import { join } from "https://deno.land/std@0.220.1/path/mod.ts";

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

class Model extends torch.nn.Module {
  layers: torch.nn.Module[];

  constructor(architecture: ModelArchitecture) {
    super();
    this.layers = this.buildLayers(architecture.layers as Layer[]);
  }

  forward(x: any): any {
    for (const layer of this.layers) {
      x = layer.forward(x);
    }
    return x;
  }

  private buildLayers(layers: Layer[]): torch.nn.Module[] {
    const modules: torch.nn.Module[] = [];
    
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      
      switch (layer.type) {
        case "Conv2D": {
          const conv = new torch.nn.Conv2D(layer.filters, layer.kernelSize);
          modules.push(conv);
          if (layer.activation === "relu") {
            modules.push(new torch.nn.ReLU());
          }
          break;
        }
        case "MaxPooling2D": {
          const pool = new torch.nn.MaxPooling2D(layer.kernelSize);
          modules.push(pool);
          break;
        }
        case "Flatten": {
          const flatten = new torch.nn.Flatten();
          modules.push(flatten);
          break;
        }
        case "Dense": {
          const inFeatures = i === 0 ? 1 : (layers[i-1] as DenseLayer).units ?? (layers[i-1] as Conv2DLayer).filters;
          const linear = new torch.nn.Linear(inFeatures, layer.units);
          modules.push(linear);
          if (layer.activation === "relu") {
            modules.push(new torch.nn.ReLU());
          }
          break;
        }
        default:
          console.warn(`Layer type ${layer.type} not yet supported in js-pytorch`);
          break;
      }
    }

    return modules;
  }
}

/**
 * Export model architecture to ONNX format
 */
export async function exportToOnnx(
  architecture: ModelArchitecture,
  outputPath: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    // Create model instance
    const model = new Model(architecture);
    
    // Create dummy input tensor
    const dummyInput = torch.tensor(
      new Array(architecture.inputShape.reduce((a: number, b: number) => a * b, 1)).fill(0),
      false
    );

    // Create output directory and save files
    try {
      // Create directory
      await ensureDir(outputPath);
      
      // Save model
      await torch.save(model, join(outputPath, 'model.onnx'));
      
      // Save metadata
      await Deno.writeTextFile(
        join(outputPath, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      console.log("Successfully exported model to ONNX format");
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to save files: ${error.message}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to export model: ${errorMessage}`);
  }
}
