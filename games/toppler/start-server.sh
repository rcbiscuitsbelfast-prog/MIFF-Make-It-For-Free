#!/bin/bash

echo "Starting HTTP server on all interfaces..."
echo "Server will be accessible at:"
echo "  - http://localhost:8080"
echo "  - http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "Toppler files:"
echo "  - http://localhost:8080/toppler-bundled.html?autostart=1"
echo "  - http://localhost:8080/bundle-minimal-test.html"
echo "  - http://localhost:8080/canvas-test.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8080 --bind 0.0.0.0