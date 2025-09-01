#!/bin/bash

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the build
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "Build completed successfully. Output directory: dist/"
    ls -la dist/
else
    echo "Build failed. Output directory not found."
    exit 1
fi
