"use client";
import { ContainerCard } from "@/components/shared/cards/container-card";
import RepairmansGrid from "./repairmans-grid";

export default function Repairman() {
  return (
    <>
      <ContainerCard className=" w-full">
        <RepairmansGrid />
      </ContainerCard>
    </>
  );
}
