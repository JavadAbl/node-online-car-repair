import { ApiResponse } from "@/lib/shared/base-api-server";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useApi<T>(action: () => Promise<ApiResponse<T>>) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ApiResponse<T> | undefined>();

  const handleAction = useCallback(() => {
    action()
      .then((res) => {
        setData(res);

        if (res.error) {
          toast.error(res.error.message ?? "Unknown error");
        }
      })
      .finally(() => setIsLoading(false));
  }, [action]);

  const reFetch = useCallback(() => {
    setIsLoading(true);
    handleAction();
  }, [handleAction]);

  useEffect(() => {
    handleAction();
  }, []);

  return { isLoading, data, reFetch };
}
