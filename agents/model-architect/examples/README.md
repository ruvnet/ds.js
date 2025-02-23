# Model Architect Examples

This directory contains examples demonstrating how to use the Model Architect agent.

## Training and Exporting Models

The `train-and-export.ts` example shows how to:
1. Create a model architecture
2. Train the model using js-pytorch
3. Export the trained model to ONNX format

### Usage

For testing with mock implementation:
```bash
USE_MOCK=true deno run --allow-net --allow-env --allow-write --allow-read --config deno.json examples/train-and-export.ts
```

For actual training and export:
```bash
deno run --allow-net --allow-env --allow-write --allow-read --config deno.json examples/train-and-export.ts
```

### Prerequisites

For actual training (when not using mock):
1. Install js-pytorch:
```bash
npm install js-pytorch
```

2. Prepare your training data:
- Create a custom Dataset class that extends torch.utils.data.Dataset
- Implement the required methods (__len__, __getitem__)
- Format your data to match the expected input shape (e.g., [3, 224, 224] for RGB images)

Example dataset implementation:
```typescript
class CustomDataset extends torch.utils.data.Dataset {
  constructor(data: any[], labels: number[]) {
    super();
    this.data = data;
    this.labels = labels;
  }

  __len__(): number {
    return this.data.length;
  }

  __getitem__(idx: number): [torch.Tensor, torch.Tensor] {
    // Preprocess your data here
    const input = torch.tensor(this.data[idx]);
    const label = torch.tensor([this.labels[idx]]);
    return [input, label];
  }
}
```

### Configuration

The example supports two modes:
- Testing mode (USE_MOCK=true): Uses mock implementation for testing the workflow
- Training mode (USE_MOCK=false): Uses actual js-pytorch for training and export

### Model Architecture

The example includes a sample CNN architecture for image classification:
- 2 Conv2D layers with BatchNormalization and ReLU activation
- 2 MaxPooling2D layers for downsampling
- Dense layers with Dropout for classification
- Configurable input/output shapes and layer parameters

### Export Format

The model is exported in ONNX format with:
- Dynamic batch size support
- Named input/output tensors
- Accompanying metadata file containing:
  - Task information
  - Framework details
  - Quantization settings
  - Performance metrics

### Output Files

The example creates two files in the `models/image_classification` directory:

1. `model.onnx`: Contains the model architecture in ONNX format
2. `metadata.json`: Contains model metadata including:
   - Task type (image_classification)
   - Framework (pytorch)
   - Quantization settings
   - Performance metrics (parameter count, latency, throughput, etc.)

### Customization

To customize the model:
1. Modify the architecture configuration in `train-and-export.ts`
2. Adjust training parameters (epochs, batch size, learning rate)
3. Update the metadata to match your model's characteristics
4. Implement your own Dataset class for data loading and preprocessing

### Other Examples

- `design-cnn.ts`: Demonstrates using the Model Architect agent to design CNN architectures
- `optimize-cnn.ts`: Shows how to optimize model architectures for specific constraints
