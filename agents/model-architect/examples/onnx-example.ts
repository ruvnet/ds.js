import { PredictModule, configureLM, ONNXModel } from '../dspy/src/index.ts';

async function main() {
  // Initialize ONNX model
  const model = new ONNXModel('./models/text-generation.onnx');
  await model.initialize();

  // Configure global LM
  configureLM(model);

  // Create predict module
  const predictor = new PredictModule();

  // Make prediction
  const result = await predictor.run({
    prompt: 'What is the capital of France?',
    temperature: 0.7
  });

  console.log('Prediction:', result.prediction);
}

main().catch(console.error);
