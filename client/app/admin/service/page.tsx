"use client";

import ServicesGrid from "./services-grid";
import { ContentCard } from "@/components/shared/cards/content-card";

export default function Service() {
  return (
    <>
      <ContentCard className=" w-full">
        <ServicesGrid />
      </ContentCard>
    </>
  );
}
