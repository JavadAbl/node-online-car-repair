// Helper to format Date to YYYY-MM-DD (ISO date string)
function formatToISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to get Monday of the current week (matching your component logic)
function getMondayOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function generateMockShifts(): ShiftDef[] {
  const monday = getMondayOfCurrentWeek();
  const now = new Date();

  // Configuration for shifts
  const shiftDefinitions = [
    { id: 1, start: 8, end: 12, label: "Morning" },
    { id: 2, start: 12, end: 16, label: "Afternoon" },
    { id: 3, start: 16, end: 20, label: "Evening" },
  ];

  const workers = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];

  // Helper to pick random item
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return shiftDefinitions.map((shiftDef) => {
    const jobs: Job[] = [];

    // Loop through the 7 days of the week (Mon-Sun)
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      // Determine logic based on date
      const isToday = currentDate.toDateString() === now.toDateString();
      const isPast = currentDate < now && !isToday;

      // Random generation logic
      const rand = Math.random();
      let state: CellState;
      let workerName: string | undefined;

      if (isPast) {
        // Past days: Mostly done or missed (available -> becomes disabled)
        if (rand < 0.7) {
          state = "done";
          workerName = pick(workers);
        } else {
          state = "available"; // Component will render this as 'disabled'
        }
      } else if (isToday) {
        // Today: Mix of all states
        if (rand < 0.3) {
          state = "done";
          workerName = pick(workers);
        } else if (rand < 0.6) {
          state = "in_progress";
          workerName = pick(workers);
        } else {
          state = "available";
        }
      } else {
        // Future: Mostly available, some already assigned (done/in_progress)
        if (rand < 0.2) {
          state = "done";
          workerName = pick(workers);
        } else if (rand < 0.3) {
          state = "in_progress";
          workerName = pick(workers);
        } else {
          state = "available";
        }
      }

      jobs.push({
        date: formatToISODate(currentDate),
        state: state,
        workerName: workerName,
      });
    }

    return {
      id: shiftDef.id,
      start: shiftDef.start,
      end: shiftDef.end,
      jobs: jobs,
    };
  });
}
