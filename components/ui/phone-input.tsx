"use client";

import * as React from "react";
import { Check, CaretUpDown } from "@phosphor-icons/react";
import * as RPNI from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

export type PhoneInputProps = React.InputHTMLAttributes<HTMLInputElement> &
  RPNI.Props<React.ComponentProps<typeof Input>>;

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNI.default>,
  PhoneInputProps
>(({ className, onChange, value, ...props }, ref) => {
  return (
    <RPNI.default
      ref={ref}
      className={cn("flex border-0", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      onChange={(v) =>
        (onChange as unknown as (value: string) => void)?.(v || "")
      }
      value={(value as RPNI.Value) || undefined}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <Input
    className={cn(
      "rounded-e-[2px] rounded-s-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary border-gray-200 shadow-none h-full",
      className,
    )}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: RPNI.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNI.Country;
  onChange: (value: RPNI.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNI.Country) => {
      onChange(country);
    },
    [onChange],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "flex gap-1 rounded-e-none h-full rounded-s-[2px] px-3 focus-visible:ring-0 border-gray-200 shadow-none",
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <CaretUpDown
            className={cn(
              "-mr-2 h-4 w-4 opacity-70",
              disabled ? "hidden" : "opacity-100",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-white">
        <Command className="bg-white">
          <CommandList>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <CommandItem
                    className="gap-2"
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <FlagComponent
                      country={option.value}
                      countryName={option.label}
                    />
                    <span className="flex-1 text-sm">{option.label}</span>
                    {option.value && (
                      <span className="text-foreground/50 text-sm">
                        {`+${RPNI.getCountryCallingCode(option.value)}`}
                      </span>
                    )}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNI.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
