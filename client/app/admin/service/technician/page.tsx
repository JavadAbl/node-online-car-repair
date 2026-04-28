"use client";
import { ContainerCard } from "@/components/shared/cards/container-card";
import TechniciansGrid from "./components/technician-grid";

export default function Technician() {
  return (
    <>
      <ContainerCard className=" w-full">
        <TechniciansGrid />
      </ContainerCard>
    </>
  );
}
