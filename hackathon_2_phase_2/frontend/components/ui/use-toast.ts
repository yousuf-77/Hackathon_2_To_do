import { useToast as useToastOriginal } from "./toast";

export function useToast() {
  return useToastOriginal();
}
