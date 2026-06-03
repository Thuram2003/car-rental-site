import re

transcript_path = r"C:\Users\Thuram Jr\.gemini\antigravity\brain\a733d18a-613b-4162-a82d-7b5bd3da5ff2\.system_generated\logs\transcript.jsonl"
content = open(transcript_path, "r", encoding="utf-8").read()

matches = re.findall(r'<img [^>]+>', content)
print("All img tags in transcript:")
for idx, m in enumerate(matches):
    print(f"{idx}: {m}")
