import { useState } from "react";
import { useTheme } from "@/lib/theme-context";

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  setName: (value: string) => void;
  destinations: string;
  setDestinations: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  travellers: string;
  setTravellers: (value: string) => void;
  pace: string;
  setPace: (value: string) => void;
  budget: string;
  setBudget: (value: string) => void;
  interests: string;
  setInterests: (value: string) => void;
  mustSees: string;
  setMustSees: (value: string) => void;
  avoid: string;
  setAvoid: (value: string) => void;
  mobilityConstraints: string;
  setMobilityConstraints: (value: string) => void;
  travelModes: string;
  setTravelModes: (value: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export default function NewTripModal({
  isOpen,
  onClose,
  name,
  setName,
  destinations,
  setDestinations,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  travellers,
  setTravellers,
  pace,
  setPace,
  budget,
  setBudget,
  interests,
  setInterests,
  mustSees,
  setMustSees,
  avoid,
  setAvoid,
  mobilityConstraints,
  setMobilityConstraints,
  travelModes,
  setTravelModes,
  loading,
  onSubmit,
}: NewTripModalProps) {
  const [closeHover, setCloseHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);
  const { theme } = useTheme();

  if (!isOpen) return null;

  const inputClass = "w-full px-[16px] py-[12px] text-[14px] rounded-[24px] border-none transition-colors duration-200 outline-none";
  const labelClass = "block mb-[8px] text-[13px] font-medium";

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 z-[1000]"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] rounded-[24px] p-8 relative max-h-[90vh] overflow-y-auto transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-primary)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2
            className="text-xl font-normal"
            style={{ color: "var(--text-primary)" }}
          >
            Plan Your Trip
          </h2>
          <button
            onClick={onClose}
            className="text-2xl w-[44px] h-[44px] rounded-full border-none cursor-pointer font-light flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: closeHover
                ? "var(--text-primary)"
                : "var(--bg-primary)",
              color: closeHover ? "var(--bg-primary)" : "var(--text-primary)",
            }}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
          >
            ✕
          </button>
        </div>

        <div className="space-y-[16px]">
          <div>
            <input
              type="text"
              placeholder="Trip Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Destination(s) (e.g., Paris, Rome, Barcelona)"
              value={destinations}
              onChange={(e) => setDestinations(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-secondary)" }}
              >
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
                style={{
                  backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--text-secondary)" }}
              >
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
                style={{
                  backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Number of Travellers (e.g., 2 adults, 1 child)"
              value={travellers}
              onChange={(e) => setTravellers(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className={labelClass}
              style={{ color: "var(--text-secondary)" }}
            >
              Travel Pace
            </label>
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              className="w-full px-[16px] py-[12px] pr-[40px] text-[14px] rounded-[24px] border-none transition-colors duration-200 outline-none appearance-none bg-no-repeat bg-right"
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='${theme === "dark" ? "%23ffffff" : "%23000000"}'%3E%3Cpath d='M4.5 6l3.5 3.5L11.5 6z'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 16px center",
              }}
            >
              <option value="relaxed">Relaxed</option>
              <option value="balanced">Balanced</option>
              <option value="packed">Packed</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Budget (e.g., $3000, moderate)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Interests (e.g., food, art, history, adventure)"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Must-See Places (optional)"
              value={mustSees}
              onChange={(e) => setMustSees(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Things to Avoid (optional)"
              value={avoid}
              onChange={(e) => setAvoid(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Mobility Constraints (optional)"
              value={mobilityConstraints}
              onChange={(e) => setMobilityConstraints(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Travel Mode Preferences (e.g., train, car, walking)"
              value={travelModes}
              onChange={(e) => setTravelModes(e.target.value)}
              className={inputClass}
              style={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <div className="flex gap-[12px] justify-end mt-8">
          <button
            onClick={onClose}
            className="px-[24px] py-[12px] rounded-[24px] border-none cursor-pointer font-medium transition-all duration-200"
            style={{
              backgroundColor: cancelHover
                ? "var(--text-primary)"
                : theme === "dark" ? "#1a1a1a" : "#f3f4f6",
              color: cancelHover ? "var(--bg-primary)" : "var(--text-primary)",
            }}
            onMouseEnter={() => setCancelHover(true)}
            onMouseLeave={() => setCancelHover(false)}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !destinations}
            className="px-[24px] py-[12px] rounded-[24px] border-none font-medium transition-all duration-200"
            style={{
              backgroundColor:
                loading || !destinations
                  ? theme === "dark" ? "#333" : "#ccc"
                  : submitHover
                  ? "var(--text-primary)"
                  : theme === "dark" ? "#1a1a1a" : "#f3f4f6",
              color:
                loading || !destinations
                  ? theme === "dark" ? "#666" : "#999"
                  : submitHover
                  ? "var(--bg-primary)"
                  : "var(--text-primary)",
              cursor:
                loading || !destinations ? "not-allowed" : "pointer",
            }}
            onMouseEnter={() => setSubmitHover(true)}
            onMouseLeave={() => setSubmitHover(false)}
          >
            {loading ? "Generating..." : "Generate Trip"}
          </button>
        </div>
      </div>
    </div>
  );
}
