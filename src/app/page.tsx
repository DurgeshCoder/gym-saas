import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LandingPage from "@/components/landing-page";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return <LandingPage isLoggedIn={false} />;
  }

  const role: string = (session.user as any).role;

  switch (role) {
    case "SUPER_ADMIN":
      redirect("/super-admin");
    case "GYM_OWNER":
      redirect("/owner");
    case "TRAINER":
      redirect("/trainer");
    case "MEMBER":
      redirect("/member");
    default:
      return <LandingPage isLoggedIn={true} />;
  }
}
