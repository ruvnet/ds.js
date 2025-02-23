import { SentimentClassifier, createModel, initializeWeights } from '../../examples/onnx/create-model';
import { nn, tensor, device, load } from '../../examples/onnx/mock-pytorch';
import * as fs from 'fs';

jest.mock('fs', () => ({
  writeFileSync: jest.fn()
}));

describe('ONNX Model Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create model with correct architecture', () => {
    const model = new SentimentClassifier(11, 16);
    expect(model.fc1).toBeDefined();
    expect(model.relu).toBeDefined();
    expect(model.fc2).toBeDefined();
  });

  test('should forward pass through model', () => {
    const model = new SentimentClassifier(11, 16);
    const input = tensor(Array(11).fill(0));
    const output = model.forward(input);
    expect(output).toBeDefined();
  });

  test('should export model and vocabulary', async () => {
    await createModel();

    // Check if vocabulary was saved
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'models/feature_names.txt',
      expect.stringContaining('this\nis\ngreat')
    );

    // Check if model was exported
    expect(load).toHaveBeenCalledWith('models/sentiment-classifier.onnx');
  });

  test('should initialize weights', async () => {
    const model = new SentimentClassifier(11, 16);
    await initializeWeights(model);

    // Check if weights were copied
    expect(model.fc1.copy_).toHaveBeenCalled();
    expect(model.fc2.copy_).toHaveBeenCalled();
  });

  test('should handle model to device', () => {
    const model = new SentimentClassifier(11, 16);
    const cpu = device('cpu');
    model.to(cpu);

    // Check if all layers were moved to device
    expect(model.fc1.to).toHaveBeenCalledWith(cpu);
    expect(model.relu.to).toHaveBeenCalledWith(cpu);
    expect(model.fc2.to).toHaveBeenCalledWith(cpu);
  });

  test('should handle errors during model creation', async () => {
    const error = new Error('Mock error');
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw error;
    });

    await expect(createModel()).rejects.toThrow('Mock error');
  });

  test('should handle errors during weight initialization', async () => {
    const error = new Error('Mock error');
    const model = new SentimentClassifier(11, 16);
    model.fc1.copy_ = jest.fn().mockImplementation(() => {
      throw error;
    });

    await expect(initializeWeights(model)).rejects.toThrow('Mock error');
  });
});
