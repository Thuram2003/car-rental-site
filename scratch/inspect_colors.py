from PIL import Image
import numpy as np

img = Image.open("public/momo-logos.png")
arr = np.array(img)

# Print unique colors (simplified to 3-digit RGB to keep it clean)
unique_colors = set()
for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = arr[y, x]
        if a > 50: # Only look at opaque/semi-opaque pixels
            # Round to nearest 16 to group similar colors
            unique_colors.add((r // 16 * 16, g // 16 * 16, b // 16 * 16))

print("Unique grouped RGB colors:", sorted(list(unique_colors)))
