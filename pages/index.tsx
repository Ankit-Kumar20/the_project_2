import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ArrowRight } from "@phosphor-icons/react";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ContrastIcon } from "@/components/ContrastIcon";

const HomePage: NextPage = () => {
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
        backgroundColor: "#000000",
        transition: "background-color 0.3s",
        padding: "20px",
        paddingTop: "80px",
      }}
    >
      <Head>
        <title>TripFlow - Stop planning trips the hard way</title>
      </Head>

      {/* Vibeathon Banner */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#3d2415",
          padding: "12px 20px",
          textAlign: "center",
          zIndex: 100,
        }}
      >
        <span
          style={{
            color: "#ea580c",
            fontSize: "16px",
            fontWeight: "300",
          }}
        >
          100% Vibecoded - No humans harmed in the making of this app (just their sleep schedules)
        </span>
      </div>

      {/* Showcase Button */}
      <button
        style={{
          position: "fixed",
          top: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 24px",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "400",
          fontSize: "14px",
          zIndex: 101,
          backdropFilter: "blur(10px)",
        }}
      >
        Showcase - See live in action
      </button>

      <div
        style={{
          position: "absolute",
          inset: "180px 180px 100px",
          backgroundImage: "url(/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "40px",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "180px 180px 100px",
          borderRadius: "40px",
          zIndex: 1,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='7' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.18'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "absolute",
          top: "100px",
          left: "180px",
          right: "180px",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "24px",
            fontWeight: "400",
            color: "#fff",
          }}
        >
          <ContrastIcon size={32} />
          TripFlow
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={handleLogin}
            style={{
              padding: "10px 24px",
              borderRadius: "24px",
              border: "none",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
            cursor: "pointer",
            fontWeight: "400",
            fontSize: "14px",
          }}
        >
          Log In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          maxWidth: "900px",
          padding: "0 40px",
        }}
      >
        {/* Main Headline */}
        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 72px)",
            fontWeight: "400",
            color: "#fff",
            margin: "0 0 24px 0",
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
          }}
        >
          Stop planning trips the hard way
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            fontWeight: "400",
            color: "rgba(255, 255, 255, 0.8)",
            margin: "0 0 40px 0",
            lineHeight: "1.4",
            maxWidth: "700px",
          }}
        >
          Visual travel planning that adapts to your pace, budget, and interests
        </p>

        {/* CTA Button */}
        <button
          onClick={handleSignup}
          style={{
            padding: "12px 24px",
            borderRadius: "24px",
            border: "none",
            backgroundColor: "#fff",
            color: "#000",
            cursor: "pointer",
            fontWeight: "400",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f0f0f0";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Get Started
          <ArrowRight size={18} weight="regular" />
        </button>
      </div>



      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await auth.api.getSession({
    headers: context.req.headers as any,
  });

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default HomePage;
