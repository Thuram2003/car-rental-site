from PIL import Image
import os

folder = r"C:\Users\Thuram Jr\.gemini\antigravity\brain\tempmediaStorage"
for f in os.listdir(folder):
    if f.endswith(".png"):
        p = os.path.join(folder, f)
        try:
            img = Image.open(p)
            print(f, "Size:", img.size, "Mode:", img.mode)
        except Exception as e:
            print(f, "Error:", e)
