import { useRouter } from "next/router";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

export default function Signup() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    router.push("/");
  }, [router]);

  if (session?.user) {
    router.push("/");
  }

  return null;
}
