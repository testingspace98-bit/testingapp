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

for s in STORIES:
    s.setdefault("narrator", NARRATOR)
    s.setdefault("camera", {"zoom": 1.2})
    with open(os.path.join(HERE, s["id"] + ".json"), "w") as f:
        json.dump(s, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("wrote", s["id"])
