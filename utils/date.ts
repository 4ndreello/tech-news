export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return `há ${Math.floor(interval)} anos`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `há ${Math.floor(interval)} meses`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `há ${Math.floor(interval)} dias`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `há ${Math.floor(interval)}h`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `há ${Math.floor(interval)}m`;
  }
  return "agora mesmo";
};

export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
