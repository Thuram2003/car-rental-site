from PIL import Image

# Open the copied combined logo file
img = Image.open("public/momo-logos.png")
width, height = img.size

# Split image horizontally
# Left half is MTN, right half is OM
left_half = img.crop((0, 0, width // 2, height))
right_half = img.crop((width // 2, 0, width, height))

# Save them as individual assets
left_half.save("public/mtn-logo.png")
right_half.save("public/orange-logo.png")

print("MTN logo size:", left_half.size)
print("Orange logo size:", right_half.size)
print("Successfully split and saved MTN and Orange Money logos.")
