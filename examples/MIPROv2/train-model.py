import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torch.onnx import export
import numpy as np

class TextDataset(Dataset):
    def __init__(self, texts, contexts, max_length=128):
        self.texts = texts
        self.contexts = contexts
        self.max_length = max_length
        
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        context = self.contexts[idx]
        
        # Simple tokenization (in practice, use a proper tokenizer)
        combined = f"Context: {context}\nInput: {text}"
        tokens = [ord(c) / 255.0 for c in combined[:self.max_length]]
        tokens = tokens + [0] * (self.max_length - len(tokens))
        
        # Create target (simple echo for demonstration)
        target = tokens.copy()
        
        return torch.tensor(tokens, dtype=torch.float32), torch.tensor(target, dtype=torch.float32)

class MIPROv2Model(nn.Module):
    def __init__(self, input_size=128, hidden_size=256, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(1, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)
        
    def forward(self, x):
        # x shape: [batch_size, sequence_length]
        x = x.unsqueeze(-1)  # Add feature dimension
        lstm_out, _ = self.lstm(x)
        output = self.fc(lstm_out)
        return output.squeeze(-1)  # Remove feature dimension

def train_model(train_data, epochs=10, batch_size=32, learning_rate=0.001):
    # Create dataset
    texts, contexts = zip(*train_data)
    dataset = TextDataset(texts, contexts)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    # Initialize model
    model = MIPROv2Model()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    # Training loop
    print("Starting training...")
    for epoch in range(epochs):
        total_loss = 0
        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            output = model(batch_x)
            loss = criterion(output, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}")
    
    print("Training completed")
    return model

def export_to_onnx(model, output_path, input_size=128):
    model.eval()
    dummy_input = torch.randn(1, input_size)
    
    # Export the model
    export(model, dummy_input, output_path,
           input_names=['input'],
           output_names=['output'],
           dynamic_axes={
               'input': {0: 'batch_size'},
               'output': {0: 'batch_size'}
           })
    print(f"Model exported to {output_path}")

def main():
    # Sample training data
    train_data = [
        ("What is machine learning?", "AI and computer science"),
        ("How does LSTM work?", "Neural networks and deep learning"),
        ("Explain backpropagation", "Training neural networks"),
        # Add more training examples here
    ]
    
    # Train the model
    model = train_model(train_data)
    
    # Export to ONNX
    export_to_onnx(model, "models/miprov2-model.onnx")

if __name__ == "__main__":
    main()
