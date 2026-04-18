"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { RepairmanDto } from "@/lib/features/service/schema/responses/repairman.dto";

const schema = z.object({
  image: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  isShow: boolean;
  setIsShow: (state: boolean) => any;
  repairman?: RepairmanDto | null;
};

export function RepairmanSetImageDialog({
  isShow,
  setIsShow,
  repairman,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { register, handleSubmit } = form;

  useEffect(() => {
    if (isShow) {
      queueMicrotask(() => {
        setPreview(null);
        form.reset();
      });
    }
  }, [isShow, repairman]);

  if (!repairman) return null;

  const { id: repairmanId, employeeNumber, firstName, lastName } = repairman;

  const onSubmit = async (data: FormValues) => {
    if (!data.image) return;

    const formData = new FormData();
    formData.append("image", data.image);
    formData.append("repairmanId", repairmanId.toString());

    const res = await fetch("/api/repairman/upload-image", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setIsShow(false);
    }
  };

  return (
    <Dialog open={isShow} onOpenChange={setIsShow}>
      <DialogTrigger asChild>
        <Button variant="outline">Set Image</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Repairman Image</DialogTitle>
          <DialogDescription>
            Upload and update the profile image for this repairman.
          </DialogDescription>
        </DialogHeader>

        {/* Repairman Info Card */}
        <div className="rounded-md border p-4 bg-muted/50 text-sm space-y-1">
          <p>
            <span className="font-semibold">Name: </span>
            {firstName} {lastName}
          </p>
          <p>
            <span className="font-semibold">Employee Number: </span>
            {employeeNumber}
          </p>
          <p>
            <span className="font-semibold">ID: </span>
            {repairmanId}
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input
            type="file"
            accept="image/*"
            {...register("image", {
              onChange: (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              },
            })}
          />

          {preview && (
            <img
              src={preview}
              className="w-32 h-32 object-cover rounded border"
              alt="Preview"
            />
          )}

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
