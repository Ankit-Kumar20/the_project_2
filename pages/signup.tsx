import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signUp, useSession, signIn } from "@/lib/auth-client";

export default function Signup() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (session?.user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Failed to sign up");
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
    <div className="max-w-[400px] my-[50px] mx-auto p-5">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-[15px]">
          <label htmlFor="name" className="block mb-[5px]">
            Name:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 text-base"
          />
        </div>
        <div className="mb-[15px]">
          <label htmlFor="email" className="block mb-[5px]">
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 text-base"
          />
        </div>
        <div className="mb-[15px]">
          <label htmlFor="password" className="block mb-[5px]">
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-2 text-base"
          />
        </div>
        {error && (
          <div className="text-red-600 mb-[15px]">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2.5 text-base bg-[#0070f3] text-white border-none rounded-[5px] ${
            loading ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <button
        onClick={handleGoogle}
        className="w-full p-2.5 text-base bg-[#DB4437] text-white border-none rounded-[5px] cursor-pointer mt-3"
      >
        Continue with Google
      </button>
      <p className="mt-[15px] text-center">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
