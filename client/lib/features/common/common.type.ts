export type ActionState = {
  data?: any;
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
