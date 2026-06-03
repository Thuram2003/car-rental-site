transcript_path = r"C:\Users\Thuram Jr\.gemini\antigravity\brain\a733d18a-613b-4162-a82d-7b5bd3da5ff2\.system_generated\logs\transcript.jsonl"
content = open(transcript_path, "r", encoding="utf-8").read()

idx = 0
while True:
    pos = content.find("media__", idx)
    if pos == -1:
        break
    start = max(0, pos - 150)
    end = min(len(content), pos + 150)
    print(f"Occurrence at {pos}:")
    print(repr(content[start:end]))
    print("-" * 50)
    idx = pos + 1
