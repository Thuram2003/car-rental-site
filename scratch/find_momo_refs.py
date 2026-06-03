import os
import glob

search_terms = ["momo", "mtn-logo", "orange-logo", "momo-logos"]
app_path = "app"
components_path = "components"

def search_files(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith((".ts", ".tsx", ".css", ".js", ".jsx")):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        found = [term for term in search_terms if term in content.lower()]
                        if found:
                            print(f"{file_path}: found {found}")
                except Exception as e:
                    pass

print("Searching app/...")
search_files(app_path)
print("Searching components/...")
search_files(components_path)
