import { z } from "zod";

export const generateSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(500, "Prompt must be less than 500 characters"),
  num_images: z
    .number()
    .min(5, "Minimum 5 images")
    .max(20, "Maximum 20 images"),
});
