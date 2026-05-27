import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { createClient } from "@/lib/supabase/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user profile on the server side for instant navbar rendering
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profileData) {
      profile = profileData;
    } else {
      // Fallback to user metadata if profile query fails
      profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: user.user_metadata?.role || "customer",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar initialProfile={profile} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
