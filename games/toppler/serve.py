#!/usr/bin/env python3
"""
Simple HTTP server with proper MIME types for Toppler development
Usage: python3 serve.py [port]
"""

import http.server
import socketserver
import sys
import os
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def guess_type(self, path):
        # Ensure proper MIME types for JavaScript files
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript'
        return super().guess_type(path)

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    
    # Change to the directory containing this script
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{port}")
        print(f"Toppler files:")
        print(f"  - Original: http://localhost:{port}/toppler.html?autostart=1")
        print(f"  - Bundled: http://localhost:{port}/toppler-bundled.html?autostart=1")
        print(f"  - Test: http://localhost:{port}/simple-test.html")
        print(f"  - Module test: http://localhost:{port}/module-test.html")
        print(f"  - Canvas test: http://localhost:{port}/test-canvas.html")
        print(f"Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")

if __name__ == "__main__":
    main()