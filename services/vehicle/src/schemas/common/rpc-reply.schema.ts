export interface RpcReply<T> {
  success: boolean;
  result: T;
  error?: string;
}
