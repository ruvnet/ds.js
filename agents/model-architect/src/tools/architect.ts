import { 
  ModelArchitecture, 
  LayerConfig, 
  ToolSchema,
  ToolResponse,
  ArchitectError
} from "../types/index.ts";

/**
 * Tool schemas for architecture design operations
 */
export const architectTools: ToolSchema[] = [
  {
    name: "design_architecture",
    description: "Design a complete neural network architecture based on task requirements",
    parameters: {
      task: {
        type: "string",
        description: "The task type (e.g., image_classification, text_classification)",
        required: true
      },
      inputShape: {
        type: "array",
        description: "Input shape dimensions",
        required: true
      },
      outputShape: {
        type: "array",
        description: "Output shape dimensions",
        required: true
      },
      constraints: {
        type: "object",
        description: "Optional architecture constraints",
        required: false
      }
    },
    returns: {
      type: "object",
      description: "Complete model architecture specification",
      properties: {
        architecture: {
          type: "object",
          description: "ModelArchitecture object"
        }
      }
    }
  },
  {
    name: "add_layer",
    description: "Add a new layer to the architecture",
    parameters: {
      architecture: {
        type: "object",
        description: "Current model architecture",
        required: true
      },
      layer: {
        type: "object",
        description: "Layer configuration to add",
        required: true
      },
      position: {
        type: "number",
        description: "Position to insert layer (default: end)",
        required: false
      }
    },
    returns: {
      type: "object",
      description: "Updated model architecture",
      properties: {
        architecture: {
          type: "object",
          description: "ModelArchitecture object"
        }
      }
    }
  },
  {
    name: "remove_layer",
    description: "Remove a layer from the architecture",
    parameters: {
      architecture: {
        type: "object",
        description: "Current model architecture",
        required: true
      },
      position: {
        type: "number",
        description: "Position of layer to remove",
        required: true
      }
    },
    returns: {
      type: "object",
      description: "Updated model architecture",
      properties: {
        architecture: {
          type: "object",
          description: "ModelArchitecture object"
        }
      }
    }
  },
  {
    name: "modify_layer",
    description: "Modify an existing layer's configuration",
    parameters: {
      architecture: {
        type: "object",
        description: "Current model architecture",
        required: true
      },
      position: {
        type: "number",
        description: "Position of layer to modify",
        required: true
      },
      updates: {
        type: "object",
        description: "Layer configuration updates",
        required: true
      }
    },
    returns: {
      type: "object",
      description: "Updated model architecture",
      properties: {
        architecture: {
          type: "object",
          description: "ModelArchitecture object"
        }
      }
    }
  },
  {
    name: "add_skip_connection",
    description: "Add a skip connection between layers",
    parameters: {
      architecture: {
        type: "object",
        description: "Current model architecture",
        required: true
      },
      fromLayer: {
        type: "number",
        description: "Starting layer index",
        required: true
      },
      toLayer: {
        type: "number",
        description: "Ending layer index",
        required: true
      }
    },
    returns: {
      type: "object",
      description: "Updated model architecture",
      properties: {
        architecture: {
          type: "object",
          description: "ModelArchitecture object"
        }
      }
    }
  }
];

/**
 * Tool implementations
 */
export class ArchitectTools {
  /**
   * Design a complete neural network architecture
   */
  static async designArchitecture(
    task: string,
    inputShape: number[],
    outputShape: number[],
    constraints?: any
  ): Promise<ToolResponse> {
    try {
      let architecture: ModelArchitecture;

      switch (task) {
        case "image_classification": {
          architecture = {
            inputShape,
            outputShape,
            layers: [
              {
                type: "Conv2D",
                filters: 32,
                kernelSize: [3, 3],
                activation: "relu"
              },
              {
                type: "MaxPooling2D",
                kernelSize: [2, 2]
              },
              {
                type: "Conv2D",
                filters: 64,
                kernelSize: [3, 3],
                activation: "relu"
              },
              {
                type: "MaxPooling2D",
                kernelSize: [2, 2]
              },
              {
                type: "Flatten"
              },
              {
                type: "Dense",
                units: 128,
                activation: "relu"
              },
              {
                type: "Dense",
                units: outputShape[0],
                activation: "softmax"
              }
            ]
          };
          break;
        }

        case "text_classification": {
          architecture = {
            inputShape,
            outputShape,
            layers: [
              {
                type: "Embedding",
                units: 100
              },
              {
                type: "LSTM",
                units: 128
              },
              {
                type: "Dense",
                units: 64,
                activation: "relu"
              },
              {
                type: "Dense",
                units: outputShape[0],
                activation: "softmax"
              }
            ]
          };
          break;
        }

        default:
          throw new ArchitectError(`Unsupported task type: ${task}`, "UNSUPPORTED_TASK");
      }

      return {
        success: true,
        result: { architecture }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Add a new layer to the architecture
   */
  static async addLayer(
    architecture: ModelArchitecture,
    layer: LayerConfig,
    position?: number
  ): Promise<ToolResponse> {
    try {
      const newArchitecture = { ...architecture };
      const insertPos = position ?? newArchitecture.layers.length;
      
      newArchitecture.layers = [
        ...newArchitecture.layers.slice(0, insertPos),
        layer,
        ...newArchitecture.layers.slice(insertPos)
      ];

      return {
        success: true,
        result: { architecture: newArchitecture }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Remove a layer from the architecture
   */
  static async removeLayer(
    architecture: ModelArchitecture,
    position: number
  ): Promise<ToolResponse> {
    try {
      if (position < 0 || position >= architecture.layers.length) {
        throw new ArchitectError("Invalid layer position", "INVALID_POSITION");
      }

      const newArchitecture = { ...architecture };
      newArchitecture.layers = [
        ...newArchitecture.layers.slice(0, position),
        ...newArchitecture.layers.slice(position + 1)
      ];

      // Remove any skip connections involving this layer
      if (newArchitecture.skipConnections) {
        newArchitecture.skipConnections = newArchitecture.skipConnections.filter(
          conn => conn.from !== position && conn.to !== position
        );
      }

      return {
        success: true,
        result: { architecture: newArchitecture }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Modify an existing layer's configuration
   */
  static async modifyLayer(
    architecture: ModelArchitecture,
    position: number,
    updates: Partial<LayerConfig>
  ): Promise<ToolResponse> {
    try {
      if (position < 0 || position >= architecture.layers.length) {
        throw new ArchitectError("Invalid layer position", "INVALID_POSITION");
      }

      const newArchitecture = { ...architecture };
      newArchitecture.layers = [...architecture.layers];
      newArchitecture.layers[position] = {
        ...newArchitecture.layers[position],
        ...updates
      };

      return {
        success: true,
        result: { architecture: newArchitecture }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Add a skip connection between layers
   */
  static async addSkipConnection(
    architecture: ModelArchitecture,
    fromLayer: number,
    toLayer: number
  ): Promise<ToolResponse> {
    try {
      if (
        fromLayer < 0 ||
        fromLayer >= architecture.layers.length ||
        toLayer < 0 ||
        toLayer >= architecture.layers.length ||
        fromLayer >= toLayer
      ) {
        throw new ArchitectError("Invalid skip connection layers", "INVALID_SKIP_CONNECTION");
      }

      const newArchitecture = { ...architecture };
      newArchitecture.skipConnections = [
        ...(newArchitecture.skipConnections || []),
        { from: fromLayer, to: toLayer }
      ];

      return {
        success: true,
        result: { architecture: newArchitecture }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}
