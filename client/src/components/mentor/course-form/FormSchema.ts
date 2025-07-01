import { formSchema, CourseFormData } from "@/utils/course";

// Re-export the schema and type from the centralized location
export { formSchema };
export type { CourseFormData };

// Default values for the form
export const defaultValues: CourseFormData = {
  name: "",
  description: "",
  category: "",
  image: "",
  type: "free",
  price: 0,
  currency: "BRL",
  discount: 0,
  visibility: "public",
  isPublished: false,
};

// Currencies available for selection
export const currencies = [
  { value: "BRL", label: "R$ (BRL)" },
  { value: "USD", label: "$ (USD)" },
  { value: "EUR", label: "€ (EUR)" },
];
