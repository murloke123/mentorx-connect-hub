
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { formSchema, defaultValues } from "./FormSchema";
import type { CourseFormData } from "@/utils/course";
import BasicInfoFields from "./BasicInfoFields";
import VisibilityField from "./VisibilityField";
import ImageField from "./ImageField";
import CourseTypeField from "./CourseTypeField";
import PricingFields from "./PricingFields";

interface CourseFormProps {
  mode: "create" | "edit";
  initialValues?: CourseFormData;
  onSubmit: (data: CourseFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CourseForm = ({
  mode = "create",
  initialValues = defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CourseFormProps) => {
  const [courseType, setCourseType] = useState<"free" | "paid">(initialValues.type);
  
  const form = useForm<CourseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const handleFormSubmit = (data: CourseFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <BasicInfoFields form={form} />
            <VisibilityField form={form} />
            <ImageField form={form} />
            <CourseTypeField 
              form={form} 
              onTypeChange={(value) => setCourseType(value)} 
            />
            
            {courseType === "paid" && <PricingFields form={form} />}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar Curso" : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
