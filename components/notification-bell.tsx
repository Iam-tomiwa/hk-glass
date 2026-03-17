"use client";

import { useState } from "react";
import { Bell, Monitor, Check, Package, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useListStaffNotifications,
  useMarkStaffNotificationRead,
} from "@/services/queries/orders";
import {
  useListFactoryNotifications,
  useMarkFactoryNotificationRead,
} from "@/services/queries/factory";
import type { NotificationResponse } from "@/services/types/openapi";
import { format, isToday, isYesterday, parseISO } from "date-fns";

function formatNotificationTime(dateStr: string): string {
  const date = parseISO(dateStr);
  const time = format(date, "h:mm a").toLowerCase();
  if (isToday(date)) return `Today at ${time}`;
  if (isYesterday(date)) return `Yesterday at ${time}`;
  return format(date, "dd MMM yyyy");
}

function getEventIcon(event_type: string) {
  const t = event_type.toLowerCase();
  if (t.includes("device") || t.includes("register") || t.includes("setup"))
    return <Monitor className="size-4 text-neutral-600" />;
  if (t.includes("revoke") || t.includes("access") || t.includes("deactivate"))
    return <Check className="size-4 text-neutral-600" />;
  if (
    t.includes("order") ||
    t.includes("pickup") ||
    t.includes("production") ||
    t.includes("damage")
  )
    return <Package className="size-4 text-neutral-600" />;
  return <ShoppingBag className="size-4 text-neutral-600" />;
}

function NotificationItem({
  notification,
  onRead,
  href,
  onClose,
}: {
  notification: NotificationResponse;
  onRead: (id: string) => void;
  href: string | null;
  onClose: () => void;
}) {
  const router = useRouter();

  function handleClick() {
    if (!notification.is_read) onRead(notification.id);
    if (href) {
      onClose();
      router.push(href);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer w-full text-left flex items-start gap-3 py-4 px-1 hover:bg-neutral-50 transition-colors"
    >
      <div className="mt-1 shrink-0 w-2">
        {!notification.is_read && (
          <span className="block size-2 rounded-full bg-red-500" />
        )}
      </div>
      <div className="size-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
        {getEventIcon(notification.event_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1E202E] leading-snug">
          {notification.title}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          {formatNotificationTime(notification.created_at)}
        </p>
      </div>
    </button>
  );
}

function getOrderReference(n: NotificationResponse): string | undefined {
  return (n.payload?.order_reference ?? n.payload?.reference) as
    | string
    | undefined;
}

function NotificationBell({
  data,
  markRead,
  getHref,
}: {
  data: { items: NotificationResponse[]; unread_count: number } | undefined;
  markRead: (id: string) => void;
  getHref: (n: NotificationResponse) => string | null;
}) {
  const [open, setOpen] = useState(false);
  const unreadCount = data?.unread_count ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="relative h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors" />
        }
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-96 p-0 gap-0 rounded-xl shadow-lg"
      >
        <div className="px-5 pt-5 pb-3 border-b">
          <p className="text-base font-semibold text-[#1E202E]">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-normal text-neutral-400">
                ({unreadCount} unread)
              </span>
            )}
          </p>
        </div>

        <div className="overflow-y-auto max-h-[60vh] divide-y divide-neutral-100 px-4">
          {(data?.items ?? []).length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-10">
              No notifications yet.
            </p>
          ) : (
            (data?.items ?? []).map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markRead}
                href={getHref(n)}
                onClose={() => setOpen(false)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function StaffNotificationBell() {
  const { data } = useListStaffNotifications();
  const { mutate: markRead } = useMarkStaffNotificationRead();

  function getHref(n: NotificationResponse): string | null {
    const ref = getOrderReference(n);
    return ref ? `/${ref}` : null;
  }

  return <NotificationBell data={data} markRead={markRead} getHref={getHref} />;
}

export function FactoryNotificationBell() {
  const { data } = useListFactoryNotifications();
  const { mutate: markRead } = useMarkFactoryNotificationRead();

  function getHref(n: NotificationResponse): string | null {
    const ref = getOrderReference(n);
    return ref ? `/factory/${ref}` : null;
  }

  return <NotificationBell data={data} markRead={markRead} getHref={getHref} />;
}
