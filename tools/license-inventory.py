#!/usr/bin/env python3
"""Create a redistribution review inventory from cargo metadata JSON.

Run cargo metadata --locked --format-version 1 --filter-platform TARGET first.
This inventory is not a replacement for distributing required license texts,
native-library notices, or reviewing MPL source-availability obligations.
"""
import json
import sys

metadata = json.load(sys.stdin)
print("# Rust dependency license inventory\n")
print("Generated from the locked Cargo metadata for an explicitly selected target.")
print("System libraries, frontend dependencies and other target graphs require separate review.\n")
print("| Package | Version | Declared license | Upstream/source |")
print("| --- | --- | --- | --- |")
missing = []
for package in sorted(metadata["packages"], key=lambda p: (p["name"], p["version"])):
    license_name = package.get("license") or "MISSING"
    if license_name == "MISSING":
        missing.append(package["name"])
    source = package.get("repository") or package.get("source") or "workspace"
    # Escape untrusted metadata so it cannot introduce Markdown rows or HTML.
    def safe(value):
        return str(value).replace("|", "\\|").replace("<", "&lt;").replace(">", "&gt;").replace("\n", " ")
    print("| " + " | ".join(map(safe, (package["name"], package["version"], license_name, source))) + " |")
if missing:
    sys.exit("Missing declared license: " + ", ".join(missing))
