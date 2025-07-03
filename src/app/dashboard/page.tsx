import { redirect } from "next/navigation"
import { auth } from "@/lib/auth-config"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  // Redirect based on user role
  if (session.user.role === "STUDENT") {
    redirect("/dashboard/student")
  } else if (session.user.role === "EMPLOYER") {
    redirect("/dashboard/employer")
  } else {
    redirect("/auth/login")
  }
}
