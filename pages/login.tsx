import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";

export default function Login() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (session?.user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Failed to sign in");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signIn.social({ provider: "google" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", fontSize: "16px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", fontSize: "16px" }}
          />
        </div>
        {error && (
          <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <button
        onClick={handleGoogle}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          backgroundColor: "#DB4437",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "12px",
        }}
      >
        Continue with Google
      </button>
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}

