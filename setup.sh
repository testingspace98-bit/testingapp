#!/usr/bin/env bash
# One-time setup. Needs ffmpeg (with rubberband), Node 18+ and Playwright's Chromium.
#   ./setup.sh        English only (Kokoro voice model, ~120 MB, Apache-2.0)
#   ./setup.sh ta     also Tamil (AI4Bharat Indic-TTS, ~1.5 GB download, MIT) + PyTorch
set -euo pipefail
cd "$(dirname "$0")"
pip install -r requirements.txt
mkdir -p models
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -f models/kokoro-v1.0.int8.onnx ] || curl -fL -o models/kokoro-v1.0.int8.onnx "$base/kokoro-v1.0.int8.onnx"
[ -f models/voices-v1.0.bin ] || curl -fL -o models/voices-v1.0.bin "$base/voices-v1.0.bin"
if [ "${1:-}" = "ta" ]; then
  pip install --upgrade --ignore-installed setuptools   # docopt (a coqui-tts dependency) fails with Debian's setuptools
  pip install coqui-tts torch torchaudio torchcodec
  if [ ! -d models/ta/ta ]; then
    curl -fL -o models/ta.zip https://github.com/AI4Bharat/Indic-TTS/releases/download/v1-checkpoints-release/ta.zip
    unzip -q models/ta.zip -d models/ta && rm models/ta.zip
  fi
  # the shipped config points at the authors' paths; point it at ours
  python3 - <<'PY'
import json, os
d = os.path.abspath("models/ta/ta/fastpitch")
c = json.load(open(f"{d}/config.json"))
c["speakers_file"] = c.setdefault("model_args", {})["speakers_file"] = f"{d}/speakers.pth"
json.dump(c, open(f"{d}/config.json", "w"), indent=1)
PY
fi
echo "Setup done."
