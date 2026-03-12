import { format, parseISO } from "date-fns";

export default function DateTag({ date }: { date: string }) {
  if (!date) return null;

  const parsedDate = parseISO(date);

  return <span>{format(parsedDate, "EEEE, MMM d, yyyy 'at' h:mma")}</span>;
}
