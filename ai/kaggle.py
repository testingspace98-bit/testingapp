"""Run a GPU job on Kaggle (free tier) and download its output.

Usage:
  python3 ai/kaggle.py images jobs.json out_dir     # character images with SDXL

jobs.json: [{"name": "owl", "prompt": "...", "style": "3d" | "2d", "n": 4, "seed": 1}, ...]

Uses Kaggle's classic REST API on www.kaggle.com. The account key is never stored in
this repo: in the cloud session the network proxy adds it to each request. Elsewhere,
set KAGGLE_USERNAME and KAGGLE_KEY and they are sent as HTTP basic auth.
"""
import base64
import json
import os
import sys
import time
import urllib.parse
import urllib.request

API = "https://www.kaggle.com/api/v1"
HERE = os.path.dirname(os.path.abspath(__file__))


def call(path, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json"}, method="POST" if body is not None else "GET")
    if os.environ.get("KAGGLE_KEY"):
        tok = base64.b64encode(f"{os.environ['KAGGLE_USERNAME']}:{os.environ['KAGGLE_KEY']}".encode()).decode()
        req.add_header("Authorization", f"Basic {tok}")
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


def run(code_file, jobs, out_dir, slug="character-generator"):
    user = call("/hello")["userName"]
    code = open(code_file).read().replace("__JOBS__", json.dumps(jobs))
    res = call("/kernels/push", {
        "slug": f"{user}/{slug}", "newTitle": slug, "text": code, "language": "python", "kernelType": "script",
        "isPrivate": True, "enableGpu": True, "enableInternet": True, "machineShape": "NvidiaTeslaT4",
        "datasetDataSources": [], "competitionDataSources": [], "kernelDataSources": [], "categoryIds": []})
    if res.get("hasError"):
        sys.exit("push failed: " + res.get("error", ""))
    print(f"pushed version {res['versionNumber']}: {res['url']}", flush=True)
    q = urllib.parse.urlencode({"userName": user, "kernelSlug": slug})
    t0 = time.time()
    while True:
        time.sleep(30)
        st = call(f"/kernels/status?{q}")["status"]
        print(f"  {int(time.time() - t0)}s {st}", flush=True)
        if st in ("complete", "error", "cancelAcknowledged"):
            break
    out = call(f"/kernels/output?{q}")
    os.makedirs(out_dir, exist_ok=True)
    got = []
    for f in out.get("files", []):
        name = os.path.basename(f["fileName"])
        if not name.endswith(".png"):
            continue
        urllib.request.urlretrieve(f["url"], os.path.join(out_dir, name))
        got.append(name)
    if st != "complete" or not got:
        log = out.get("log", "")
        try:
            log = "".join(x.get("data", "") for x in json.loads(log))
        except Exception:
            pass
        print(log[-3000:])
        sys.exit(f"job ended with status {st}")
    print("downloaded:", ", ".join(sorted(got)))


if __name__ == "__main__":
    mode, jobs_file, out_dir = sys.argv[1:4]
    assert mode == "images"
    run(os.path.join(HERE, "kaggle_gen", "generate.py"), json.load(open(jobs_file)), out_dir)
