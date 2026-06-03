import re
import json

transcript_path = r"C:\Users\Thuram Jr\.gemini\antigravity\brain\a733d18a-613b-4162-a82d-7b5bd3da5ff2\.system_generated\logs\transcript.jsonl"
content = open(transcript_path, "r", encoding="utf-8").read()

# Let's search for image links
image_links = re.findall(r'!\[.*?\]\((.*?)\)', content)
print("Image Links:", set(image_links))

# Let's search for any image filename
images = re.findall(r'[\w-]+\.(?:png|jpg|jpeg|svg)', content, re.IGNORECASE)
print("Image Files:", set(images))

# Let's also print last user input details
lines = content.strip().split("\n")
for line in reversed(lines):
    try:
        obj = json.loads(line)
        if obj.get("type") == "USER_INPUT":
            print("Last user message content length:", len(obj.get("content", "")))
            # print first 200 and last 200 chars
            c = obj.get("content", "")
            print("Start of user content:\n", c[:500])
            print("End of user content:\n", c[-500:])
            break
    except Exception as e:
        pass
