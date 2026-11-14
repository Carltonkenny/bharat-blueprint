#!/usr/bin/env python
"""S01-parity check (reviewer tool, standard library only; needs ffmpeg on PATH).

Usage:  python parity_check.py <video.mp4> [--json out.json] [--tmp <folder>]

Measures every frame of the film at 320x180 with ffmpeg signalstats and reports:
  meanYDIF      mean absolute luma change between consecutive frames
  motionFrames  share of frames whose change exceeds 0.5
  emptyFrames   share of frames that carry almost no drawn content: mean luma within
                0.6 levels of the film's own 3rd-percentile frame (grid and HUD only)
  longestEmpty  longest run of such frames, in seconds
Thresholds calibrated on Series 1 (E02: 0.438 / 23.6% / 6.8%; E04: 0.296 / 9.6% / 6.0%):
  PASS needs meanYDIF >= 0.20, motionFrames >= 8%, emptyFrames <= 12%, longestEmpty <= 4.0 s.
Exit code 0 = PASS, 1 = FAIL.
"""
import argparse, json, os, subprocess, sys, tempfile

TH = {"meanYDIF": 0.20, "motionFrames": 0.08, "emptyFrames": 0.12, "longestEmpty": 4.0}


def analyse(video, tmp):
    video = os.path.abspath(video)
    tmp = os.path.abspath(tmp)
    os.makedirs(tmp, exist_ok=True)
    name = "parity_stats.txt"
    cwd = os.getcwd()
    os.chdir(tmp)  # keep the metadata path free of drive letters (ffmpeg filter syntax)
    try:
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", video, "-vf",
             "scale=320:180,signalstats,metadata=mode=print:file=" + name, "-f", "null", "-"],
            check=True)
        yavg, ydif, fps = [], [], 30.0
        with open(name, encoding="utf8") as fh:
            for line in fh:
                if "YAVG=" in line:
                    yavg.append(float(line.split("=")[1]))
                elif "YDIF=" in line:
                    ydif.append(float(line.split("=")[1]))
    finally:
        os.chdir(cwd)
    p = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=r_frame_rate", "-of", "csv=p=0", video], capture_output=True, text=True)
    try:
        a, b = p.stdout.strip().split("/")
        fps = float(a) / float(b)
    except Exception:
        pass
    n = len(ydif)
    base = sorted(yavg)[int(0.03 * len(yavg))]
    empty = [(v - base) < 0.6 for v in yavg]
    run = best = 0
    for e in empty:
        run = run + 1 if e else 0
        best = max(best, run)
    res = {
        "video": os.path.basename(video), "frames": n, "seconds": round(n / fps, 1),
        "meanYDIF": round(sum(ydif) / n, 4),
        "motionFrames": round(sum(1 for d in ydif if d > 0.5) / n, 4),
        "emptyFrames": round(sum(empty) / len(empty), 4),
        "longestEmpty": round(best / fps, 2),
    }
    res["pass"] = (res["meanYDIF"] >= TH["meanYDIF"] and res["motionFrames"] >= TH["motionFrames"]
                   and res["emptyFrames"] <= TH["emptyFrames"] and res["longestEmpty"] <= TH["longestEmpty"])
    res["thresholds"] = TH
    return res


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--json")
    ap.add_argument("--tmp", default=os.path.join(tempfile.gettempdir(), "bb_parity"))
    a = ap.parse_args()
    r = analyse(a.video, a.tmp)
    print(json.dumps(r, indent=2))
    if a.json:
        with open(a.json, "w", encoding="utf8") as fh:
            json.dump(r, fh, indent=2)
    sys.exit(0 if r["pass"] else 1)
