export const formattedWalletAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export function formatTimeAgo(dateString: string): string {
  // "2026.08.11 15:33" -> "2026-08-11T15:33:00"
  const date = new Date(
    dateString.replace(
      /^(\d{4})\.(\d{2})\.(\d{2}) (\d{2}):(\d{2})$/,
      "$1-$2-$3T$4:$5:00",
    ),
  );

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);

  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}


export function formatAmount(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "0.00";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}
