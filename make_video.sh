#!/usr/bin/env bash
# Make one Short from a story file.
#   ./make_video.sh stories/001-pip-big-hill.json        -> output/001-pip-big-hill.mp4
#   ./make_video.sh stories/001-pip-big-hill.json ta     -> output/001-pip-big-hill-ta.mp4 (Tamil)
set -euo pipefail
cd "$(dirname "$0")"
story="$1"; lang="${2:-}"
id="$(basename "$story" .json)${lang:+-$lang}"
echo "1/3 voice + timeline"; python3 pipeline/build.py "$story" "build/$id" ${lang:+--lang "$lang"}
echo "2/3 music + mix";      python3 pipeline/audio.py "build/$id"
echo "3/3 render";           node pipeline/render.mjs "build/$id" "output/$id.mp4"
