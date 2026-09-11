#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Servidor local de la web institucional PEHUER."""
from __future__ import annotations

import os
import socket
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("PEHUER_HOST", "0.0.0.0")
PORT = int(os.environ.get("PEHUER_PORT", "8765"))


def lan_urls(port: int) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET, socket.SOCK_STREAM):
            ip = info[4][0]
            if ip.startswith("127.") or ip in seen:
                continue
            seen.add(ip)
            urls.append("http://%s:%s/" % (ip, port))
    except OSError:
        pass
    if not urls:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.connect(("8.8.8.8", 80))
            ip = sock.getsockname()[0]
            sock.close()
            if not ip.startswith("127."):
                urls.append("http://%s:%s/" % (ip, port))
        except OSError:
            pass
    return urls


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".json": "application/json",
        ".css": "text/css",
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def end_headers(self):
        path = self.path.split("?", 1)[0]
        if path.endswith((".html", ".css", ".js", ".mjs", ".json")) or path == "/":
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()


class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = False

    def server_bind(self):
        if os.name == "nt":
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def main():
    os.chdir(ROOT)
    try:
        httpd = Server((HOST, PORT), Handler)
    except OSError as exc:
        print("No se pudo abrir el puerto %s." % PORT)
        print("El puerto ya está en uso. Cerrá la otra ventana de PEHUER (Ctrl+C) y volvé a correr iniciar.bat.")
        print(exc)
        sys.exit(1)
    local_url = "http://127.0.0.1:%s/" % PORT
    print("PEHUER  ->  " + local_url)
    for lan in lan_urls(PORT):
        print("Celular (misma Wi-Fi)  ->  " + lan)
    print("Ctrl+C para salir.")
    try:
        webbrowser.open(local_url)
    except Exception:
        pass
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nCerrado.")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
