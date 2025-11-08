import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { MapPin, Users, Calendar, CaretDown } from "@phosphor-icons/react";

interface TripDetailsCardProps {
  tripData: {
    name?: string;
    destinations?: string;
    startDate?: string | null;
    endDate?: string | null;
    travellers?: string | null;
    pace?: string | null;
    budget?: string | null;
    interests?: string | null;
    mustSees?: string | null;
    avoid?: string | null;
    mobilityConstraints?: string | null;
    travelModes?: string | null;
  };
}

const TripDetailsCard: React.FC<TripDetailsCardProps> = ({ tripData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();

  const formatDateRange = () => {
    if (!tripData.startDate || !tripData.endDate) return "Dates not set";
    
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleString("default", { month: "short" });
    const endMonth = end.toLocaleString("default", { month: "short" });
    
    if (startMonth === endMonth) {
      return `${startDay}–${endDay} ${startMonth}`;
    }
    
    return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
  };

  return (
    <div
      className="absolute top-[20px] right-[20px] z-[1000] cursor-pointer"
      style={{
        background: theme === "dark" ? "#1a1a1a" : "#fff",
        maxHeight: isExpanded ? "800px" : "60px",
        overflow: "hidden",
        borderRadius: "30px",
        transition: "max-height 0.5s ease",
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="py-[12px] px-[28px]">
        <div
          className="flex items-center justify-center gap-[8px] text-[14px] font-normal"
          style={{ color: theme === "dark" ? "#fff" : "#000" }}
        >
          <MapPin size={14} weight="fill" />
          <span>{tripData.destinations || "Trip"}</span>
          <span>•</span>
          <Calendar size={14} weight="fill" />
          <span>{formatDateRange()}</span>
          <span>•</span>
          <Users size={14} weight="fill" />
          <span>{tripData.travellers || "guests"}</span>
        </div>

        {isExpanded && (
          <div
            className="mt-[16px] pt-[16px] space-y-[12px]"
            style={{
              borderTop: `1px solid ${theme === "dark" ? "#333" : "#e5e5e5"}`,
            }}
          >
            {tripData.pace && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium mb-[6px] m-0"
                  style={{ color: theme === "dark" ? "#666" : "#999" }}
                >
                  Pace
                </p>
                <p
                  className="text-[15px] font-medium m-0"
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                >
                  {tripData.pace}
                </p>
              </div>
            )}

            {tripData.budget && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium mb-[6px] m-0"
                  style={{ color: theme === "dark" ? "#666" : "#999" }}
                >
                  Budget
                </p>
                <p
                  className="text-[15px] font-medium m-0"
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                >
                  {tripData.budget}
                </p>
              </div>
            )}

            {tripData.interests && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium mb-[6px] m-0"
                  style={{ color: theme === "dark" ? "#666" : "#999" }}
                >
                  Interests
                </p>
                <p
                  className="text-[15px] font-medium m-0"
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                >
                  {tripData.interests}
                </p>
              </div>
            )}

            {tripData.mustSees && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium mb-[6px] m-0"
                  style={{ color: theme === "dark" ? "#666" : "#999" }}
                >
                  Must-See Places
                </p>
                <p
                  className="text-[15px] font-medium m-0"
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                >
                  {tripData.mustSees}
                </p>
              </div>
            )}

            {tripData.travelModes && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium mb-[6px] m-0"
                  style={{ color: theme === "dark" ? "#666" : "#999" }}
                >
                  Travel Modes
                </p>
                <p
                  className="text-[15px] font-medium m-0"
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                >
                  {tripData.travelModes}
                </p>
              </div>
            )}

            {tripData.avoid && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium mb-[6px] m-0"
                  style={{ color: theme === "dark" ? "#666" : "#999" }}
                >
                  Things to Avoid
                </p>
                <p
                  className="text-[15px] font-medium m-0"
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                >
                  {tripData.avoid}
                </p>
              </div>
            )}

            {tripData.mobilityConstraints && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium mb-[6px] m-0"
                  style={{ color: theme === "dark" ? "#666" : "#999" }}
                >
                  Mobility Constraints
                </p>
                <p
                  className="text-[15px] font-medium m-0"
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                >
                  {tripData.mobilityConstraints}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetailsCard;
