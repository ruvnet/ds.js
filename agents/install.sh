#!/bin/sh

# Install Deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# Add Deno to PATH
echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc

# Reload shell
source ~/.bashrc

echo "Deno has been installed successfully!"
echo "You can now run the agents using: deno run --allow-net --allow-env --allow-write agent.ts"
