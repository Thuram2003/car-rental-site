import os
import glob
import time

brain_path = r"C:\Users\Thuram Jr\.gemini\antigravity\brain"
now = time.time()

for p in glob.glob(brain_path + "/**/*.png", recursive=True):
    mtime = os.path.getmtime(p)
    if now - mtime < 24 * 3600: # Modified in the last 24 hours
        print(p, "Size:", os.path.getsize(p), "Modified:", time.ctime(mtime))
