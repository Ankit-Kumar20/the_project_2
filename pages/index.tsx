import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTheme } from "@/lib/theme-context";
import { Moon, Sun } from "@phosphor-icons/react";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const HomePage: NextPage = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleLogin = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const handleSignup = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-primary)",
        transition: "background-color 0.3s",
      }}
    >
      <Head>
        <title>Welcome</title>
      </Head>

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            padding: "10px",
            borderRadius: "24px",
            border: "1.5px solid var(--border-color)",
            backgroundColor: "var(--hover-bg)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {theme === "light" ? (
            <Moon size={20} weight="regular" color="var(--text-primary)" />
          ) : (
            <Sun size={20} weight="regular" color="var(--text-primary)" />
          )}
        </button>
      </div>

      <main
        style={{
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "2rem",
            color: "var(--text-primary)",
          }}
        >
          Welcome
        </h1>

        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleLogin}
            style={{
              padding: "15px 40px",
              fontSize: "18px",
              borderRadius: "24px",
              border: "none",
              backgroundColor: "#0070f3",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Login
          </button>
          <button
            onClick={handleSignup}
            style={{
              padding: "15px 40px",
              fontSize: "18px",
              borderRadius: "24px",
              border: "1.5px solid var(--border-color)",
              backgroundColor: "var(--hover-bg)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Sign Up
          </button>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </div>
  );
};

export default HomePage;
