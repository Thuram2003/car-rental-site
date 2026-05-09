import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
