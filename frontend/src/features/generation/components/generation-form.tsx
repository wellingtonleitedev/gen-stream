import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GenerateRequest } from "../types";
import { generateSchema } from "../schemas";

interface GenerationFormProps {
  onSubmit: (data: GenerateRequest) => Promise<void>;
  isGenerating: boolean;
}

export const GenerationForm = ({
  onSubmit,
  isGenerating,
}: GenerationFormProps) => {
  const form = useForm<GenerateRequest>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      prompt: "",
      num_images: 5,
    },
  });

  const handleSubmit = async (data: GenerateRequest) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Generate Images</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the images you want to generate..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="num_images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Images (5-20)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    max={20}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isGenerating} className="w-full">
            {isGenerating ? "Generating..." : "Generate Images"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
