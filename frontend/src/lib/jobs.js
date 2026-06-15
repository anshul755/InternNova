export function parseLocalDate(value) {
  if (!value) return null;
  const datePart = String(value).split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function isJobOpen(job) {
  const deadline = parseLocalDate(job?.applicationDeadline);
  if (!deadline) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadline >= today;
}

export function filterOpenJobs(jobs) {
  return (jobs || []).filter(isJobOpen);
}
