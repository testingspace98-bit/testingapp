#!/usr/bin/env bash
# One-time setup: Python deps + the Kokoro voice model (~120 MB, Apache-2.0).
# Needs ffmpeg, Node 18+ and Playwright's Chromium on the machine.
set -euo pipefail
cd "$(dirname "$0")"
pip install -r requirements.txt
mkdir -p models
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -f models/kokoro-v1.0.int8.onnx ] || curl -fL -o models/kokoro-v1.0.int8.onnx "$base/kokoro-v1.0.int8.onnx"
[ -f models/voices-v1.0.bin ] || curl -fL -o models/voices-v1.0.bin "$base/voices-v1.0.bin"
echo "Setup done."
