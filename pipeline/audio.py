"""Compose original background music + sound effects and mix them under the voice.

Usage: python3 pipeline/audio.py build/<story-id>

Everything here is synthesised from scratch, so there is no copyright risk.
Writes mix.wav (44.1 kHz stereo).
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

SR = 44100
NOTE = {"C": 0, "C#": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
# feel-good progressions (scale degree in semitones, chord quality); the story's seed picks one
PROGRESSIONS = [
    [(0, "maj"), (7, "maj"), (9, "min"), (5, "maj")],   # I V vi IV
    [(9, "min"), (5, "maj"), (0, "maj"), (7, "maj")],   # vi IV I V
    [(0, "maj"), (9, "min"), (5, "maj"), (7, "maj")],   # I vi IV V
    [(0, "maj"), (5, "maj"), (9, "min"), (7, "maj")],   # I IV vi V
]


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def chord_notes(root, quality):
    third = 4 if quality == "maj" else 3
    return [root, root + third, root + 7]


def env_ad(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def pluck(freq, dur, vel=1.0):
    """Ukulele-ish pluck: harmonics that die away faster the higher they are."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, 8):
        if freq * h > 9000:
            break
        out += (0.6 / h) * np.sin(2 * np.pi * freq * h * t) * np.exp(-t * (3.2 + 2.6 * h))
    out *= np.clip(t / 0.004, 0, 1)
    return out * vel


def glock(freq, dur, vel=1.0):
    """Glockenspiel / music box: bar partials (1, 2.76, 5.4)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.2)
           + 0.35 * np.sin(2 * np.pi * freq * 2.756 * t) * np.exp(-t * 6)
           + 0.12 * np.sin(2 * np.pi * freq * 5.404 * t) * np.exp(-t * 12))
    return out * np.clip(t / 0.002, 0, 1) * vel


def bass(freq, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    return out * env_ad(n, 0.01, 0.45) * vel


def shaker(dur, rng, vel=1.0):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0)  # crude high-pass
    return noise * env_ad(n, 0.003, 0.035) * vel


def add(buf, sig, t):
    i = int(t * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def compose(duration, key, bpm, seed, outro_start, mood="bright"):
    rng = np.random.default_rng(seed)
    beat = 60.0 / bpm
    bar = 4 * beat
    root = 48 + NOTE[key]  # C3-ish
    n = int((duration + 3) * SR)
    uke, mel, low, perc = (np.zeros(n) for _ in range(4))

    PROGRESSION = PROGRESSIONS[seed % len(PROGRESSIONS)]
    calm = mood == "calm"
    strum = [(0, 0.9), (2, 0.6), (3, 0.45)] if calm else [(0, 1.0), (1, 0.7), (1.5, 0.55), (2.5, 0.6), (3, 0.75), (3.5, 0.55)]
    # a gentle melody shape over each chord (indexes into the chord's tones, two octaves up)
    motifs = [[0, 1, 2, 1], [2, 1, 0, 1], [0, 2, 1, 2], [1, 2, 0, None]]
    nbars = int(np.ceil(duration / bar)) + 1
    for b in range(nbars):
        t_bar = b * bar
        deg, q = PROGRESSION[b % 4]
        notes = chord_notes(root + 12 + deg, q)
        for pos, vel in strum:
            t = t_bar + pos * beat
            for k, m in enumerate(notes):
                add(uke, pluck(midi_hz(m), 1.2, vel * (0.9 if k else 1.0)), t + k * 0.012)
        add(low, bass(midi_hz(root - 12 + deg), beat * 1.8, 1.0), t_bar)
        add(low, bass(midi_hz(root - 12 + deg + 7), beat * 1.8, 0.7), t_bar + 2 * beat)
        for e in range(0 if calm else 8):
            add(perc, shaker(0.08, rng, 0.9 if e % 2 else 0.5), t_bar + e * beat / 2)
        # melody from bar 2 on, brighter on the final stretch
        if b >= 1:
            motif = motifs[(b + seed) % len(motifs)]
            tones = chord_notes(root + 24 + deg, q)
            bright = t_bar >= outro_start - bar
            for s, idx in enumerate(motif):
                if idx is None:
                    continue
                add(mel, glock(midi_hz(tones[idx]), 1.4, 0.9 if bright else 0.6), t_bar + s * beat)

    mix = 0.55 * uke + 0.32 * mel + 0.5 * low + 0.05 * perc
    mix = mix[: int(duration * SR)]
    t = np.arange(len(mix)) / SR
    fade = np.clip(t / 0.4, 0, 1) * np.clip((duration - t) / 2.0, 0, 1)
    mix *= fade
    return mix / (np.abs(mix).max() + 1e-9)


def sfx(name):
    if name == "boing":
        n = int(0.32 * SR); t = np.arange(n) / SR
        f = 260 + 520 * (t / t[-1]) ** 0.6
        return 0.7 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.005, 0.12) * (1 + 0.3 * np.sin(2 * np.pi * 18 * t))
    if name == "whoosh":
        n = int(0.6 * SR); t = np.arange(n) / SR
        noise = np.random.default_rng(7).standard_normal(n)
        k = np.hanning(64); k /= k.sum()
        noise = np.convolve(noise, k, mode="same")
        return 1.6 * noise * np.sin(np.pi * t / t[-1]) ** 2
    if name == "pop":
        n = int(0.18 * SR); t = np.arange(n) / SR
        f = 900 * np.exp(-t * 18) + 300
        return 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.002, 0.05)
    if name == "thunder":
        n = int(2.2 * SR); t = np.arange(n) / SR
        noise = np.random.default_rng(3).standard_normal(n)
        k = np.hanning(400); k /= k.sum()
        low = np.convolve(noise, k, mode="same")
        crack = noise * np.exp(-t * 30) * 0.15
        return 3.0 * (low * env_ad(n, 0.03, 0.7) + crack)
    if name == "sparkle":
        out = np.zeros(int(1.4 * SR))
        for i, m in enumerate([84, 88, 91, 96, 100]):
            add(out, 0.45 * glock(midi_hz(m), 1.0), i * 0.07)
        return out
    raise ValueError(name)


def main(build_dir):
    tl = json.load(open(os.path.join(build_dir, "timeline.json")))
    dur = tl["duration"]
    m = tl["story"]["music"]
    music = compose(dur, m["key"], m["bpm"], m.get("seed", 1), tl["outroStart"], m.get("mood", "bright"))

    voice, vsr = sf.read(os.path.join(build_dir, "voice.wav"))
    idx = np.arange(int(dur * SR)) * vsr / SR
    voice = np.interp(idx, np.arange(len(voice)), voice)
    n = len(voice)
    music = np.pad(music, (0, max(0, n - len(music))))[:n]

    # duck the music under speech (smoothed loudness follower)
    win = int(0.25 * SR)
    loud = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
    speaking = np.clip(loud / 0.03, 0, 1)
    gain = 0.16 - 0.08 * speaking  # -16 dB normally, about -22 dB under the voice

    fx = np.zeros(n)
    for s in tl["sfx"]:
        add(fx, sfx(s["name"]), s["t"])

    mono = voice + music * gain + fx * 0.22
    # tiny stereo width on the music only
    delay = int(0.012 * SR)
    music_r = np.pad(music, (delay, 0))[:n]
    left = mono
    right = voice + music_r * gain + fx * 0.22
    st = np.stack([left, right], axis=1)
    st /= max(1.0, np.abs(st).max() / 0.95)
    sf.write(os.path.join(build_dir, "mix.wav"), st.astype(np.float32), SR)
    print(f"  mix.wav {dur:.1f}s")


if __name__ == "__main__":
    main(sys.argv[1])
