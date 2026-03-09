import { SpecRow } from "@/components/spec-item";
import { TimelineEvent } from "@/components/timeline-item";

export const order_data = [
  {
    id: "ORD-2026-001",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    date: "Feb 20, 2026",
    status: "In Production",
    total: 842.4,
    dimensions: `48" × 36`,
    thickness: "1/4",
    addons: [
      "Waxing",
      "Temper Glass",
      "Engraving",
      "Glazing",
      "Wrapping",
      "Edging",
    ],
  },
  {
    id: "ORD-2026-002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@example.com",
    date: "Feb 19, 2026",
    status: "Paid",
    total: 978.5,
    dimensions: `48" × 36`,
    thickness: "1/4",

    addons: [
      "Waxing",
      "Temper Glass",
      "Engraving",
      "Glazing",
      "Wrapping",
      "Edging",
    ],
  },
  {
    id: "ORD-2026-003",
    customerName: "Michael Chen",
    customerEmail: "mchen@example.com",
    date: "Mar 04, 2026",
    status: "Completed",
    dimensions: `48" × 36`,
    total: 1245.6,
    thickness: "1/4",
    addons: [
      "Waxing",
      "Temper Glass",
      "Engraving",
      "Glazing",
      "Wrapping",
      "Edging",
    ],
  },
  {
    id: "ORD-2026-004",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@example.com",
    date: "Mar 03, 2026",
    status: "Ready For Pickup",
    dimensions: `48" × 36`,
    total: 456.75,
    thickness: "1/4",
    addons: [
      "Waxing",
      "Temper Glass",
      "Engraving",
      "Glazing",
      "Wrapping",
      "Edging",
    ],
  },
  {
    id: "ORD-2026-005",
    customerName: "David Wilson",
    customerEmail: "dwilson@example.com",
    date: "Mar 02, 2026",
    status: "In Production",
    dimensions: `48" × 36`,
    total: 1876.3,
    thickness: "1/4",

    addons: [
      "Waxing",
      "Temper Glass",
      "Engraving",
      "Glazing",
      "Wrapping",
      "Edging",
    ],
  },
  {
    id: "ORD-2026-006",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    date: "Feb 20, 2026",
    status: "Paid",
    total: 842.4,
    dimensions: `48" × 36`,
    thickness: "1/4",

    addons: [
      "Waxing",
      "Temper Glass",
      "Engraving",
      "Glazing",
      "Wrapping",
      "Edging",
    ],
  },
];

export const customerInfo: SpecRow[] = [
  { label: "Name", value: <span className="font-semibold">tk</span> },
  {
    label: "Email",
    value: <span className="font-semibold">tk@gmail.com</span>,
  },
];
export const glassSpecs: SpecRow[] = [
  { label: "Dimensions:", value: `12" × 12"` },
  { label: "Area:", value: "1.00 sq ft" },
  {
    label: "Sheet Size:",
    value: <span className="font-semibold">Standard</span>,
  },
  { label: "Thickness:", value: `1/8"` },
];

export const addOns: SpecRow[] = [
  { label: "Edging:", value: "Yes" },
  { label: "Glazing:", value: "No" },
  { label: "Warping:", value: "No" },
  { label: "Waxing:", value: "Yes" },
  { label: "Temper:", value: "Yes" },
  { label: "Drill Holes:", value: "Yes" },
  { label: "Hole Count:", value: "4" },
  { label: "Hole Diameter:", value: `0.5"` },
  { label: "Tint Type:", value: "Bronze" },
  {
    label: "Engraving Text:",
    value: <span className="font-semibold">"Hello World"</span>,
  },
];

export const timeline: TimelineEvent[] = [
  {
    title: "Payment Completed",
    description: "The customer completed payment",
    date: "27 Mar 2025, 09:13 AM",
    completed: true,
    active: true,
  },
  {
    title: "Payment Started",
    description: "The customer completed payment",
    date: "27 Mar 2025, 09:13 AM",
    completed: false,
  },
  {
    title: "Production Completed",
    description: "Factory station has completed production",
    date: "27 Mar 2025, 09:13 AM",
    completed: false,
  },
  {
    title: "Ready For Pickup",
    description: "The item is ready for pickup",
    date: "27 Mar 2025, 09:13 AM",
    completed: false,
  },
  {
    title: "Item Collected",
    description: "This item has been picked up",
    date: "27 Mar 2025, 09:13 AM",
    completed: false,
  },
];
