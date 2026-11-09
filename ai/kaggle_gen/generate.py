# Runs on Kaggle's free GPU (T4). Generates character images with Stable Diffusion XL
# (CreativeML Open RAIL++-M licence: commercial use allowed) into /kaggle/working/out.
# The job list below is filled in by ai/kaggle.py before each upload.
import os
import torch
from diffusers import StableDiffusionXLPipeline

JOBS = __JOBS__

STYLES = {
    "3d": ("3D animated movie still, Pixar style character, soft cinematic lighting, subsurface scattering, "
           "highly detailed fur and textures, cute, expressive big eyes, full body, centered, simple soft background"),
    "2d": ("2D cartoon character, children's storybook illustration, thick dark navy outlines, flat bright colors, "
           "simple shapes, cute, full body, standing, centered, plain pure white background"),
}
NEG = ("photo, realistic photograph, text, watermark, signature, logo, blurry, lowres, deformed, extra limbs, "
       "extra eyes, cropped, multiple characters, duplicate")

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True
).to("cuda")
os.makedirs("/kaggle/working/out", exist_ok=True)
for job in JOBS:
    style = STYLES[job.get("style", "3d")]
    for i in range(job.get("n", 4)):
        g = torch.Generator("cuda").manual_seed(job.get("seed", 1) + i)
        img = pipe(prompt=f"{job['prompt']}, {style}", negative_prompt=NEG, num_inference_steps=30,
                   guidance_scale=6.5, width=1024, height=1024, generator=g).images[0]
        path = f"/kaggle/working/out/{job['name']}-{i + 1}.png"
        img.save(path)
        print("saved", path, flush=True)
print("DONE")
