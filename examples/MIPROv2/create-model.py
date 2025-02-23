import torch
import torch.nn as nn
from torch.onnx import export

class SimpleTextGenerator(nn.Module):
    def __init__(self, input_size=256, hidden_size=512, output_size=256):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        output = self.fc(lstm_out[:, -1, :])
        return output

def create_onnx_model():
    # Create model
    model = SimpleTextGenerator()
    model.eval()
    
    # Create dummy input
    batch_size = 1
    seq_length = 32
    input_size = 256
    x = torch.randn(batch_size, seq_length, input_size)
    
    # Export to ONNX
    export(model, x, "models/text-generation.onnx",
           input_names=["input"],
           output_names=["output"],
           dynamic_axes={
               "input": {0: "batch_size", 1: "sequence_length"},
               "output": {0: "batch_size"}
           })
    
    print("ONNX model created successfully")

if __name__ == "__main__":
    create_onnx_model()
