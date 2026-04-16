"use client";
import { ContentCard } from "@/components/shared/cards/content-card";
import RepairmansGrid from "./repairmans-grid";

export default function Repairman() {
  return (
    <>
      <ContentCard className=" w-full">
        <RepairmansGrid />
      </ContentCard>
    </>
  );
}
