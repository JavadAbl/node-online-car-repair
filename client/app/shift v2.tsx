import React from "react";

type CellState = "available" | "in_progress" | "done" | "disabled";

interface Job {
  state: CellState;
  date: string; // ISO date
  workerName?: string;
}

interface ShiftDef {
  id: number;
  start: number;
  end: number;
  jobs: Job[];
}

interface Props {
  shifts?: ShiftDef[];
  onCellClick?: (job: Job, shift: ShiftDef) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATE_CONFIG: Record<CellState, string> = {
  available: "bg-blue-100 hover:bg-blue-200 cursor-pointer",
  in_progress: "bg-amber-100 hover:bg-amber-200 cursor-pointer",
  done: "bg-emerald-200 cursor-not-allowed",
  disabled: "bg-gray-100 cursor-not-allowed",
};

/**
 * Generates an array of ISO date strings for the current calendar week (Mon-Sun).
 */
const getCurrentWeekDates = (): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

  // Calculate difference to Monday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

/* ---------------- MOCK DATA ---------------- */

const MOCK_SHIFTS: ShiftDef[] = [
  {
    id: 1,
    start: 9,
    end: 15,
    jobs: [
      { date: "2026-04-13", state: "available" },
      { date: "2026-04-14", state: "done", workerName: "Ali" },
      { date: "2026-04-15", state: "in_progress", workerName: "Sara" },
      { date: "2026-04-17", state: "available" },
    ],
  },
  {
    id: 2,
    start: 15,
    end: 22,
    jobs: [
      { date: "2026-04-13", state: "done", workerName: "Reza" },
      { date: "2026-04-16", state: "available" },
      { date: "2026-04-18", state: "in_progress", workerName: "Mina" },
    ],
  },
];

export default function WeekShiftPicker({
  shifts = MOCK_SHIFTS,
  onCellClick,
}: Props) {
  const weekDates = getCurrentWeekDates();

  const handleClick = (job: Job, shift: ShiftDef) => {
    if (job.state === "available" || job.state === "in_progress") {
      console.log({
        date: job.date,
        shiftId: shift.id,
        start: shift.start,
        end: shift.end,
        worker: job.workerName,
        state: job.state,
      });

      onCellClick?.(job, shift);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow border">
      <div className="grid grid-cols-8 border border-gray-300">
        {/* top corner */}
        <div className="border-r border-b bg-gray-50" />

        {/* day headers */}
        {weekDates.map((dateStr, i) => (
          <div
            key={dateStr}
            className="border-r border-b bg-gray-50 flex flex-col items-center justify-center h-24"
          >
            <span className="-rotate-90 font-semibold text-gray-600">
              {DAYS[i]}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              {new Date(dateStr).getDate()}
            </span>
          </div>
        ))}

        {shifts.map((shift) => {
          return (
            <React.Fragment key={shift.id}>
              {/* shift label */}
              <div className="border-r border-b bg-gray-50 flex flex-col items-center justify-center text-sm font-semibold">
                <span>{shift.start}:00</span>
                <span className="text-xs text-gray-400">to</span>
                <span>{shift.end}:00</span>
              </div>

              {/* Iterate through the current week's dates */}
              {weekDates.map((dateStr) => {
                // Find if a job exists for this specific date
                const job = shift.jobs.find((j) => j.date === dateStr);

                // If job is missing, treat state as 'disabled' (unavailable)
                const state: CellState = job ? job.state : "disabled";

                return (
                  <div
                    key={dateStr}
                    onClick={() => job && handleClick(job, shift)}
                    className={`border-r border-b h-24 flex items-center justify-center text-sm text-center p-2 transition ${STATE_CONFIG[state]}`}
                  >
                    {(state === "done" || state === "in_progress") &&
                      job?.workerName && (
                        <span className="font-medium text-gray-700">
                          {job.workerName}
                        </span>
                      )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {/* legend */}
      <div className="flex gap-6 mt-5 text-sm">
        <Legend color="bg-blue-100" label="Available" />
        <Legend color="bg-amber-100" label="In Progress" />
        <Legend color="bg-emerald-200" label="Done" />
        <Legend color="bg-gray-100" label="Disabled" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded border ${color}`} />
      <span>{label}</span>
    </div>
  );
}
