import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession, signOut } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { useTheme } from "@/lib/theme-context";
import { Moon, Sun } from "@phosphor-icons/react";
import AuthModal from "@/components/AuthModal";
import NewTripModal from "@/components/NewTripModal";

interface Trip {
  id: string;
  name: string;
  destinations: string;
  startDate: string | null;
  endDate: string | null;
  travellers: string | null;
  pace: string | null;
  budget: string | null;
  interests: string | null;
  createdAt: string;
  fromLocation?: string;
  toLocation?: string;
  days?: number;
  stops?: string;
}

const Home: NextPage = () => {
  const { data: session, isPending } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState("");
  const [destinations, setDestinations] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState("");
  const [pace, setPace] = useState("balanced");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");
  const [mustSees, setMustSees] = useState("");
  const [avoid, setAvoid] = useState("");
  const [mobilityConstraints, setMobilityConstraints] = useState("");
  const [travelModes, setTravelModes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (session?.user) {
      fetchTrips();
    }
  }, [session]);

  useEffect(() => {
    const path = router.asPath;
    if (path === "/login") {
      setAuthMode("login");
      setAuthModalOpen(true);
      router.replace("/", undefined, { shallow: true });
    } else if (path === "/signup") {
      setAuthMode("signup");
      setAuthModalOpen(true);
      router.replace("/", undefined, { shallow: true });
    }
  }, [router]);

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const response = await fetch("/api/trips/list");
      const result = await response.json();
      if (result.success) {
        setTrips(result.trips);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCreateTrip = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          destinations,
          startDate,
          endDate,
          travellers,
          pace,
          budget,
          interests,
          mustSees,
          avoid,
          mobilityConstraints,
          travelModes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowModal(false);
        setName("");
        setDestinations("");
        setStartDate("");
        setEndDate("");
        setTravellers("");
        setPace("balanced");
        setBudget("");
        setInterests("");
        setMustSees("");
        setAvoid("");
        setMobilityConstraints("");
        setTravelModes("");
        fetchTrips();
        router.push(`/canvas?tripId=${result.tripId}`);
      } else {
        alert("Failed to generate travel flow");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrip = (tripId: string) => {
    router.push(`/canvas?tripId=${tripId}`);
  };

  const handleDeleteTrip = async (
    tripId: string,
    tripName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${tripName}"?`)) {
      return;
    }

    try {
      const response = await fetch("/api/trips/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tripId }),
      });

      const result = await response.json();

      if (result.success) {
        fetchTrips();
      } else {
        alert("Failed to delete trip");
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("An error occurred while deleting");
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className="absolute top-[20px] right-[20px] flex gap-[10px] items-center">
          {!session?.user && (
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthModalOpen(true);
              }}
              className="px-[20px] py-[10px] rounded-[24px] border-[1.5px] cursor-pointer text-[14px] font-medium transition-all duration-200"
              style={{
                backgroundColor: "var(--hover-bg)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              Login
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="p-[10px] rounded-[24px] border-[1.5px] cursor-pointer flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: "var(--hover-bg)",
              borderColor: "var(--border-color)",
            }}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon size={20} weight="regular" color="var(--text-primary)" />
            ) : (
              <Sun size={20} weight="regular" color="var(--text-primary)" />
            )}
          </button>
        </div>
        <h1 className={styles.title}>Welcome to Next.js on Replit!</h1>

        {isPending ? (
          <p className={styles.description}>Loading...</p>
        ) : session?.user ? (
          <div>
            <p className={styles.description}>
              Welcome,{" "}
              {String(session.user.name || session.user.email || "User")}!
            </p>
            <div className="mt-[20px] flex gap-[10px] justify-center">
              <button
                onClick={() => setShowModal(true)}
                className="px-[30px] py-[12px] text-[16px] bg-[#0070f3] text-white border-none rounded-[24px] cursor-pointer font-semibold"
              >
                New Trip
              </button>
              <button
                onClick={handleSignOut}
                className="px-[20px] py-[10px] text-[16px] bg-[#ff0000] text-white border-none rounded-[24px] cursor-pointer"
              >
                Sign Out
              </button>
            </div>

            {/* Trips List */}
            <div className="mt-[40px] max-w-[800px] mx-auto my-[40px]">
              <h2
                className="mb-[20px]"
                style={{ color: "var(--text-primary)" }}
              >
                Your Trips
              </h2>
              {loadingTrips ? (
                <p>Loading trips...</p>
              ) : trips.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>
                  No trips yet. Create your first trip!
                </p>
              ) : (
                <div className="grid gap-[15px]">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => handleViewTrip(trip.id)}
                      className="p-[20px] rounded-[24px] border-[1.5px] cursor-pointer transition-all duration-200 relative"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-color)",
                        boxShadow:
                          theme === "light"
                            ? "0 2px 4px rgba(0,0,0,0.05)"
                            : "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          theme === "light"
                            ? "0 4px 12px rgba(0,0,0,0.1)"
                            : "0 4px 12px rgba(0,0,0,0.5)";
                        e.currentTarget.style.borderColor = "#0070f3";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          theme === "light"
                            ? "0 2px 4px rgba(0,0,0,0.05)"
                            : "0 2px 4px rgba(0,0,0,0.3)";
                        const borderColor = getComputedStyle(
                          document.documentElement
                        ).getPropertyValue("--border-color");
                        e.currentTarget.style.borderColor = borderColor;
                      }}
                    >
                      <button
                        onClick={(e) => handleDeleteTrip(trip.id, trip.name, e)}
                        className="absolute top-[15px] right-[15px] px-[12px] py-[6px] text-[12px] bg-[#ff4444] text-white border-none rounded-[24px] cursor-pointer font-medium transition-colors duration-200 hover:bg-[#cc0000]"
                      >
                        Delete
                      </button>
                      <h3
                        className="m-0 mb-[10px] pr-[80px]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {trip.name}
                      </h3>
                      <p
                        className="my-[5px] mx-0 text-[14px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <strong>Route:</strong> {trip.fromLocation} →{" "}
                        {trip.toLocation}
                      </p>
                      <p
                        className="my-[5px] mx-0 text-[14px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <strong>Duration:</strong> {trip.days} days
                      </p>
                      {trip.stops && (
                        <p
                          className="my-[5px] mx-0 text-[14px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <strong>Stops:</strong> {trip.stops}
                        </p>
                      )}
                      <p
                        className="mt-[10px] mx-0 mb-0 text-[12px] opacity-70"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Created: {new Date(trip.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showModal && (
              <NewTripModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                name={name}
                setName={setName}
                destinations={destinations}
                setDestinations={setDestinations}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                travellers={travellers}
                setTravellers={setTravellers}
                pace={pace}
                setPace={setPace}
                budget={budget}
                setBudget={setBudget}
                interests={interests}
                setInterests={setInterests}
                mustSees={mustSees}
                setMustSees={setMustSees}
                avoid={avoid}
                setAvoid={setAvoid}
                mobilityConstraints={mobilityConstraints}
                setMobilityConstraints={setMobilityConstraints}
                travelModes={travelModes}
                setTravelModes={setTravelModes}
                loading={loading}
                onSubmit={handleCreateTrip}
              />
            )}
          </div>
        ) : null}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </div>
  );
};

export default Home;
