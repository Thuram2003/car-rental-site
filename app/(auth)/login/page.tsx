import { LoginForm } from "@/components/auth";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
