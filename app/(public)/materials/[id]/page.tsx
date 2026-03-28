import { Metadata } from "next";
import MaterialDetailsPageContent from "./page-content";
import { Suspense } from "react";
import Loader from "@/components/loader";

export const metadata: Metadata = {
  title: "Glasstronic | Material Details",
  description: "Engineered Glass for Modern Construction.",
};

export default function MaterialDetailsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MaterialDetailsPageContent />
    </Suspense>
  );
}
