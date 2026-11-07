"""Turn a story JSON file into voice audio + a frame-accurate timeline.

Usage: python3 pipeline/build.py stories/<story>.json build/<story-id>

Writes:
  voice.wav      - all spoken lines placed on one track (24 kHz mono)
  timeline.json  - beats, caption words, mouth envelopes, motion segments, sfx
"""
import json
import math
import os
import re
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.path.join(ROOT, "models", "kokoro-v1.0.int8.onnx")
VOICES = os.path.join(ROOT, "models", "voices-v1.0.bin")

FPS = 30
LEAD_IN = 0.6       # silence before the first line (title pops in)
GAP = 0.35          # default pause after each line
OUTRO = 3.2         # end card length after the last line


def envelope(audio, sr):
    """Per-video-frame loudness 0..1, used for lip-sync."""
    hop = sr // FPS
    n = math.ceil(len(audio) / hop)
    rms = np.array([np.sqrt(np.mean(audio[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    peak = np.percentile(rms, 95) if n else 1
    env = np.clip(rms / (peak + 1e-9), 0, 1)
    # light smoothing so the mouth doesn't flicker
    sm = np.convolve(env, [0.25, 0.5, 0.25], mode="same")
    return [round(float(v), 2) for v in sm]


def word_timings(kokoro, text, audio, sr, lang):
    """Estimate when each word is spoken.

    Kokoro's ONNX model has no timestamp output, so words are spread over the
    voiced part of the clip weighted by phoneme count (plus punctuation pauses),
    then each boundary is nudged to the quietest nearby moment.
    """
    words = text.split()
    weights = []
    for w in words:
        core = re.sub(r"[^\w']", "", w)
        ph = kokoro.tokenizer.phonemize(core, lang) if core else ""
        wt = max(len(ph.replace(" ", "")), 1)
        pause = 4 if re.search(r"[.!?…]$", w) else 2 if re.search(r"[,;:—-]$", w) else 0
        weights.append((wt, pause))

    hop = sr // 100  # 10 ms resolution
    loud = np.array([np.sqrt(np.mean(audio[i:i + hop] ** 2)) for i in range(0, len(audio), hop)])
    thr = loud.max() * 0.06
    voiced = np.where(loud > thr)[0]
    v0, v1 = (voiced[0], voiced[-1] + 1) if len(voiced) else (0, len(loud))

    total = sum(w + p for w, p in weights) - weights[-1][1]
    pos, bounds = float(v0), []
    for i, (w, p) in enumerate(weights):
        s = pos
        e = s + w / total * (v1 - v0)
        pos = e + (p / total * (v1 - v0) if i < len(weights) - 1 else 0)
        bounds.append([s, e])

    # snap interior boundaries to a local energy minimum (±80 ms)
    for i in range(len(bounds) - 1):
        gap_mid = (bounds[i][1] + bounds[i + 1][0]) / 2
        lo, hi = int(max(gap_mid - 8, v0)), int(min(gap_mid + 8, v1))
        if hi > lo:
            m = lo + int(np.argmin(loud[lo:hi]))
            if bounds[i][0] < m < bounds[i + 1][1]:
                bounds[i][1] = m
                bounds[i + 1][0] = m
    return [{"w": w, "s": round(b[0] / 100, 3), "e": round(b[1] / 100, 3)} for w, b in zip(words, bounds)]


def caption_chunks(words, max_words=3):
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= max_words or re.search(r"[.!?,;:…]$", w["w"]):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    # avoid a lonely last word
    if len(chunks) > 1 and len(chunks[-1]) == 1 and len(chunks[-2]) <= max_words:
        last = chunks.pop()
        chunks[-1] += last
    return chunks


def ease(a, b):
    return {"t0": round(a, 3), "t1": round(b, 3)}


def motion_segments(story, beats):
    """Resolve each character's moves into absolute-time segments + sound effects."""
    segs = {cid: [] for cid in story["characters"]}
    sfx = []
    for b in beats:
        dur = b["end"] - b["start"]
        for cid, act in b.get("act", {}).items():
            if "move" not in act:
                continue
            f0, f1 = act.get("during", [0.08, 0.95])
            t0, t1 = b["start"] + f0 * dur, b["start"] + f1 * dur
            seg = {"move": act["move"], **ease(t0, t1)}
            if act["move"] == "jump":
                seg["path"] = act["path"]
                n = len(act["path"])
                for i in range(n):
                    sfx.append({"name": "boing", "t": round(t0 + i * (t1 - t0) / n, 3)})
            else:
                seg["to"] = act["to"]
            if act["move"] == "slide":
                sfx.append({"name": "whoosh", "t": round(t0, 3)})
            segs[cid].append(seg)
        for f in b.get("flash", []):
            sfx.append({"name": "thunder", "t": round(b["start"] + f * dur, 3)})
        for s in b.get("sfx", []):
            sfx.append({"name": s["name"], "t": round(b["start"] + s.get("at", 0) * dur, 3)})
    return segs, sfx


def main(story_path, out_dir):
    story = json.load(open(story_path))
    os.makedirs(out_dir, exist_ok=True)
    kokoro = Kokoro(MODEL, VOICES)
    lang = story.get("lang", "en-us")
    voices = {"narrator": story["narrator"]}
    voices.update({cid: c["voice"] for cid, c in story["characters"].items()})

    t = LEAD_IN
    beats, clips = [], []
    sr = 24000
    for i, raw in enumerate(story["beats"]):
        b = dict(raw)
        v = voices[b["speaker"]]
        audio, sr = kokoro.create(b["text"], voice=v["id"], speed=v.get("speed", 1.0), lang=lang)
        audio = audio.astype(np.float32)
        dur = len(audio) / sr
        b["start"] = round(t, 3)
        b["speechEnd"] = round(t + dur, 3)
        b["end"] = round(t + dur + b.get("hold", 0) + b.get("pause", GAP), 3)
        b["env"] = envelope(audio, sr)
        words = word_timings(kokoro, b["text"], audio, sr, lang)
        for w in words:
            w["s"] = round(w["s"] + t, 3)
            w["e"] = round(w["e"] + t, 3)
        b["chunks"] = caption_chunks(words)
        clips.append((t, audio))
        beats.append(b)
        t = b["end"]
        print(f"  [{i + 1}/{len(story['beats'])}] {b['speaker']:>8}: {dur:4.1f}s  {b['text']}")

    duration = round(t + OUTRO, 3)
    track = np.zeros(int(duration * sr) + sr, dtype=np.float32)
    for start, a in clips:
        i = int(start * sr)
        track[i:i + len(a)] += a
    peak = np.abs(track).max()
    track = track / peak * 0.89 if peak > 0 else track  # ~-1 dBFS
    sf.write(os.path.join(out_dir, "voice.wav"), track[: int(duration * sr)], sr)

    segs, sfx = motion_segments(story, beats)
    sfx.insert(0, {"name": "pop", "t": 0.15})
    sfx.append({"name": "sparkle", "t": round(t + 0.1, 3)})
    timeline = {
        "fps": FPS,
        "duration": duration,
        "outroStart": round(t, 3),
        "story": {k: story.get(k) for k in ("id", "title", "scene", "characters", "outro", "music", "camera", "props", "sky")},
        "beats": beats,
        "segments": segs,
        "sfx": sorted(sfx, key=lambda s: s["t"]),
    }
    json.dump(timeline, open(os.path.join(out_dir, "timeline.json"), "w"))
    print(f"  duration {duration:.1f}s -> {out_dir}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
