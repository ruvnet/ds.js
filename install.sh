#!/bin/bash

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install system dependencies
echo "Installing system dependencies..."
sudo apt-get install -y libx11-dev libxi-dev libxext-dev libgl1-mesa-dev

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Install ML-specific dependencies
echo "Installing ML dependencies..."
npm install onnxruntime-web js-pytorch

echo "Installation complete!"
