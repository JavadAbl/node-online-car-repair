// Query providesTags helper
export const getProvidesTags = <T extends string>(type: T, result: any) => {
  if (!result) return [{ type, id: "LIST" }];
  if (Array.isArray(result)) {
    return [
      { type, id: "LIST" },
      ...result.map((item) => ({ type, id: item.id })),
    ];
  }
  return [{ type, id: result.id }];
};

// Mutation invalidation helper (with optional error param)
export const getInvalidatesTags = <
  T extends string,
  R extends { id: string | number } | undefined,
>(
  type: T,
  result: R,
  includeList: boolean = false,
  error?: unknown,
): { type: T; id: string | number }[] => {
  // Check error INSIDE the helper
  if (error || !result) return [];
  const tags = [{ type, id: result.id }];
  if (includeList) tags.push({ type, id: "LIST" });
  return tags;
};

export const getInvalidatesTagsById = <T extends string>(
  type: T,
  id: string | number,
  includeList: boolean = false,
  error?: unknown,
): { type: T; id: string | number }[] => {
  // Check error INSIDE the helper
  if (error) return [];
  const tags = [{ type, id }];
  if (includeList) tags.push({ type, id: "LIST" });
  return tags;
};

// Reusable UPDATE helper - id comes from arguments, not result
export const getUpdateInvalidatesTags = <T extends string>(
  type: T,
  id: string | number,
  includeList: boolean = false,
  error?: unknown,
): { type: T; id: string | number }[] => {
  if (error) return [];
  const tags = [{ type, id }];
  if (includeList) tags.push({ type, id: "LIST" });
  return tags;
};

// DELETE helper
export const getDeleteInvalidatesTags = <T extends string>(
  type: T,
  id: string | number,
  error?: unknown,
) => {
  if (error) return [];
  return [
    { type, id },
    { type, id: "LIST" },
  ];
};
