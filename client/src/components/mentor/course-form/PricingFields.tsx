
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CourseFormData, currencies } from "./FormSchema";

interface PricingFieldsProps {
  form: UseFormReturn<CourseFormData>;
}

const PricingFields = ({ form }: PricingFieldsProps) => {
  // Calculamos o preço com desconto sempre que o preço ou o desconto mudar
  const price = form.watch("price");
  const discount = form.watch("discount");
  const currency = form.watch("currency");
  
  const calculateDiscountedPrice = (price: number, discount: number): number => {
    return price * (1 - discount / 100);
  };
  
  const discountedPrice = discount > 0 ? calculateDiscountedPrice(price, discount) : price;
  
  // Formatando o símbolo da moeda
  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
      case "BRL": return "R$";
      case "USD": return "$";
      case "EUR": return "€";
      default: return "R$";
    }
  };
  
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Preço*</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem className="w-full sm:w-[180px]">
              <FormLabel>Moeda</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="discount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Desconto (%)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                value={field.value}
              />
            </FormControl>
            <FormDescription>
              Deixe em 0 para não aplicar desconto
            </FormDescription>
            <FormMessage />
            
            {field.value > 0 && price > 0 && (
              <div className="mt-2 bg-green-50 p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Preço com Desconto:</p>
                <div className="flex items-center">
                  <span className="line-through text-red-500 mr-2">
                    {currencySymbol}{price.toFixed(2)}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {currencySymbol}{discountedPrice.toFixed(2)}
                  </span>
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                    -{field.value}%
                  </span>
                </div>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

export default PricingFields;
