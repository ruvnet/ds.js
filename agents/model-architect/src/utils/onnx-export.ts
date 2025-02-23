import type { ModelArchitecture } from "../types/index.ts";
import { torch } from "js-pytorch";
import { ensureDir } from "std/fs/ensure_dir.ts";
import { join } from "std/path/mod.ts";

interface BaseLayer {
  type: string;
  inChannels?: number;
  filters?: number;
  kernelSize?: [number, number];
  activation?: string;
  units?: number;
  rate?: number;
}

interface Conv2DLayer extends BaseLayer {
  type: "Conv2D";
  filters: number;
  kernelSize: [number, number];
  activation?: string;
}

interface MaxPooling2DLayer extends BaseLayer {
  type: "MaxPooling2D";
  kernelSize: [number, number];
}

interface BatchNormalizationLayer extends BaseLayer {
  type: "BatchNormalization";
}

interface FlattenLayer extends BaseLayer {
  type: "Flatten";
}

interface DenseLayer extends BaseLayer {
  type: "Dense";
  units: number;
  activation?: string;
}

interface DropoutLayer extends BaseLayer {
  type: "Dropout";
  rate: number;
}

type Layer = Conv2DLayer | MaxPooling2DLayer | BatchNormalizationLayer | FlattenLayer | DenseLayer | DropoutLayer;

function isConv2DLayer(layer: Layer): layer is Conv2DLayer {
  return layer.type === "Conv2D";
}

function isDenseLayer(layer: Layer): layer is DenseLayer {
  return layer.type === "Dense";
}

class Model extends torch.nn.Module {
  layers: torch.nn.Module[];

  constructor(architecture: ModelArchitecture) {
    super();
    this.layers = this.buildLayers(architecture.layers as Layer[]);
  }

  forward(x: torch.Tensor): torch.Tensor {
    for (const layer of this.layers) {
      x = layer.forward(x);
    }
    return x;
  }

  parameters(): torch.Parameter[] {
    return [];
  }

  train(): void {}

  private buildLayers(layers: Layer[]): torch.nn.Module[] {
    const modules: torch.nn.Module[] = [];
    
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const prevLayer = i > 0 ? layers[i-1] : null;
      
      switch (layer.type) {
        case "Conv2D": {
          const inChannels = layer.inChannels || (i === 0 ? 3 : prevLayer?.filters);
          if (!inChannels) throw new Error("Could not determine input channels for Conv2D layer");
          
          const conv = new torch.nn.Conv2d(
            inChannels,
            layer.filters,
            layer.kernelSize
          );
          modules.push(conv);
          if (layer.activation === "relu") {
            modules.push(new torch.nn.ReLU());
          }
          break;
        }
        case "MaxPooling2D": {
          const pool = new torch.nn.MaxPool2d(layer.kernelSize);
          modules.push(pool);
          break;
        }
        case "BatchNormalization": {
          const features = i === 0 ? 3 : prevLayer?.filters;
          if (!features) throw new Error("Could not determine features for BatchNorm layer");
          
          const bn = new torch.nn.BatchNorm2d(features);
          modules.push(bn);
          break;
        }
        case "Flatten": {
          modules.push(new torch.nn.Flatten());
          break;
        }
        case "Dense": {
          const inFeatures = i === 0 ? 1 : prevLayer?.units ?? prevLayer?.filters;
          if (!inFeatures) throw new Error("Could not determine input features for Dense layer");
          
          const linear = new torch.nn.Linear(inFeatures, layer.units);
          modules.push(linear);
          if (layer.activation === "relu") {
            modules.push(new torch.nn.ReLU());
          }
          break;
        }
        case "Dropout": {
          modules.push(new torch.nn.Dropout(layer.rate));
          break;
        }
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
    const dummyInput = torch.randn(architecture.inputShape);

    // Create output directory
    try {
      // Create directory
      await ensureDir(outputPath);
      
      // Save model
      await torch.onnx.exportModel(
        model,
        dummyInput,
        join(outputPath, 'model.onnx'),
        {
          input_names: ['input'],
          output_names: ['output'],
          dynamic_axes: {
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
          }
        }
      );
      
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
