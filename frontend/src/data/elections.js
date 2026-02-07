const now = Date.now();

export const elections = [
  {
    id: "student-council-2026",
    name: "Student Council Election 2026",
    status: "Active",
    startAt: now - 1000 * 60 * 60,
    endsAt: now + 1000 * 60 * 60 * 12,
    candidates: [
      { id: "a", name: "Aarav Mehta", description: "Progress • Transparency • Inclusion" },
      { id: "b", name: "Diya Sharma", description: "Better facilities • Student-first policies" },
      { id: "c", name: "Kabir Singh", description: "Events • Clubs • Community" }
    ]
  },
  {
    id: "club-president-2025",
    name: "Tech Club President 2025",
    status: "Closed",
    startAt: now - 1000 * 60 * 60 * 24 * 7,
    endsAt: now - 1000 * 60 * 60 * 24,
    candidates: [
      { id: "a", name: "Isha Verma", description: "Workshops • Mentorship" },
      { id: "b", name: "Rohan Gupta", description: "Hackathons • Open source" }
    ]
  }
];

export function getElectionById(id) {
  return elections.find((e) => e.id === id);
}
