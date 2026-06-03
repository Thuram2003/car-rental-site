import os

search_terms = ["payment_provider", "paymentprovider", "provider", "momo"]
admin_path = "app/admin"

for root, dirs, files in os.walk(admin_path):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    found = [term for term in search_terms if term in content.lower()]
                    if found:
                        print(f"{file_path}: found {found}")
            except Exception:
                pass
