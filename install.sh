#!/bin/bash

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install system dependencies
echo "Installing system dependencies..."
sudo apt-get install -y libx11-dev libxi-dev libxext-dev

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

echo "Installation complete!"
