"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CreateVehicleDto,
  createVehicleSchema,
} from "../schema/create-vehicle-schema";

export async function createVehicleAction(
  payload: CreateVehicleDto,
): Promise<FormState> {
  revalidatePath("/");
  redirect("/");
}
