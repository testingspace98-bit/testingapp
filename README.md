# Cartoon Shorts Maker

Turns a short story file into a finished YouTube Short (1080×1920, 30 fps). Each video has:

- original 2D cartoon characters with lip-sync, blinking, expressions and movement
- neural voiceover, with a different voice for each character ([Kokoro](https://github.com/thewh1teagle/kokoro-onnx), Apache-2.0)
- background music and sound effects synthesised from scratch, so there are no copyright claims
- word-by-word captions with a speaker tag
- a title card, an end card with "Follow for more!", and loudness at -14 LUFS (YouTube's standard)

## Quick start

```bash
./setup.sh                                   # one time: Python deps + voice model
./make_video.sh stories/001-pip-big-hill.json
# -> output/001-pip-big-hill.mp4
```

You also need `ffmpeg`, Node 18+ and Playwright's Chromium.

## Writing a new story

Copy a file in `stories/` and edit it. Each **beat** is one spoken line plus what happens during it:

```json
{ "speaker": "pip", "text": "Okay. Just one small step.",
  "cam": { "follow": ["pip"], "zoom": 1.3 },
  "act": { "pip": { "expr": "determined", "move": "walk", "to": 560 } } }
```

| Field | Values |
|---|---|
| `speaker` | `narrator` or a character id |
| `expr` | `happy` `excited` `worried` `sad` `scared` `determined` |
| `pose` | `idle` `bounce` `cheer` `shiver` `crouch` |
| `look` | `ahead` `up` `down` |
| `move` | `walk`/`slide` (`to`: x), `jump` (`path`: [x, …]), `fly` (`to`: [x, y]) |
| `during` | `[start, end]`: the part of the beat the move takes (0–1) |
| `hold`, `pause` | extra seconds after the line |
| `sfx` | `[{ "name": "sparkle" \| "boing" \| "whoosh" \| "pop", "at": 0–1 }]` |
| `cam` | camera for this beat: `follow` (character ids), `zoom` |

Beats can also set the mood:

| Field | Values |
|---|---|
| `sky` | `day` `sunset` `night` `dawn` `storm`, with a smooth change over `skyFade` seconds |
| `rain`, `rainbow` | 0–1 |
| `flash` | `[fractions]`: a lightning flash plus thunder |
| `props` | per-prop changes: `show`, `to`, `full` (basket), `grow` (seed → tree), `glow` (lantern), `during` |

Characters (`kind`): `turtle` (Pip), `bunny` (Luna), `bird` (Bo), `fox` (Fen), `bear` (Bruno), `lamb` (Mila).
Scenes: `meadow`, `forest`, `hill`, `river`. Props: `basket`, `apple`, `sprout`, `lantern` (can `attach` to a character).
Expressions also include `angry`; poses also include `listen`, `flipped`, `sit`.
Voices: any Kokoro voice id, e.g. `af_heart`, `af_bella`, `af_kore`, `am_puck`, `am_michael`, `am_fenrir`, `bf_emma`.

Stories 003–012 come from `stories/make_stories.py`, which holds the recurring cast so every
character has the same look and voice in every episode. Each story teaches a value from Bible
teaching (sharing, honesty, forgiveness, hope, being a light, patience, kindness, gratitude,
being loved, self-worth, fresh starts) in everyday words, without quoting scripture.

## How it works

1. `pipeline/build.py`: generates speech for each line, estimates word timings for the captions, measures mouth movement for lip-sync, and writes `timeline.json`.
2. `pipeline/audio.py`: composes the music, adds sound effects, and lowers the music under speech.
3. `pipeline/render.mjs` + `scene.html`/`scene.js`: draws each frame as SVG in headless Chromium, then encodes the frames to H.264/AAC with ffmpeg.
