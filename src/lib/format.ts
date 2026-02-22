export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffDays > 1) return `in ${diffDays} days`;
  if (diffDays === 1) return "in 1 day";
  if (diffHours > 1) return `in ${diffHours} hours`;
  if (diffHours === 1) return "in 1 hour";
  if (diffMs > 0) return "soon";
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === -1) return "1 day ago";
  return "recently";
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
