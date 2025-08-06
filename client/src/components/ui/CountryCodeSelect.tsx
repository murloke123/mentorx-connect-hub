import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { countryCodes } from "@/utils/countryCodes";
import { cn } from "@/utils/utils";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

interface CountryCodeSelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CountryCodeSelect({ 
  value = "+55", 
  onChange, 
  disabled = false,
  className 
}: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedCountry = countryCodes.find(country => country.code === value) || countryCodes[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="font-mono text-sm">{selectedCountry.code}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-slate-800 border-slate-600">
        <Command className="bg-slate-800">
          <CommandInput 
            placeholder="Buscar país..." 
            className="text-white placeholder:text-gray-400 border-slate-600"
          />
          <CommandEmpty className="text-gray-400 py-6 text-center text-sm">
            Nenhum país encontrado.
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {countryCodes.map((country) => (
              <CommandItem
                key={`${country.code}-${country.name}`}
                value={`${country.name} ${country.code}`}
                onSelect={() => {
                  onChange(country.code);
                  setOpen(false);
                }}
                className="text-white hover:bg-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{country.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{country.code}</span>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === country.code ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}