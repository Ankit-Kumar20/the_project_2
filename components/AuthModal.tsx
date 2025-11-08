import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { ContrastIcon } from "./ContrastIcon";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
  onSwitchMode: (mode: "login" | "signup") => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
}: AuthModalProps) {
  const [closeHover, setCloseHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const [enableHover, setEnableHover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  // Enable hover effects after a brief delay to avoid initial hover state
  if (isOpen && !enableHover) {
    setTimeout(() => setEnableHover(true), 100);
  }

  const handleGoogle = () => {
    setIsLoading(true);
    signIn.social({ 
      provider: "google",
      callbackURL: "/dashboard"
    });
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 z-[1000]"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-[24px] p-8 relative transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-primary)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 18a6 6 0 0 0 0-12v12z" />
            </svg>
            <h2
              className="text-xl font-normal"
              style={{ color: "var(--text-primary)" }}
            >
              {mode === "login" ? "Login" : "Sign Up"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl w-[44px] h-[44px] rounded-full border-none cursor-pointer font-light flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: closeHover && enableHover
                ? "var(--text-primary)"
                : "var(--bg-primary)",
              color: closeHover && enableHover ? "var(--bg-primary)" : "var(--text-primary)",
            }}
            onMouseEnter={() => enableHover && setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
          >
            ✕
          </button>
        </div>

        <button
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full font-medium py-4 px-6 rounded-[24px] flex items-center justify-center gap-3 transition-all duration-200"
          style={{
            backgroundColor: googleHover && !isLoading
              ? "var(--text-primary)"
              : "var(--bg-primary)",
            color: googleHover && !isLoading ? "var(--bg-primary)" : "var(--text-primary)",
            border: `1px solid var(--border-color)`,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={() => !isLoading && setGoogleHover(true)}
          onMouseLeave={() => setGoogleHover(false)}
        >
          {isLoading ? (
            <>
              <div className="animate-spin">
                <ContrastIcon size={24} />
              </div>
              Redirecting...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p
          className="text-xs text-center mt-12"
          style={{ color: "var(--text-secondary)" }}
        >
          By using this service you agree to our{" "}
          <Link
            href="/terms"
            className="hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            Privacy Policy
          </Link>
        </p>

        <p
          className="text-sm text-center mt-6"
          style={{ color: "var(--text-secondary)" }}
        >
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => onSwitchMode("signup")}
                className="hover:underline bg-transparent border-none cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => onSwitchMode("login")}
                className="hover:underline bg-transparent border-none cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
