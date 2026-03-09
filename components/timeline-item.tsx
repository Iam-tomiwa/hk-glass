import { CheckCircle2, Circle } from "lucide-react";

export type TimelineEvent = {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  active?: boolean;
};

export default function TimelineItem({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Icon + connector */}
      <div className="flex flex-col items-center">
        {event.completed && event.active ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
        )}
        {!isLast && (
          <div
            className={`w-px flex-1 mt-1 ${event.active ? "bg-green-400" : "bg-gray-200"}`}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`text-sm font-semibold ${event.completed ? "text-gray-900" : "text-gray-400"}`}
          >
            {event.title}
          </span>
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
            {event.date}
          </span>
        </div>
        <p
          className={`text-sm mt-0.5 ${event.completed ? "text-gray-600" : "text-gray-400"}`}
        >
          {event.description}
        </p>
      </div>
    </div>
  );
}
