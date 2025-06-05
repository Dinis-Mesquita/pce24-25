import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Direct inline styling + mock data for testing
const PeriodCalendar = ({ id_user }) => {
    const [periodDates, setPeriodDates] = useState([]);

    useEffect(() => {
        // Mock data - replace with real fetch later
        const mockData = [
            "2025-06-01",
            "2025-06-02",
            "2025-06-03",
            "2025-06-28"
        ];
        setPeriodDates(mockData);
    }, [id_user]);

    const isPeriodDate = (date) => {
        const d = date.toISOString().split("T")[0];
        return periodDates.includes(d);
    };

    return (
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
            <style>{`
        .react-calendar {
          background: #fff0f5;
          border: none;
          font-family: inherit;
          border-radius: 10px;
          padding: 10px;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
        }

        .react-calendar__tile--now {
          background: #ffd6e0 !important;
        }

        .period-date {
          background: #ff6f91 !important;
          color: white !important;
          border-radius: 50% !important;
        }
      `}</style>

            <Calendar
                tileClassName={({ date, view }) =>
                    view === "month" && isPeriodDate(date) ? "period-date" : null
                }
            />
        </div>
    );
};

export default PeriodCalendar;
