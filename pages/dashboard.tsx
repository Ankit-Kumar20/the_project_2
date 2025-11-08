import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession, signOut } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { Moon, Sun, Plus, MapPin, Calendar, Users, Trash } from "@phosphor-icons/react";
import NewTripModal from "@/components/NewTripModal";
import { ContrastIcon } from "@/components/ContrastIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Trip {
  id: string;
  name: string;
  destinations: string;
  startDate: string | null;
  endDate: string | null;
  travellers: string | null;
  createdAt: string;
  fromLocation?: string;
  toLocation?: string;
  days?: number;
  stops?: string;
}

const Dashboard: NextPage = () => {
  const { data: session, isPending } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [startingPoint, setStartingPoint] = useState("");
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
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchTrips();
    }
  }, [session]);

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

  const handleSignOut = () => {
    setIsSigningOut(true);
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const handleCreateTrip = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          startingPoint,
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
        setStartingPoint("");
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

  const buttonClass = "px-5 py-2.5 rounded-full border-none cursor-pointer font-medium text-sm transition-all duration-200 flex items-center gap-2";
  const iconButtonClass = "w-11 h-11 border-none rounded-full cursor-pointer flex items-center justify-center transition-all duration-200";

  if (isPending) {
    return (
      <div 
        className="flex justify-center items-center h-screen"
        style={{ background: theme === "dark" ? "#101011" : "#fafafa" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme === "dark" ? "#fff" : "#000" }}></div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme === "dark" ? "#101011" : "#fafafa",
        fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Head>
        <title>Dashboard - Your Trips</title>
      </Head>

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: theme === "dark" ? "rgba(16, 16, 17, 0.8)" : "rgba(250, 250, 250, 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "20px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 400,
              color: theme === "dark" ? "#fff" : "#000",
            }}
          >
            Your Trips
          </h1>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={toggleTheme}
              className={iconButtonClass}
              style={{
                background: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: theme === "dark" ? "#fff" : "#000",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme === "dark" ? "#fff" : "#000";
                e.currentTarget.style.color = theme === "dark" ? "#000" : "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme === "dark" ? "#1a1a1a" : "#f3f4f6";
                e.currentTarget.style.color = theme === "dark" ? "#fff" : "#000";
              }}
            >
              {theme === "dark" ? <Sun size={20} weight="regular" /> : <Moon size={20} weight="regular" />}
            </button>
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={buttonClass}
              style={{
                background: isSigningOut ? "#ef4444" : theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: isSigningOut ? "#fff" : theme === "dark" ? "#fff" : "#000",
                cursor: isSigningOut ? "not-allowed" : "pointer",
                opacity: isSigningOut ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSigningOut) {
                  e.currentTarget.style.background = "#ef4444";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSigningOut) {
                  e.currentTarget.style.background = theme === "dark" ? "#1a1a1a" : "#f3f4f6";
                  e.currentTarget.style.color = theme === "dark" ? "#fff" : "#000";
                }
              }}
            >
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 40px 80px",
        }}
      >
        {/* Trips Grid */}
        {loadingTrips ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <LoadingSpinner 
              size={48} 
              showText 
              text="Loading trips..." 
              color={theme === "dark" ? "#a0a0a0" : "#666"}
            />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "24px",
            }}
          >
            {/* New Trip Card */}
            <div
              onClick={() => setShowModal(true)}
              style={{
                padding: "28px",
                borderRadius: "24px",
                background: "transparent",
                border: `2px dashed ${theme === "dark" ? "#404040" : "#d4d4d4"}`,
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "240px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme === "dark" ? "#666" : "#999";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme === "dark" ? "#404040" : "#d4d4d4";
              }}
            >
              <Plus 
                size={48} 
                weight="light" 
                style={{ 
                  color: theme === "dark" ? "#666" : "#999",
                  marginBottom: "16px"
                }} 
              />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: theme === "dark" ? "#666" : "#999",
                }}
              >
                New Trip
              </span>
            </div>

            {/* Existing Trips */}
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => handleViewTrip(trip.id)}
                style={{
                  padding: "28px",
                  borderRadius: "24px",
                  background: theme === "dark" ? "#1a1a1a" : "#fff",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s ease",
                  minHeight: "240px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteTrip(trip.id, trip.name, e)}
                  className={iconButtonClass}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    width: "36px",
                    height: "36px",
                    background: "transparent",
                    color: theme === "dark" ? "#666" : "#999",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === "dark" ? "#666" : "#999";
                  }}
                >
                  <Trash size={16} weight="regular" />
                </button>

                {/* Trip Name */}
                <h3
                  style={{
                    margin: "0 0 4px",
                    paddingRight: "50px",
                    fontSize: "24px",
                    fontWeight: 400,
                    color: theme === "dark" ? "#fff" : "#000",
                    lineHeight: "1.3",
                  }}
                >
                  {trip.name}
                </h3>

                {/* Destination - Subtitle */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <MapPin 
                    size={18} 
                    weight="fill" 
                    style={{ color: theme === "dark" ? "#666" : "#999", flexShrink: 0 }} 
                  />
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: theme === "dark" ? "#888" : "#666",
                    }}
                  >
                    {trip.fromLocation && trip.toLocation 
                      ? `${trip.fromLocation} → ${trip.toLocation}`
                      : trip.destinations}
                  </span>
                </div>

                {/* Trip Details Grid */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(2, 1fr)", 
                  gap: "16px",
                  marginBottom: "4px"
                }}>
                  {/* Travel Dates */}
                  {trip.startDate && trip.endDate && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ 
                        fontSize: "12px", 
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: theme === "dark" ? "#666" : "#999" 
                      }}>
                        Travel Dates
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar 
                          size={16} 
                          weight="regular" 
                          style={{ color: theme === "dark" ? "#888" : "#666", flexShrink: 0 }} 
                        />
                        <span style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: theme === "dark" ? "#e5e5e5" : "#1a1a1a",
                        }}>
                          {new Date(trip.startDate).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric" 
                          })} - {new Date(trip.endDate).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  {trip.days && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ 
                        fontSize: "12px", 
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: theme === "dark" ? "#666" : "#999" 
                      }}>
                        Duration
                      </span>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: theme === "dark" ? "#e5e5e5" : "#1a1a1a",
                      }}>
                        {trip.days} {trip.days === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  )}

                  {/* Guests */}
                  {trip.travellers && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ 
                        fontSize: "12px", 
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: theme === "dark" ? "#666" : "#999" 
                      }}>
                        Guests
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Users 
                          size={16} 
                          weight="regular" 
                          style={{ color: theme === "dark" ? "#888" : "#666", flexShrink: 0 }} 
                        />
                        <span style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: theme === "dark" ? "#e5e5e5" : "#1a1a1a",
                        }}>
                          {trip.travellers}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stops */}
                  {trip.stops && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ 
                        fontSize: "12px", 
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: theme === "dark" ? "#666" : "#999" 
                      }}>
                        Stops
                      </span>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: theme === "dark" ? "#e5e5e5" : "#1a1a1a",
                      }}>
                        {trip.stops}
                      </span>
                    </div>
                  )}
                </div>

                {/* Created Date */}
                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: `1px solid ${theme === "dark" ? "#2a2a2a" : "#e5e5e5"}`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: theme === "dark" ? "#666" : "#999",
                    }}
                  >
                    Created {new Date(trip.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Trip Modal */}
      {showModal && (
        <NewTripModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          name={name}
          setName={setName}
          startingPoint={startingPoint}
          setStartingPoint={setStartingPoint}
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
  );
};

export default Dashboard;
