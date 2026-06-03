from PIL import Image
import numpy as np

img = Image.open(r"C:\Users\Thuram Jr\.gemini\antigravity\brain\a733d18a-613b-4162-a82d-7b5bd3da5ff2\media__1780459570371.png")
print("Size:", img.size)
print("Mode:", img.mode)

# Let's inspect pixel colors to check if there are distinct yellow and black regions
arr = np.array(img)
# Yellow usually has high Red and Green, low Blue.
# Black/Orange has low/medium values.
# Let's look at the colors present.
# Let's see if we can divide it horizontally or if it contains both side-by-side.
# If size is (28, 28), it's very small. Let's see if there is any other file in the tempmediaStorage.
# Wait, let's print unique colors or check if we can save them.
# Let's check if the image width is actually larger, like 56x28?
# No, size printed (28, 28). Let's print the size again.
print("Width:", img.width, "Height:", img.height)
