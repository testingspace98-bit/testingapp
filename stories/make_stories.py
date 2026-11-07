"""Source for stories 003-012. Run: python3 stories/make_stories.py

Every story teaches a value rooted in Bible teaching (sharing, honesty, forgiveness,
hope, being a light, patience, kindness to strangers, gratitude, being loved,
self-worth, fresh starts) in everyday words, without quoting scripture.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
NARRATOR = {"id": "af_heart", "speed": 0.95}

# the channel's recurring cast: same look and voice in every episode
CAST = {
    "pip":   {"kind": "turtle", "name": "Pip",   "color": "#4caf50", "pill": "#3a9a3e", "voice": {"id": "am_puck", "speed": 1.0}},
    "luna":  {"kind": "bunny",  "name": "Luna",  "color": "#f4eaff", "pill": "#9a7fd1", "voice": {"id": "af_bella", "speed": 1.0}},
    "bo":    {"kind": "bird",   "name": "Bo",    "color": "#3d9df3", "voice": {"id": "af_kore", "speed": 1.0}},
    "fen":   {"kind": "fox",    "name": "Fen",   "color": "#f08a24", "pill": "#e0761a", "voice": {"id": "am_fenrir", "speed": 1.05}},
    "bruno": {"kind": "bear",   "name": "Bruno", "color": "#9a6440", "pill": "#8a5532", "voice": {"id": "am_michael", "speed": 0.92}},
    "mila":  {"kind": "lamb",   "name": "Mila",  "color": "#fffaf0", "pill": "#a58fb0", "voice": {"id": "bf_emma", "speed": 1.0}},
}
SCALE = {"pip": 0.85, "luna": 0.85, "bo": 0.9, "fen": 0.85, "bruno": 0.82, "mila": 0.95}


def char(cid, x, face=1, y=None, **extra):
    c = dict(CAST[cid])
    c["start"] = {"x": x, "face": face, "scale": SCALE[cid], **extra}
    if y is not None:
        c["start"]["y"] = y
    return c


def N(text, **kw):
    return {"speaker": "narrator", "text": text, **kw}


def S(who, text, **kw):
    return {"speaker": who, "text": text, **kw}


def cam(follow, zoom):
    return {"follow": follow, "zoom": zoom}


SPARKLE = [{"name": "sparkle", "at": 0.05}]

STORIES = []

# 003 - generosity
STORIES.append({
    "id": "003-bruno-shares", "title": "Bruno Shares His Berries", "lesson": "The more you give, the more joy you find.",
    "scene": "forest", "music": {"key": "G", "bpm": 96, "seed": 1},
    "characters": {"bruno": char("bruno", 330), "fen": char("fen", 1250, -1)},
    "props": {"b1": {"kind": "basket", "x": 470, "scale": 0.9, "full": 1},
              "b2": {"kind": "basket", "x": 470, "scale": 0.9, "full": 0.5, "show": False}},
    "beats": [
        N("Bruno the bear picked a whole basket of juicy berries.", cam=cam(["bruno"], 1.35), act={"bruno": {"expr": "happy"}}),
        S("bruno", "Mmm! All of these are mine!", act={"bruno": {"expr": "excited", "pose": "bounce"}}),
        N("Then Fen the fox came by. His tummy was rumbling.", cam=cam(["bruno", "fen"], 1.1),
          act={"bruno": {"pose": "idle", "expr": "happy"}, "fen": {"move": "walk", "to": 790, "expr": "sad"}}),
        S("fen", "I couldn't find a single berry today...", cam=cam(["fen"], 1.35), act={"fen": {"look": "down"}}),
        N("Bruno looked at his berries. Then he looked at his friend.", cam=cam(["bruno"], 1.35),
          act={"bruno": {"expr": "worried", "look": "down"}}),
        S("bruno", "Here, Fen. Let's share!", cam=cam(["bruno", "fen"], 1.1),
          act={"bruno": {"expr": "happy", "look": "ahead"}},
          props={"b2": {"show": True, "to": 660, "during": [0.15, 0.9]}, "b1": {"full": 0.5, "during": [0.15, 0.5]}}),
        S("fen", "Really? Thank you, Bruno!", sfx=SPARKLE, act={"fen": {"expr": "excited", "pose": "cheer", "look": "ahead"}}),
        N("Bruno had fewer berries now. But his heart felt fuller than ever.", cam=cam(["bruno"], 1.3),
          act={"fen": {"pose": "idle", "expr": "happy"}, "bruno": {"expr": "happy"}}),
        S("bruno", "Sharing makes me happy too!", sfx=SPARKLE, act={"bruno": {"expr": "excited", "pose": "cheer"}}),
        N("The more you give, the more joy you find.", cam=cam(["bruno", "fen"], 1.05), act={"bruno": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Share something today!", "sub": "A new story every day"},
})

# 004 - honesty and forgiveness
STORIES.append({
    "id": "004-fen-tells-the-truth", "title": "Fen Tells the Truth", "lesson": "Honest words take courage. Forgiving takes love.",
    "scene": "meadow", "music": {"key": "A", "bpm": 98, "seed": 2},
    "characters": {"luna": char("luna", 650), "fen": char("fen", -150)},
    "props": {"basket": {"kind": "basket", "fruit": "apple", "x": 560, "scale": 0.9, "full": 1},
              "a1": {"kind": "apple", "x": 560, "show": False}, "a2": {"kind": "apple", "x": 560, "show": False},
              "a3": {"kind": "apple", "x": 560, "show": False}},
    "beats": [
        N("Luna left her basket of apples by the big oak tree.", cam=cam(["luna"], 1.2),
          act={"luna": {"expr": "happy", "move": "walk", "to": 1350, "during": [0.35, 1.0]}}),
        N("Then Fen the fox came racing by!", cam=cam(["fen"], 1.25), act={"fen": {"expr": "excited", "move": "walk", "to": 470, "during": [0.0, 1.0]}}),
        S("fen", "Whoa! Whoops!", hold=0.5, sfx=[{"name": "whoosh", "at": 0.0}], cam=cam(["fen"], 1.15),
          act={"fen": {"expr": "scared", "pose": "shiver"}},
          props={"basket": {"full": 0, "during": [0.0, 0.25]},
                 "a1": {"show": True, "to": 690, "during": [0.05, 0.8]}, "a2": {"show": True, "to": 790, "during": [0.05, 0.9]},
                 "a3": {"show": True, "to": 890, "during": [0.05, 1.0]}}),
        S("fen", "Oh no! Luna's apples!", cam=cam(["fen"], 1.4), act={"fen": {"look": "down"}}),
        N("Nobody saw. Fen could just run away...", act={"fen": {"expr": "worried", "pose": "idle", "look": "ahead"}}),
        N("But deep down, Fen knew what was right.", act={"fen": {"expr": "determined"}}),
        N("When Luna came back, Fen walked right up to her.", cam=cam(["fen", "luna"], 1.05),
          act={"luna": {"move": "walk", "to": 900, "face": -1, "during": [0.0, 0.7]}, "fen": {"move": "walk", "to": 620, "during": [0.3, 1.0]}}),
        S("fen", "Luna, I knocked over your apples. I'm really sorry.", cam=cam(["fen", "luna"], 1.2),
          act={"fen": {"expr": "sad"}, "luna": {"expr": "worried"}}),
        S("luna", "Thank you for telling the truth, Fen. I forgive you!", cam=cam(["luna"], 1.3),
          act={"luna": {"expr": "happy"}, "fen": {"expr": "happy"}}),
        N("Then they picked up every apple, together.", cam=cam(["fen", "luna"], 1.15),
          act={"fen": {"move": "walk", "to": 430}, "luna": {"move": "walk", "to": 700}},
          props={"a1": {"to": 560, "during": [0.1, 0.7]}, "a2": {"to": 560, "during": [0.1, 0.8]}, "a3": {"to": 560, "during": [0.1, 0.9]},
                 "basket": {"full": 1, "during": [0.6, 1.0]}}),
        N("Honest words take courage. Forgiving takes a loving heart.", sfx=SPARKLE, cam=cam(["fen", "luna"], 1.1),
          act={"fen": {"pose": "cheer", "expr": "excited"}, "luna": {"pose": "cheer", "expr": "excited"}},
          props={"a1": {"show": False, "during": [0, 0.1]}, "a2": {"show": False, "during": [0, 0.1]}, "a3": {"show": False, "during": [0, 0.1]}}),
    ],
    "outro": {"headline": "Be honest. Be kind.", "sub": "A new story every day"},
})

# 005 - hope and peace in the storm
STORIES.append({
    "id": "005-pip-and-the-storm", "title": "Pip and the Storm", "lesson": "Every storm passes. The sun will shine again.",
    "scene": "meadow", "sky": "storm", "music": {"key": "D", "bpm": 84, "seed": 3, "mood": "calm"},
    "characters": {"pip": char("pip", 800, -1), "bo": char("bo", 1250, -1, y=600)},
    "beats": [
        N("The sky turned dark. The wind howled. And the rain poured down.", flash=[0.55], cam=cam(["pip"], 1.3),
          act={"pip": {"expr": "scared", "pose": "shiver"}}),
        S("pip", "I'm scared! What if this storm never ends?", flash=[0.75], act={"pip": {"look": "up"}}),
        N("Then his friend Bo flew down beside him.", cam=cam(["pip", "bo"], 1.15),
          act={"bo": {"move": "fly", "to": [600, 1220], "during": [0.0, 0.9], "expr": "happy"}, "pip": {"look": "ahead"}}),
        S("bo", "Storms can feel very big, Pip. But they never last forever.", act={"pip": {"expr": "worried", "pose": "idle"}}),
        S("bo", "And you don't have to face it alone. I'm right here with you."),
        S("pip", "Okay. I can be brave, as long as we're together.", cam=cam(["pip"], 1.3), act={"pip": {"expr": "happy"}}),
        N("They waited together. And slowly, the rain stopped.", sky="day", skyFade=3.5, cam=cam(["pip", "bo"], 1.1)),
        N("The sun came out, and a rainbow filled the sky!", rainbow=1, skyFade=2.0, sfx=SPARKLE, cam=cam(["pip", "bo"], 1.0),
          act={"pip": {"expr": "excited", "pose": "cheer", "look": "up"}, "bo": {"expr": "excited"}}),
        S("pip", "Wow! It's so beautiful!"),
        N("Every storm passes. Hold on, because the sun will shine again.", act={"pip": {"pose": "idle", "expr": "happy", "look": "ahead"}}),
    ],
    "outro": {"headline": "Hold on. The sun will shine again.", "sub": "A new story every day"},
})

# 006 - be a light
STORIES.append({
    "id": "006-milas-little-light", "title": "Mila's Little Light", "lesson": "No light is too small.",
    "scene": "forest", "sky": "night", "music": {"key": "A", "bpm": 80, "seed": 4, "mood": "calm"},
    "characters": {"luna": char("luna", 190), "mila": char("mila", 820, -1)},
    "props": {"lantern": {"kind": "lantern", "scale": 0.9, "glow": 0.7, "attach": {"to": "mila", "dx": 140, "dy": -30}}},
    "beats": [
        N("Mila was the smallest lamb in the whole forest.", cam=cam(["mila"], 1.45), act={"mila": {"expr": "happy"}}),
        S("mila", "I'm so small. What can a little lamb like me ever do?", act={"mila": {"expr": "sad", "look": "down"}}),
        N("That night, she heard someone crying in the dark.", act={"mila": {"expr": "scared", "look": "ahead"}}),
        S("luna", "I'm lost! It's too dark. I can't find my way home!", cam=cam(["luna"], 1.4),
          act={"luna": {"expr": "sad", "pose": "shiver"}}),
        N("Mila only had a tiny lantern. But she held it up high.", cam=cam(["mila", "luna"], 1.1),
          act={"mila": {"expr": "determined", "move": "walk", "to": 560, "during": [0.3, 1.0]}},
          props={"lantern": {"glow": 1.6, "during": [0.2, 0.9]}}),
        S("mila", "Follow my light, Luna! I'll show you the way.", act={"mila": {"expr": "happy"}, "luna": {"expr": "worried", "pose": "idle"}}),
        N("Step by step, the little light led them all the way home.", cam=cam(["mila", "luna"], 1.1),
          act={"mila": {"face": 1, "move": "walk", "to": 880, "during": [0.05, 1.0]},
               "luna": {"expr": "happy", "move": "walk", "to": 650, "during": [0.15, 1.0]}}),
        S("luna", "Thank you, Mila! Your little light saved me!", sfx=SPARKLE, cam=cam(["mila", "luna"], 1.2),
          act={"luna": {"expr": "excited", "pose": "cheer"}}),
        S("mila", "Maybe little lights matter too!", act={"mila": {"expr": "excited", "pose": "bounce"}, "luna": {"pose": "idle"}}),
        N("No light is too small. Let yours shine bright!", act={"mila": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Let your light shine!", "sub": "A new story every day"},
})

# 007 - patience, faith in small beginnings
STORIES.append({
    "id": "007-the-tiny-seed", "title": "The Tiny Seed", "lesson": "Big things start small. Don't give up.",
    "scene": "meadow", "music": {"key": "E", "bpm": 90, "seed": 5},
    "characters": {"luna": char("luna", 360), "pip": char("pip", 1250, -1)},
    "props": {"seed": {"kind": "sprout", "x": 600, "grow": 0}},
    "beats": [
        N("Luna planted a tiny seed in the soft, brown earth.", cam=cam(["luna"], 1.35), act={"luna": {"expr": "happy", "pose": "crouch"}}),
        S("luna", "Grow, little seed! Grow right now!", act={"luna": {"expr": "excited", "pose": "bounce"}}),
        N("But nothing happened.", hold=0.4, act={"luna": {"expr": "worried", "pose": "idle", "look": "down"}}),
        S("luna", "Maybe it's broken. Maybe I should just give up.", act={"luna": {"expr": "sad"}}),
        S("pip", "Don't give up, Luna! The best things grow slowly.", cam=cam(["luna", "pip"], 1.1),
          act={"pip": {"expr": "happy", "move": "walk", "to": 840, "during": [0.0, 0.6]}, "luna": {"look": "ahead"}}),
        S("pip", "Just keep watering it, and trust it to grow."),
        N("So Luna waited. Day after day.", sky="sunset", skyFade=1.5, act={"luna": {"expr": "determined"}},
          props={"seed": {"grow": 0.3, "during": [0.0, 1.0]}}),
        N("Night after night.", sky="night", skyFade=1.2, hold=0.3, props={"seed": {"grow": 0.5, "during": [0.0, 1.0]}}),
        N("Until one bright morning...", sky="day", skyFade=2.0, hold=0.5, cam=cam(["luna", "pip"], 1.0),
          props={"seed": {"grow": 1.0, "during": [0.1, 1.0]}}),
        S("luna", "Pip, look! It grew into a beautiful flowering tree!", sfx=SPARKLE,
          act={"luna": {"expr": "excited", "pose": "cheer", "look": "up"}, "pip": {"expr": "excited", "look": "up"}}),
        N("Big things often start small. Keep going, and never give up.", act={"luna": {"pose": "idle", "expr": "happy", "look": "ahead"}}),
    ],
    "outro": {"headline": "Good things grow. Keep going!", "sub": "A new story every day"},
})

# 008 - kindness to everyone (the good neighbour)
STORIES.append({
    "id": "008-bruno-stops-to-help", "title": "Bruno Stops to Help", "lesson": "Don't judge by looks. Always stop to help.",
    "scene": "forest", "music": {"key": "Bb", "bpm": 92, "seed": 6},
    "characters": {"fen": char("fen", 600, 1, expr="sad", pose="crouch"), "bruno": char("bruno", -250), "bo": char("bo", -150, 1, y=900)},
    "beats": [
        N("Fen the fox tripped on a root and hurt his paw.", cam=cam(["fen"], 1.4), act={"fen": {"expr": "sad"}}),
        S("fen", "Ouch! Can anyone help me, please?"),
        N("Bo flew by. But he was in a big hurry.", cam=cam(["fen"], 1.1),
          act={"bo": {"move": "fly", "to": [640, 980], "during": [0.0, 1.0]}, "fen": {"look": "up"}}),
        S("bo", "Sorry, Fen! I'm too busy today!", act={"bo": {"move": "fly", "to": [1350, 760], "during": [0.1, 1.0]}}),
        N("Then came Bruno, the big bear. Everyone thought he was scary.", cam=cam(["fen", "bruno"], 1.05),
          act={"bruno": {"move": "walk", "to": 320, "during": [0.0, 0.9], "expr": "happy"}, "fen": {"look": "ahead", "expr": "scared", "pose": "shiver"}}),
        S("fen", "Oh no... Please don't hurt me!", cam=cam(["fen"], 1.35)),
        S("bruno", "Hurt you? No, little friend. I'm here to help.", cam=cam(["bruno"], 1.35), act={"fen": {"pose": "crouch", "expr": "worried"}}),
        N("Bruno wrapped Fen's paw, and helped him all the way home.", cam=cam(["fen", "bruno"], 1.1),
          act={"fen": {"pose": "idle", "expr": "happy", "move": "walk", "to": 900, "during": [0.2, 1.0]},
               "bruno": {"move": "walk", "to": 640, "during": [0.15, 1.0]}}),
        S("fen", "Thank you, Bruno! You're the kindest friend ever!", sfx=SPARKLE, cam=cam(["fen", "bruno"], 1.2),
          act={"fen": {"face": -1, "expr": "excited", "pose": "cheer"}}),
        N("Never judge someone by how they look. And always stop to help.", act={"fen": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Stop and help someone today.", "sub": "A new story every day"},
})

# 009 - gratitude
STORIES.append({
    "id": "009-pips-thank-you-game", "title": "Pip's Thank-You Game", "lesson": "A thankful heart finds joy every day.",
    "scene": "meadow", "sky": "dawn", "music": {"key": "C", "bpm": 100, "seed": 7},
    "characters": {"pip": char("pip", 300, 1, expr="angry"), "mila": char("mila", 1250, -1)},
    "beats": [
        N("Pip woke up feeling very grumpy.", cam=cam(["pip"], 1.4), act={"pip": {"expr": "angry"}}),
        S("pip", "My shell is heavy. I'm too slow. Nothing good ever happens to me!", act={"pip": {"look": "down"}}),
        N("Then his friend Mila came trotting over.", cam=cam(["pip", "mila"], 1.25),
          act={"mila": {"move": "walk", "to": 700, "during": [0.0, 0.9], "expr": "happy"}, "pip": {"look": "ahead", "expr": "sad"}}),
        S("mila", "Let's play a game, Pip! Let's count all the good things!", act={"mila": {"expr": "excited", "pose": "bounce"}}),
        S("mila", "I'll go first. The sun is shining!", sky="day", skyFade=2.5, act={"mila": {"expr": "happy", "pose": "idle", "look": "up"}}),
        S("pip", "Well... the grass is nice and soft.", act={"pip": {"expr": "worried"}, "mila": {"look": "ahead"}}),
        S("mila", "And we have yummy flowers to eat!", act={"mila": {"expr": "excited"}}),
        S("pip", "And... I have a friend like you!", act={"pip": {"expr": "happy"}}),
        N("The more Pip said thank you, the happier he felt.", act={"pip": {"pose": "bounce", "expr": "excited"}, "mila": {"pose": "bounce"}}),
        S("pip", "My shell keeps me safe, too! Thank you, shell!", sfx=SPARKLE, cam=cam(["pip"], 1.35), act={"pip": {"pose": "cheer"}}),
        N("A thankful heart can find joy in every single day.", cam=cam(["pip", "mila"], 1.2),
          act={"pip": {"pose": "idle", "expr": "happy"}, "mila": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Count your blessings today!", "sub": "A new story every day"},
})

# 010 - every one matters (the lost lamb)
STORIES.append({
    "id": "010-the-lost-lamb", "title": "The Lost Lamb", "lesson": "No one is too lost to be found. You are loved.",
    "scene": "forest", "sky": "sunset", "music": {"key": "F", "bpm": 84, "seed": 8, "mood": "calm"},
    "characters": {"mila": char("mila", 250), "bruno": char("bruno", -260)},
    "beats": [
        N("Mila followed a pretty butterfly, far away from her friends.", cam=cam(["mila"], 1.35),
          act={"mila": {"expr": "happy", "move": "walk", "to": 720, "during": [0.05, 1.0]}}),
        N("When she looked up, the sun was going down.", sky="night", skyFade=3.0, act={"mila": {"expr": "worried", "look": "up"}}),
        S("mila", "Hello? Is anyone there? I think I'm lost...", act={"mila": {"expr": "scared", "pose": "shiver", "look": "ahead"}}),
        N("Bruno counted his friends. Someone was missing!", cam=cam(["bruno"], 1.35),
          act={"bruno": {"move": "walk", "to": 170, "during": [0.0, 0.6], "expr": "worried"}}),
        S("bruno", "Mila is missing! I'll find her, no matter what!", act={"bruno": {"expr": "determined"}}),
        N("Bruno searched and searched, deep into the dark forest.", cam=cam(["bruno"], 1.2),
          act={"bruno": {"move": "walk", "to": 430, "during": [0.0, 1.0]}}),
        S("bruno", "Mila! Mila, where are you?", cam=cam(["bruno", "mila"], 1.15), act={"bruno": {"expr": "worried"}}),
        S("mila", "Bruno! I'm over here!", act={"mila": {"face": -1, "expr": "excited", "pose": "bounce"}}),
        N("Bruno was so happy, he gave her the biggest hug.", sfx=SPARKLE, cam=cam(["bruno", "mila"], 1.25),
          act={"bruno": {"move": "walk", "to": 560, "during": [0.0, 0.5], "expr": "excited"}, "mila": {"pose": "cheer"}}),
        S("bruno", "You matter so much, Mila. I'll always come looking for you.", act={"bruno": {"expr": "happy"}, "mila": {"pose": "idle", "expr": "happy"}}),
        N("No one is ever too lost to be found. You are always loved.", cam=cam(["bruno", "mila"], 1.1)),
    ],
    "outro": {"headline": "You are loved!", "sub": "A new story every day"},
})

# 011 - you were made just right
STORIES.append({
    "id": "011-luna-is-just-right", "title": "Luna Is Just Right", "lesson": "You don't need to be anyone else.",
    "scene": "meadow", "music": {"key": "G", "bpm": 94, "seed": 9},
    "characters": {"bruno": char("bruno", 120), "luna": char("luna", 340), "bo": char("bo", 520, -1, y=1060),
                   "pip": char("pip", 820, -1, pose="flipped", expr="scared")},
    "beats": [
        N("Luna watched her friends, and felt very small.", cam=cam(["luna", "bruno"], 1.25), act={"luna": {"expr": "sad"}}),
        S("luna", "Bo can fly. Bruno is so strong. And I'm... just me.", act={"luna": {"look": "up"}, "bo": {"move": "fly", "to": [600, 980]}}),
        N("Suddenly, Luna heard a tiny cry, far, far away.", cam=cam(["luna"], 1.4), act={"luna": {"expr": "worried", "pose": "listen", "look": "ahead"}}),
        S("bruno", "Hmm? I don't hear anything.", cam=cam(["bruno", "luna"], 1.3), act={"bruno": {"expr": "worried"}}),
        S("luna", "I do! Someone needs help! This way!", cam=cam(["luna", "bruno"], 1.15),
          act={"luna": {"expr": "determined", "pose": "idle", "move": "walk", "to": 470, "during": [0.3, 1.0]},
               "bruno": {"move": "walk", "to": 300, "during": [0.4, 1.0]}, "bo": {"move": "fly", "to": [700, 900], "during": [0.3, 1.0]}}),
        N("Luna's big ears led them straight to Pip. He was stuck on his back!", cam=cam(["pip", "luna"], 1.2),
          act={"luna": {"expr": "worried"}}),
        S("pip", "Help! I can't turn over!", cam=cam(["pip"], 1.35)),
        N("Bruno gently flipped him back over.", cam=cam(["bruno", "pip"], 1.2),
          act={"bruno": {"move": "walk", "to": 610, "during": [0.0, 0.5]}, "pip": {"pose": "idle", "expr": "happy"}}),
        S("pip", "Thank you! But how did you ever find me?", act={"pip": {"expr": "happy"}}),
        S("bruno", "Luna heard you! Her ears are amazing!", sfx=SPARKLE, cam=cam(["luna", "bruno"], 1.2),
          act={"luna": {"expr": "excited", "pose": "cheer"}, "bruno": {"expr": "happy"}}),
        N("You don't have to be like anyone else. You were made just right.", cam=cam(["luna", "pip"], 1.05),
          act={"luna": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "You were made just right!", "sub": "A new story every day"},
})

# 012 - a fresh start every morning
STORIES.append({
    "id": "012-a-brand-new-morning", "title": "A Brand New Morning", "lesson": "Every morning is a fresh new start.",
    "scene": "river", "sky": "sunset", "music": {"key": "D", "bpm": 92, "seed": 10},
    "characters": {"luna": char("luna", 150, expr="angry"), "fen": char("fen", 960, -1)},
    "beats": [
        N("Luna had a long day, and she felt tired and cranky.", cam=cam(["luna"], 1.35), act={"luna": {"expr": "angry"}}),
        N("Then her friend Fen came hopping across the stones.", hold=0.4, cam=cam(["luna", "fen"], 1.0),
          act={"fen": {"expr": "excited", "move": "jump", "path": [655, 460, 330], "during": [0.0, 0.95]}}),
        S("fen", "Hi Luna! Want to play with me?", cam=cam(["luna", "fen"], 1.3), act={"fen": {"pose": "bounce"}}),
        S("luna", "No! Go away, Fen! Leave me alone!", cam=cam(["luna"], 1.4), act={"luna": {"pose": "shiver"}}),
        N("Fen's ears drooped. He hopped back home, all alone.", hold=0.4, cam=cam(["luna", "fen"], 1.0),
          act={"luna": {"pose": "idle"}, "fen": {"pose": "idle", "expr": "sad", "face": 1, "move": "jump", "path": [460, 655, 960], "during": [0.15, 1.0]}}),
        N("That night, Luna couldn't sleep.", sky="night", skyFade=2.0, cam=cam(["luna"], 1.35), act={"luna": {"expr": "sad"}}),
        S("luna", "I was so mean to my friend. I wish I could take it back.", act={"luna": {"look": "down"}}),
        N("Then the sun came up. A brand new morning!", sky="dawn", skyFade=2.5, cam=cam(["luna"], 1.2),
          act={"luna": {"expr": "happy", "look": "up"}, "fen": {"face": -1, "expr": "sad"}}),
        S("luna", "Today, I can make it right!", hold=0.5, sky="day", skyFade=3.0, cam=cam(["luna", "fen"], 1.0),
          act={"luna": {"expr": "determined", "look": "ahead", "move": "jump", "path": [460, 655, 790], "during": [0.2, 1.0]}}),
        S("luna", "Fen, I'm sorry I was mean. Will you forgive me?", cam=cam(["luna", "fen"], 1.3),
          act={"luna": {"expr": "worried"}, "fen": {"expr": "worried"}}),
        S("fen", "Of course I will! Every day is a fresh start!", sfx=SPARKLE,
          act={"fen": {"expr": "excited", "pose": "cheer"}, "luna": {"expr": "excited", "pose": "cheer"}}),
        N("Yesterday is over. Every morning brings a brand new start.", cam=cam(["luna", "fen"], 1.15),
          act={"fen": {"pose": "idle", "expr": "happy"}, "luna": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Every morning is a fresh start!", "sub": "A new story every day"},
})

# 013 - slow to anger
STORIES.append({
    "id": "013-bruno-counts-to-ten", "title": "Bruno Counts to Ten", "lesson": "Stop, breathe, and be gentle.",
    "scene": "meadow", "music": {"key": "Eb", "bpm": 92, "seed": 11},
    "characters": {"bruno": char("bruno", 300), "fen": char("fen", 1250, -1)},
    "props": {"plant": {"kind": "sprout", "x": 560, "grow": 0.45}},
    "beats": [
        N("Bruno had grown a little plant. He loved it so much.", cam=cam(["bruno"], 1.3), act={"bruno": {"expr": "happy"}}),
        S("bruno", "Grow big and strong, little plant!", act={"bruno": {"expr": "excited", "pose": "bounce"}}),
        N("Then Fen came running after a ball, and... squish!", sfx=[{"name": "whoosh", "at": 0.7}], cam=cam(["bruno", "fen"], 1.05),
          act={"bruno": {"pose": "idle", "expr": "happy"}, "fen": {"expr": "excited", "move": "walk", "to": 600, "during": [0.05, 0.8]}},
          props={"plant": {"grow": 0.12, "during": [0.75, 0.95]}}),
        S("fen", "Oh no! I'm so sorry, Bruno!", act={"fen": {"expr": "scared", "move": "walk", "to": 790, "during": [0.1, 0.6]}}),
        N("Bruno felt angry. Really, really angry.", cam=cam(["bruno"], 1.45), act={"bruno": {"expr": "angry", "pose": "shiver"}}),
        S("bruno", "Grrr! I want to roar!"),
        N("But Bruno stopped. He took a deep breath, and counted to ten.", act={"bruno": {"expr": "determined", "pose": "crouch"}}),
        S("bruno", "One, two, three... nine, ten. Okay. I'm calm now.", act={"bruno": {"expr": "happy", "pose": "idle"}}),
        S("bruno", "It was an accident, Fen. Let's plant a new one together!", cam=cam(["bruno", "fen"], 1.1),
          act={"fen": {"expr": "happy", "pose": "idle"}}),
        N("So they planted it side by side, and watched it grow.", sfx=SPARKLE, cam=cam(["bruno", "fen"], 1.05),
          act={"bruno": {"pose": "cheer", "expr": "excited"}, "fen": {"pose": "cheer", "expr": "excited"}},
          props={"plant": {"grow": 0.6, "during": [0.1, 0.9]}}),
        N("When you feel angry, stop and breathe. Gentle words make everything better.",
          act={"bruno": {"pose": "idle", "expr": "happy"}, "fen": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Stop. Breathe. Be gentle.", "sub": "A new story every day"},
})

# 014 - humility: lift others up
STORIES.append({
    "id": "014-fens-big-boast", "title": "Fen's Big Boast", "lesson": "True greatness lifts others up.",
    "scene": "meadow", "music": {"key": "A", "bpm": 100, "seed": 12},
    "characters": {"pip": char("pip", 230), "fen": char("fen", 600, -1), "bruno": char("bruno", 1250, -1)},
    "beats": [
        N("Fen the fox loved to show off.", cam=cam(["fen"], 1.35), act={"fen": {"expr": "excited", "pose": "bounce"}}),
        S("fen", "I'm the fastest! I'm the smartest! I'm the best at everything!", act={"fen": {"pose": "cheer"}}),
        S("fen", "Look at you, Pip. You're so slow!", cam=cam(["pip", "fen"], 1.15), act={"fen": {"pose": "idle", "expr": "happy"}, "pip": {"expr": "worried"}}),
        N("Pip's smile faded. He felt very small.", cam=cam(["pip"], 1.4), act={"pip": {"expr": "sad", "look": "down"}}),
        N("Wise old Bruno had seen everything.", cam=cam(["fen", "bruno"], 1.15),
          act={"bruno": {"expr": "worried", "move": "walk", "to": 880, "during": [0.0, 0.9]}, "fen": {"face": 1}}),
        S("bruno", "Fen, being great isn't about being the best.", act={"fen": {"expr": "worried"}}),
        S("bruno", "Truly great friends lift others up.", act={"bruno": {"expr": "happy"}}),
        N("Fen thought about it. Then he went back to Pip.", cam=cam(["pip", "fen"], 1.2),
          act={"fen": {"face": -1, "expr": "determined", "move": "walk", "to": 530, "during": [0.2, 1.0]}}),
        S("fen", "I'm sorry, Pip. Can we walk together? I'll go slow.", act={"fen": {"expr": "happy"}, "pip": {"look": "ahead", "expr": "happy"}}),
        S("pip", "I'd like that!", sfx=SPARKLE, act={"pip": {"expr": "excited", "pose": "cheer"}}),
        N("Real greatness is being kind, and helping others shine.", cam=cam(["pip", "fen"], 1.1),
          act={"pip": {"pose": "idle", "expr": "happy"}, "fen": {"pose": "bounce"}}),
    ],
    "outro": {"headline": "Lift someone up today!", "sub": "A new story every day"},
})

# 015 - welcome everyone
STORIES.append({
    "id": "015-everyone-is-welcome", "title": "Everyone Is Welcome", "lesson": "There is always room for one more friend.",
    "scene": "meadow", "music": {"key": "G", "bpm": 98, "seed": 13},
    "characters": {"luna": char("luna", 250), "fen": char("fen", 480, -1), "mila": char("mila", 1250, -1)},
    "beats": [
        N("Luna and Fen were playing in the meadow.", cam=cam(["luna", "fen"], 1.2),
          act={"luna": {"expr": "excited", "pose": "bounce"}, "fen": {"expr": "excited", "pose": "bounce"}}),
        N("Then a new lamb came by. Her name was Mila.", cam=cam(["fen", "mila"], 1.05),
          act={"mila": {"expr": "happy", "move": "walk", "to": 860, "during": [0.1, 1.0]}, "luna": {"pose": "idle"}, "fen": {"pose": "idle", "face": 1}}),
        S("mila", "Hello! Can I play with you?"),
        S("fen", "Hmm. You're new, and you look different. I don't think so.", act={"fen": {"expr": "determined"}, "mila": {"expr": "sad"}}),
        N("Mila's eyes filled with tears. She turned to walk away.", cam=cam(["mila"], 1.35),
          act={"mila": {"face": 1, "look": "down", "move": "walk", "to": 980, "during": [0.4, 1.0]}}),
        S("luna", "Wait, Mila! Please don't go!", cam=cam(["luna", "mila"], 1.05),
          act={"luna": {"expr": "worried", "move": "walk", "to": 700, "during": [0.0, 0.8]}, "mila": {"face": -1, "look": "ahead"}}),
        S("luna", "Everyone is welcome here. Come and play with us!", act={"luna": {"expr": "happy"}, "mila": {"expr": "worried"}}),
        N("Fen felt sorry. He knew Luna was right.", cam=cam(["fen"], 1.35), act={"fen": {"expr": "sad", "look": "down"}}),
        S("fen", "I'm sorry, Mila. Will you play with us?", cam=cam(["fen", "mila"], 1.05),
          act={"fen": {"expr": "happy", "look": "ahead", "move": "walk", "to": 520}}),
        S("mila", "Yes! Thank you, friends!", sfx=SPARKLE,
          act={"mila": {"expr": "excited", "pose": "bounce"}, "luna": {"expr": "excited", "pose": "cheer"}, "fen": {"expr": "excited", "pose": "bounce"}}),
        N("There is always room for one more friend. Make everyone feel welcome.",
          act={"luna": {"pose": "idle", "expr": "happy"}, "mila": {"pose": "idle", "expr": "happy"}, "fen": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Make someone feel welcome!", "sub": "A new story every day"},
})

# 016 - don't worry, you are cared for
STORIES.append({
    "id": "016-bo-doesnt-worry", "title": "Bo Doesn't Worry", "lesson": "Don't worry. You are cared for.",
    "scene": "meadow", "music": {"key": "D", "bpm": 88, "seed": 14, "mood": "calm"},
    "characters": {"luna": char("luna", 330), "bo": char("bo", 1250, -1, y=650)},
    "beats": [
        N("Luna couldn't stop worrying.", cam=cam(["luna"], 1.4), act={"luna": {"expr": "worried"}}),
        S("luna", "What if it rains tomorrow? What if I can't find food? What if...", act={"luna": {"expr": "scared", "pose": "shiver"}}),
        N("Her friend Bo flew down and landed nearby.", cam=cam(["luna", "bo"], 1.15),
          act={"bo": {"move": "fly", "to": [640, 1150], "during": [0.0, 0.9], "expr": "happy"}, "luna": {"pose": "idle", "expr": "worried"}}),
        S("bo", "Luna, look at me. Do birds worry about tomorrow?", act={"luna": {"look": "up"}}),
        S("luna", "Hmm... I don't think so.", act={"luna": {"look": "ahead"}}),
        S("bo", "We sing, we fly, and every day, there is always enough.",
          act={"bo": {"expr": "excited", "move": "fly", "to": [820, 900], "during": [0.1, 1.0]}}),
        S("bo", "And look at the flowers! They don't worry, and they're so beautiful.",
          act={"bo": {"expr": "happy", "move": "fly", "to": [620, 1120], "during": [0.0, 0.8]}, "luna": {"look": "down"}}),
        N("Luna smiled. She took a deep breath, and let her worries go.", cam=cam(["luna"], 1.3),
          act={"luna": {"expr": "happy", "look": "ahead"}}),
        S("luna", "Today is a gift. I'm going to enjoy it!", sfx=SPARKLE, cam=cam(["luna", "bo"], 1.1),
          act={"luna": {"expr": "excited", "pose": "cheer"}, "bo": {"expr": "excited"}}),
        N("Don't worry about tomorrow. You are loved and cared for, today and every day.",
          act={"luna": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Don't worry. You are cared for.", "sub": "A new story every day"},
})

# 017 - kind words build up
STORIES.append({
    "id": "017-kind-words", "title": "Kind Words", "lesson": "Use your words to lift others up.",
    "scene": "forest", "music": {"key": "C", "bpm": 94, "seed": 15},
    "characters": {"fen": char("fen", 220), "mila": char("mila", 560, -1), "pip": char("pip", 1250, -1)},
    "beats": [
        N("Mila loved to sing. Today, she sang for her friends.", cam=cam(["mila"], 1.35), act={"mila": {"expr": "excited", "pose": "bounce"}}),
        S("mila", "La la laaa... oops!", hold=0.3, act={"mila": {"expr": "scared", "pose": "idle"}}),
        N("Her voice cracked, and Fen started to laugh.", cam=cam(["fen", "mila"], 1.15), act={"fen": {"expr": "excited", "pose": "bounce"}}),
        S("fen", "Ha ha! That sounded so funny!"),
        N("Mila's heart sank. She wanted to hide.", cam=cam(["mila"], 1.45), act={"mila": {"expr": "sad", "look": "down"}, "fen": {"pose": "idle"}}),
        S("pip", "Mila, I loved your song! You were so brave to sing!", cam=cam(["mila", "pip"], 1.15),
          act={"pip": {"expr": "happy", "move": "walk", "to": 850, "during": [0.0, 0.6]}}),
        N("Mila looked up. Those kind words warmed her heart.", act={"mila": {"expr": "happy", "look": "ahead"}}),
        S("fen", "I'm sorry I laughed, Mila. Please sing again. I'll listen!", cam=cam(["fen", "mila"], 1.15),
          act={"fen": {"expr": "worried"}}),
        S("mila", "Okay! La la laaa!", sfx=SPARKLE, cam=cam(["fen", "pip"], 1.0),
          act={"mila": {"expr": "excited", "pose": "bounce"}, "fen": {"expr": "excited", "pose": "bounce"}, "pip": {"expr": "excited", "pose": "bounce"}}),
        N("Your words are powerful. Use them to lift others up.",
          act={"mila": {"pose": "idle", "expr": "happy"}, "fen": {"pose": "idle", "expr": "happy"}, "pip": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "Say something kind today!", "sub": "A new story every day"},
})

# 018 - be happy for others (no jealousy)
STORIES.append({
    "id": "018-happy-for-fen", "title": "Happy for Fen", "lesson": "Celebrate your friends. Your time will come.",
    "scene": "meadow", "music": {"key": "F", "bpm": 96, "seed": 16},
    "characters": {"luna": char("luna", 200), "fen": char("fen", 920, -1)},
    "props": {"seedL": {"kind": "sprout", "x": 400, "grow": 0}, "seedF": {"kind": "sprout", "x": 690, "grow": 0}},
    "beats": [
        N("Fen and Luna each planted a little seed.", cam=cam(["luna", "fen"], 1.0),
          act={"luna": {"expr": "happy", "pose": "crouch"}, "fen": {"expr": "happy", "pose": "crouch"}}),
        N("Days went by. And Fen's seed grew into a beautiful flowering tree!", cam=cam(["luna", "fen"], 1.0),
          act={"luna": {"pose": "idle"}, "fen": {"pose": "idle", "look": "up"}},
          props={"seedF": {"grow": 1.0, "during": [0.1, 1.0]}, "seedL": {"grow": 0.2, "during": [0.1, 1.0]}}),
        S("fen", "Wow! Look at my tree! Luna, come and see!", act={"fen": {"expr": "excited", "pose": "bounce", "look": "ahead"}}),
        N("But Luna's plant was still very small.", cam=cam(["luna"], 1.4), act={"luna": {"expr": "sad", "look": "down"}, "fen": {"pose": "idle"}}),
        S("luna", "That's not fair. Why does Fen get the best one?", act={"luna": {"expr": "angry", "look": "ahead"}}),
        N("Luna felt a little jealous. But then, she remembered something.", act={"luna": {"expr": "worried"}}),
        S("luna", "Fen is my friend. When he's happy, I can be happy too!", act={"luna": {"expr": "happy"}}),
        S("luna", "Fen, your tree is beautiful! I'm so happy for you!", cam=cam(["luna", "fen"], 1.05),
          act={"luna": {"expr": "excited", "move": "walk", "to": 260}}),
        S("fen", "Thank you, Luna! And look, your plant is growing too!", sfx=SPARKLE,
          act={"fen": {"expr": "excited"}, "luna": {"pose": "cheer"}}, props={"seedL": {"grow": 0.6, "during": [0.2, 1.0]}}),
        N("Be happy when good things happen to others. Your time to bloom will come too.",
          act={"luna": {"pose": "idle", "expr": "happy"}, "fen": {"expr": "happy"}}),
    ],
    "outro": {"headline": "Celebrate your friends!", "sub": "A new story every day"},
})

# 019 - listen to wise advice
STORIES.append({
    "id": "019-listen-to-bruno", "title": "Listen to Bruno", "lesson": "Wise advice keeps you safe.",
    "scene": "river", "sky": "storm", "music": {"key": "Bb", "bpm": 90, "seed": 17},
    "characters": {"bruno": char("bruno", 100), "fen": char("fen", 315, -1)},
    "beats": [
        N("It had rained all day. The river stones were wet and slippery.", rain=0.4, cam=cam(["bruno", "fen"], 1.0),
          act={"fen": {"expr": "excited", "look": "ahead"}}),
        S("bruno", "Fen, please don't cross the stones today. They're too slippery.", cam=cam(["bruno", "fen"], 1.3),
          act={"bruno": {"expr": "worried"}}),
        S("fen", "I'll be fine! I'm super fast!", act={"fen": {"face": 1, "expr": "excited", "pose": "bounce"}}),
        N("Fen didn't listen. He jumped onto the first stone, and...", cam=cam(["fen"], 1.2),
          act={"fen": {"pose": "idle", "move": "jump", "path": [460], "during": [0.4, 0.9]}}),
        S("fen", "Whoa! Help! I'm slipping!", sfx=[{"name": "whoosh", "at": 0.0}],
          act={"fen": {"expr": "scared", "pose": "shiver", "move": "slide", "to": 430, "during": [0.0, 0.4]}}),
        S("bruno", "Hold on, Fen! Grab my paw!", cam=cam(["bruno", "fen"], 1.25),
          act={"bruno": {"expr": "determined", "move": "walk", "to": 240, "during": [0.0, 0.6]}}),
        N("Bruno reached out, and pulled Fen back to safety.",
          act={"bruno": {"move": "walk", "to": 100, "during": [0.0, 0.5]}, "fen": {"pose": "idle", "move": "jump", "path": [315], "during": [0.3, 0.8]}}),
        S("fen", "Thank you, Bruno. I should have listened to you.", cam=cam(["bruno", "fen"], 1.3),
          act={"fen": {"face": -1, "expr": "sad"}, "bruno": {"expr": "happy"}}),
        S("bruno", "We all make mistakes. I'm just glad you're safe!", sky="day", skyFade=3.0, act={"fen": {"expr": "happy"}}),
        N("Listen to wise advice. It can keep you safe.", sfx=SPARKLE,
          act={"fen": {"pose": "cheer", "expr": "excited"}, "bruno": {"pose": "cheer", "expr": "excited"}}),
    ],
    "outro": {"headline": "Listen to wise words.", "sub": "A new story every day"},
})

# 020 - keep your promises
STORIES.append({
    "id": "020-pip-keeps-his-promise", "title": "Pip Keeps His Promise", "lesson": "Keep your promises. Be faithful.",
    "scene": "hill", "music": {"key": "E", "bpm": 90, "seed": 18},
    "characters": {"mila": char("mila", 1040, -1), "pip": char("pip", 150), "bo": char("bo", -150, 1, y=900)},
    "beats": [
        N("Pip made a promise to his friend Mila.", cam=cam(["pip"], 1.35), act={"pip": {"expr": "happy"}}),
        S("pip", "I'll meet you at the top of the hill, so we can watch the sunset together!", act={"pip": {"expr": "excited", "look": "up"}}),
        N("The hill was big, and Pip was slow. But he started climbing.", cam=cam(["pip"], 1.3),
          act={"pip": {"expr": "determined", "look": "ahead", "move": "walk", "to": 470, "during": [0.2, 1.0]}}),
        S("bo", "Hey Pip! Forget the hill. Come and play with me instead!", cam=cam(["pip", "bo"], 1.2),
          act={"bo": {"expr": "excited", "move": "fly", "to": [330, 1050], "during": [0.0, 0.6]}}),
        S("pip", "That sounds fun, Bo. But I made a promise to Mila.", act={"pip": {"expr": "happy"}}),
        S("bo", "A promise? Then go, Pip! You can do it!", act={"bo": {"expr": "happy", "move": "fly", "to": [560, 760], "during": [0.2, 1.0]}}),
        N("Step by step, Pip kept climbing, as the sky turned gold.", sky="sunset", skyFade=4.0, cam=cam(["pip"], 1.2),
          act={"pip": {"expr": "determined", "move": "walk", "to": 740, "during": [0.0, 1.0]}}),
        S("mila", "Pip! You came! You kept your promise!", cam=cam(["pip", "mila"], 1.15), act={"mila": {"expr": "excited", "pose": "bounce"}}),
        S("pip", "Of course! A promise is a promise.", sfx=SPARKLE, act={"pip": {"expr": "excited", "pose": "cheer"}, "mila": {"pose": "idle", "expr": "happy"}}),
        N("Together, they watched the most beautiful sunset.", cam=cam(["pip", "mila"], 1.0),
          act={"pip": {"pose": "idle", "expr": "happy", "face": -1}, "mila": {"expr": "happy"}}),
        N("Keep your promises. Being faithful is a beautiful gift."),
    ],
    "outro": {"headline": "Keep your promises!", "sub": "A new story every day"},
})

# ---------------------------------------------------------------- samples for the all-ages formats

# P01 - wisdom parable (after the folk tale "The Cracked Pot"): told slowly for every age
STORIES.append({
    "id": "p01-the-leaky-basket", "title": "The Leaky Basket", "lesson": "Your cracks can grow flowers.",
    "scene": "meadow", "sky": "dawn", "pause": 0.6, "narrator": {"id": "af_heart", "speed": 0.88},
    "music": {"key": "F", "bpm": 76, "seed": 21, "mood": "calm"},
    "characters": {"luna": char("luna", 160), "bruno": dict(char("bruno", 1250, -1), name="Grandpa Bruno")},
    "props": {
        "basket": {"kind": "basket", "fruit": "seed", "scale": 0.55, "full": 1, "attach": {"to": "luna", "dx": 75, "dy": -60}},
        **{f"f{i}": {"kind": "sprout", "x": x, "scale": 0.36, "grow": 0, "behind": True} for i, x in enumerate([230, 370, 500, 640, 770, 900])},
    },
    "beats": [
        N("Every morning, Luna carried seeds across the meadow to Grandpa Bruno's garden.", cam=cam(["luna"], 1.2),
          act={"luna": {"expr": "happy", "move": "walk", "to": 820, "during": [0.1, 1.0]}}, props={"basket": {"full": 0.4, "during": [0.1, 1.0]}}),
        N("But her basket had a little hole. And along the way, seeds always fell out.", cam=cam(["luna"], 1.35),
          act={"luna": {"expr": "worried", "look": "down"}}),
        S("luna", "Oh no. I lost half the seeds again. I'm so clumsy.", act={"luna": {"expr": "sad"}}),
        S("luna", "Grandpa Bruno, I'm sorry. I'm just not good enough.", cam=cam(["luna", "bruno"], 1.1),
          act={"bruno": {"expr": "happy", "move": "walk", "to": 1010, "during": [0.0, 0.7]}, "luna": {"look": "ahead"}}),
        S("bruno", "Shh, little one. Wait, and I'll show you something.", tempo=0.95),
        N("Weeks went by. Then one bright morning, they walked the path together.", sky="day", skyFade=3.0, cam=cam(["luna", "bruno"], 1.0),
          act={"luna": {"face": -1, "expr": "happy", "move": "walk", "to": 560, "during": [0.1, 1.0]},
               "bruno": {"move": "walk", "to": 820, "during": [0.15, 1.0]}},
          props={f"f{i}": {"grow": 1.0, "during": [0.1 + i * 0.1, 0.6 + i * 0.07]} for i in range(6)}),
        N("All along Luna's path, beautiful flowers had grown!", sfx=SPARKLE, act={"luna": {"expr": "excited", "pose": "cheer", "look": "down"}}),
        S("bruno", "Your falling seeds did this. Your weakness made the whole path beautiful.", tempo=0.95, cam=cam(["bruno"], 1.3),
          act={"luna": {"pose": "idle", "look": "ahead"}}),
        S("luna", "So even my mistakes can bring something good?", cam=cam(["luna"], 1.3), act={"luna": {"expr": "happy"}}),
        S("bruno", "Yes. We all have cracks. But love can grow something beautiful from every one of them.", tempo=0.95, cam=cam(["luna", "bruno"], 1.15)),
        N("Don't hide your cracks. Something beautiful may be growing from them.", cam=cam(["luna", "bruno"], 1.0)),
    ],
    "outro": {"headline": "Your cracks can grow flowers.", "sub": "Wisdom stories for the whole family"},
})

# K314 - Thirukkural story (Tamil, English subtitles). Kural 314: repay harm with good.
STORIES.append({
    "id": "k314-thirukkural-do-good", "title": "திருக்குறள் கதை", "lang": "ta", "pause": 0.5,
    "scene": "meadow", "music": {"key": "D", "bpm": 80, "seed": 22, "mood": "calm"},
    "characters": {"fen": dict(char("fen", 470), name="ஃபென்"), "pip": dict(char("pip", 880, -1), name="பிப்")},
    "props": {"basket": {"kind": "basket", "fruit": "apple", "x": 705, "scale": 0.8, "full": 1},
              "apple": {"kind": "apple", "x": 705, "show": False}},
    "beats": [
        N("திருக்குறள். குறள் எண், முன்னூற்றுப் பதினான்கு.", en="Thirukkural, couplet 314.", hold=0.3,
          card=["திருக்குறள்", "குறள் 314"]),
        N("இன்னாசெய் தாரை ஒறுத்தல், அவர்நாண நன்னயஞ் செய்து விடல்.", tempo=0.8, hold=0.8,
          card=["இன்னாசெய் தாரை ஒறுத்தல் அவர்நாண", "நன்னயஞ் செய்து விடல்."],
          cardSub="Punish those who harm you by doing them good, so they feel ashamed."),
        N("இதன் பொருள் என்ன? ஒரு கதை மூலம் பார்ப்போம்.", en="What does it mean? Let's see through a story.", cam=cam(["fen", "pip"], 1.0)),
        N("ஃபென் நரி, எப்போதும் பிப்பைக் கேலி செய்வான்.", en="Fen the fox always teased Pip.", cam=cam(["fen", "pip"], 1.1),
          act={"fen": {"expr": "excited", "pose": "bounce"}, "pip": {"expr": "sad"}}),
        S("fen", "ஏய், மெதுவான ஆமையே! உன் ஆப்பிளை நான் எடுத்துக்கொள்கிறேன்!", en="Hey, slowpoke turtle! I'm taking your apple!",
          act={"fen": {"pose": "idle", "face": -1, "move": "walk", "to": -260, "during": [0.45, 1.0]}},
          props={"apple": {"show": True, "to": -260, "during": [0.45, 1.0]}, "basket": {"full": 0.8, "during": [0.4, 0.5]}}),
        N("பிப்புக்கு வருத்தமாக இருந்தது. ஆனால் அவன் கோபப்படவில்லை.", en="Pip felt sad. But he did not get angry.", cam=cam(["pip"], 1.35),
          act={"pip": {"expr": "worried", "look": "down"}}),
        N("ஒரு நாள், பெரிய புயல் வந்தது. ஃபென் குளிரிலும் பசியிலும் நடுங்கினான்.", en="One day a big storm came. Fen shivered, cold and hungry.",
          sky="storm", skyFade=2.0, flash=[0.4], cam=cam(["fen", "pip"], 1.05),
          act={"fen": {"face": 1, "expr": "sad", "pose": "shiver", "move": "walk", "to": 430, "during": [0.2, 1.0]}, "pip": {"look": "ahead", "expr": "happy"}}),
        S("pip", "ஃபென்! மரத்தடிக்கு வா. இந்தா, என் ஆப்பிள்களைச் சாப்பிடு.", en="Fen! Come under the tree. Here, eat my apples.",
          act={"pip": {"expr": "happy"}}),
        N("ஃபென் வெட்கத்தால் தலை குனிந்தான்.", en="Fen bowed his head in shame.", cam=cam(["fen"], 1.35),
          act={"fen": {"pose": "idle", "look": "down", "move": "walk", "to": 540, "during": [0.0, 0.6]}}),
        S("fen", "நான் உன்னிடம் கெட்டவனாக நடந்துகொண்டேன். ஆனாலும் நீ எனக்கு நல்லது செய்தாய். என்னை மன்னித்துவிடு, பிப்.",
          en="I was mean to you, yet you were good to me. Please forgive me, Pip.", cam=cam(["fen", "pip"], 1.15)),
        S("pip", "பரவாயில்லை, ஃபென். இனி நாம் நண்பர்கள்!", en="It's okay, Fen. From now on, we are friends!", sky="day", skyFade=2.5, rainbow=1,
          sfx=SPARKLE, act={"pip": {"expr": "excited", "pose": "cheer"}, "fen": {"expr": "excited", "pose": "cheer", "look": "ahead"}}),
        N("தீமை செய்தவருக்கும் நன்மை செய்வதே, அவர்களைத் திருத்தும் சிறந்த வழி. இதுவே வள்ளுவர் சொன்ன பாடம்.",
          en="Doing good to those who harm us is the best way to change them. This is Valluvar's lesson.",
          act={"pip": {"pose": "idle", "expr": "happy"}, "fen": {"pose": "idle", "expr": "happy"}}),
    ],
    "outro": {"headline": "தீமைக்கும் நன்மை செய்!", "sub": "ஒவ்வொரு வாரமும் ஒரு திருக்குறள் கதை", "follow": "Follow செய்யுங்கள்!"},
})

for s in STORIES:
    s.setdefault("narrator", NARRATOR)
    s.setdefault("camera", {"zoom": 1.2})
    with open(os.path.join(HERE, s["id"] + ".json"), "w") as f:
        json.dump(s, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("wrote", s["id"])
