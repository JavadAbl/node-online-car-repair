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

const getDayFromDate = (date: string) => {
  const day = new Date(date).getDay();
  const map = [6, 0, 1, 2, 3, 4, 5]; // convert Sun‑Sat → Mon‑Sun index
  return map[day];
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
        {DAYS.map((d) => (
          <div
            key={d}
            className="border-r border-b bg-gray-50 flex items-center justify-center h-24"
          >
            <span className="-rotate-90 font-semibold text-gray-600">{d}</span>
          </div>
        ))}

        {shifts.map((shift) => {
          const jobsByDay: (Job | undefined)[] = new Array(7).fill(undefined);

          shift.jobs.forEach((job) => {
            const index = getDayFromDate(job.date);
            jobsByDay[index] = job;
          });

          return (
            <React.Fragment key={shift.id}>
              {/* shift label */}
              <div className="border-r border-b bg-gray-50 flex flex-col items-center justify-center text-sm font-semibold">
                <span>{shift.start}:00</span>
                <span className="text-xs text-gray-400">to</span>
                <span>{shift.end}:00</span>
              </div>

              {jobsByDay.map((job, i) => {
                const state = job?.state ?? "disabled";

                return (
                  <div
                    key={i}
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
