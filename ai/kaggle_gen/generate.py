# Runs on Kaggle's free GPU. Generates character designs with Stable Diffusion XL
# (CreativeML Open RAIL++-M licence: commercial use allowed) and saves PNGs to /kaggle/working.
import json, os, torch
from diffusers import StableDiffusionXLPipeline

JOBS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "jobs.json"))) if os.path.exists("jobs.json") else None
if JOBS is None:
    import glob
    cands = glob.glob("/kaggle/input/**/jobs.json", recursive=True)
    JOBS = json.load(open(cands[0])) if cands else None
JOBS = JOBS or [{"name": "owl", "n": 4, "seed": 7, "prompt": "a wise kind old grandfather owl with small round glasses and a tiny brown scarf, big gentle eyes, warm smile, facing right"}]

STYLE = ("2D cartoon character, children's storybook illustration, thick dark navy outlines, flat bright colors, "
         "simple shapes, cute, full body, standing, centered, plain pure white background")
NEG = "realistic, photo, 3d render, text, watermark, signature, blurry, extra limbs, cropped, multiple characters, background scenery"

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
os.makedirs("/kaggle/working/out", exist_ok=True)
for job in JOBS:
    for i in range(job.get("n", 4)):
        g = torch.Generator("cuda").manual_seed(job.get("seed", 1) + i)
        img = pipe(prompt=f"{job['prompt']}, {STYLE}", negative_prompt=NEG, num_inference_steps=30,
                   guidance_scale=7.0, width=1024, height=1024, generator=g).images[0]
        path = f"/kaggle/working/out/{job['name']}-{i + 1}.png"
        img.save(path)
        print("saved", path, flush=True)
print("DONE")
