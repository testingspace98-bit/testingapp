# Runs on Kaggle's free GPU (T4). Image-to-video with LTX-Video (Lightricks), via diffusers.
# Input images are embedded below by ai/kaggle.py. Output: /kaggle/working/out/<name>.mp4
import base64, io, os, time, torch
from PIL import Image
from diffusers import LTXImageToVideoPipeline
from diffusers.utils import export_to_video
from huggingface_hub import hf_hub_download

JOBS = __JOBS__
os.makedirs("/kaggle/working/out", exist_ok=True)

# print the model licence so we can check commercial use
for name in ("LICENSE", "README.md"):
    try:
        p = hf_hub_download("Lightricks/LTX-Video", name)
        open(f"/kaggle/working/out/model-{name}.txt", "w").write(open(p).read())
        print(f"--- {name} (first 1500 chars) ---\n", open(p).read()[:1500], flush=True)
    except Exception as e:
        print("no", name, e)

pipe = LTXImageToVideoPipeline.from_pretrained("Lightricks/LTX-Video", torch_dtype=torch.bfloat16)
pipe.enable_model_cpu_offload()
pipe.vae.enable_tiling()
NEG = "worst quality, inconsistent motion, blurry, jittery, distorted, deformed, morphing, extra limbs, text, watermark"
for job in JOBS:
    img = Image.open(io.BytesIO(base64.b64decode(job["image"]))).convert("RGB").resize((job["w"], job["h"]))
    t0 = time.time()
    frames = pipe(image=img, prompt=job["prompt"], negative_prompt=NEG, width=job["w"], height=job["h"],
                  num_frames=job.get("frames", 97), num_inference_steps=job.get("steps", 40),
                  generator=torch.Generator().manual_seed(job.get("seed", 0))).frames[0]
    export_to_video(frames, f"/kaggle/working/out/{job['name']}.mp4", fps=24)
    print(f"saved {job['name']}.mp4 in {time.time() - t0:.0f}s", flush=True)
print("DONE")
