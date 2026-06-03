with open("app/admin/bookings/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        if any(term in line.lower() for term in ["payment_provider", "paymentprovider", "provider", "momo"]):
            print(f"Line {i}: {line.strip()}")
