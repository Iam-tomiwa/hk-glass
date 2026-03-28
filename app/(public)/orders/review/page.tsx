import { Suspense } from "react";
import { Metadata } from "next";
import OrderReviewByIdContent from "./page-content";
import Loader from "@/components/loader";

export const metadata: Metadata = {
  title: "Glasstronic | Order Review",
  description: "Engineered Glass for Modern Construction.",
};

export default function OrderReviewPage() {
  return (
    <Suspense fallback={<Loader />}>
      <OrderReviewByIdContent />
    </Suspense>
  );
}
