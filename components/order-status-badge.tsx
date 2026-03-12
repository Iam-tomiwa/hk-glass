import { Badge } from "./ui/badge";
import { getBadgeVariant } from "@/lib/utils";

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={getBadgeVariant(status)}>
      {status.split("_").join(" ")}
    </Badge>
  );
}
