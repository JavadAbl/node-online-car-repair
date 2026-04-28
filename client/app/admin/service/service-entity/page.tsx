"use client";
import { ContainerCard } from "@/components/shared/cards/container-card";
import ServicesGrid from "./components/services-grid";

export default function ServiceEntity() {
  return (
    <>
      <ContainerCard className=" w-full">
        <ServicesGrid />
      </ContainerCard>
    </>
  );
}
