#!/usr/bin/env python3
"""Local dev server for the portfolio with no-cache headers.

python -m http.server sends no Cache-Control, so browsers heuristically cache
files for 10% of their age -- edits then appear stale for minutes or hours.
This serves the repo root with revalidation forced on every request.

Usage:  python tools/serve.py [port]     (default port 8000)
"""
import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f'Serving {ROOT} at http://localhost:{port} (no-cache)', flush=True)
    ThreadingHTTPServer(('0.0.0.0', port), NoCacheHandler).serve_forever()
