import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
