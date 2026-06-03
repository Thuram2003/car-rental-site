from PIL import Image
import numpy as np

img = Image.open("public/momo-logos.png")
arr = np.array(img)

left_colors = set()
right_colors = set()

for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = arr[y, x]
        if a > 50:
            color = (r // 32 * 32, g // 32 * 32, b // 32 * 32)
            if x < img.width // 2:
                left_colors.add(color)
            else:
                right_colors.add(color)

print("Left half colors:", left_colors)
print("Right half colors:", right_colors)
