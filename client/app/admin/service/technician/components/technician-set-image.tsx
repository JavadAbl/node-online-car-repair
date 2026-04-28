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
import { TechnicianDto } from "@/lib/features/service/schema/responses/technician.dto";
import { useTechnicianSetImageMutation } from "@/lib/features/service/service-api";
import { LoadingButton } from "@/components/shared/buttons/loading-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { FormMessageFixed } from "@/components/shared/inputs/form-message-fixed";

const schema = z.object({
  image: z.instanceof(File),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  isShow: boolean;
  setIsShow: (state: boolean) => any;
  technician?: TechnicianDto | null;
};

export function TechnicianSetImageDialog({
  isShow,
  setIsShow,
  technician,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const { handleSubmit } = form;

  const [mutate, { isLoading }] = useTechnicianSetImageMutation();

  useEffect(() => {
    if (isShow) {
      queueMicrotask(() => {
        setPreview(null);
        form.reset();
      });
    }
  }, [form, isShow, technician]);

  if (!technician) return null;

  const { id: technicianId, employeeNumber, firstName, lastName } = technician;

  const onSubmit = async (data: FormValues) => {
    if (!data.image) return;

    const formData = new FormData();
    formData.append("image", data.image);
    console.log(data.image instanceof File);

    const res = await mutate({ body: formData, id: technicianId });
    if (!res.error) setIsShow(false);
  };

  return (
    <Dialog open={isShow} onOpenChange={setIsShow}>
      <DialogTrigger asChild>
        <Button variant="outline">Set Image</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Technician Image</DialogTitle>
          <DialogDescription>
            Upload and update the profile image for this technician.
          </DialogDescription>
        </DialogHeader>

        {/* Technician Info Card */}
        <div className="rounded-md border p-4 bg-muted/50 text-sm space-y-1">
          <p>
            <span className="font-semibold">Name: </span>
            {firstName} {lastName}
          </p>
          <p>
            <span className="font-semibold">Employee Number: </span>
            {employeeNumber}
          </p>
        </div>

        {/* Upload Form */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessageFixed />
                </FormItem>
              )}
            />

            {preview && (
              <img
                src={preview}
                className="w-32 h-32 object-cover rounded border"
                alt="Preview"
              />
            )}

            <DialogFooter>
              <LoadingButton isLoading={isLoading} type="submit">
                Save changes
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
