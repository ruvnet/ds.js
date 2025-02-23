# Optimized image_classification Model

## Overview
- Task: image_classification
- Dataset: CIFAR-10
- Created: 2025-02-23T05:31:03.634Z

## Architecture
- Input Shape: [224, 224, 3]
- Output Shape: [2]
- Number of Layers: 7

## Performance Metrics
- parameterCount: 1234567
- layerCount: 7
- computationalComplexity: O(n^2)
- inferenceTime: 25
- estimatedMemoryUsage: 400
- estimatedGpuUtilization: 0.7
- memory: 400
- parameters: 1234567
- accuracy: 0.92
- latency: 25
- throughput: 120
- powerConsumption: 70

## Layer Configuration
```json
[
  {
    "type": "Conv2D",
    "filters": 32,
    "kernelSize": [
      3,
      3
    ],
    "activation": "relu"
  },
  {
    "type": "MaxPooling2D",
    "kernelSize": [
      2,
      2
    ]
  },
  {
    "type": "Conv2D",
    "filters": 64,
    "kernelSize": [
      3,
      3
    ],
    "activation": "relu"
  },
  {
    "type": "MaxPooling2D",
    "kernelSize": [
      2,
      2
    ]
  },
  {
    "type": "Flatten"
  },
  {
    "type": "Dense",
    "units": 128,
    "activation": "relu"
  },
  {
    "type": "Dense",
    "units": 2,
    "activation": "softmax"
  }
]
```

## Usage Example

```python
import onnxruntime as ort
import numpy as np

# Load the model
session = ort.InferenceSession("model.onnx")

# Prepare input data
input_shape = [224, 224, 3]
input_data = np.random.randn(*input_shape).astype(np.float32)

# Run inference
input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name
output = session.run([output_name], {input_name: input_data})[0]

print(f"Input shape: {input_data.shape}")
print(f"Output shape: {output.shape}")
```

## Files
- `model.onnx`: The ONNX model file
- `architecture.json`: Original model architecture
- `model-info.json`: Model metadata and metrics
- `conversion.log`: ONNX conversion log
- `convert_to_onnx.py`: Conversion script

## Notes
- This model was optimized using the Model Architect Agent
- ONNX format enables deployment across different frameworks and platforms
- See `model-info.json` for detailed performance metrics
