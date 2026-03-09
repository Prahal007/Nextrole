#!/bin/bash
echo "Creating PDFZen project structure..."

# Create directories
mkdir -p backend/src/main/java/com/pdfzen/{config,controller,dto/{request,response},entity,exception,repository,security,service,util}
mkdir -p backend/src/main/resources
mkdir -p frontend/src/{app/{dashboard,upload,results,pricing,login,register},lib}
mkdir -p database

echo "✅ Directories created"
echo ""
echo "Now open this folder in Cursor:"
echo "File → Open Folder → select pdfzen-ai"
