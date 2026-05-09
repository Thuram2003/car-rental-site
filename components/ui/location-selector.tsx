"use client";

import * as React from "react";
import { Check, CaretUpDown } from "@phosphor-icons/react";
import { Country, State, City, ICountry, IState, ICity } from "country-state-city";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Import flag components from react-phone-number-input
import flags from "react-phone-number-input/flags";

// Helper: Get flag component for country
function FlagComponent({ countryCode, countryName }: { countryCode: string; countryName?: string }) {
  const Flag = flags[countryCode as keyof typeof flags];
  
  if (!Flag) {
    return <span className="text-sm font-medium text-gray-500">{countryCode}</span>;
  }
  
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm">
      <Flag title={countryName || countryCode} />
    </span>
  );
}

interface CountrySelectorProps {
  value?: string;
  onChange?: (country: ICountry | null) => void;
  defaultCountryCode?: string;
  disabled?: boolean;
  className?: string;
}

export function CountrySelector({
  value,
  onChange,
  defaultCountryCode = "CM", // Cameroon as default
  disabled = false,
  className,
}: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<ICountry | null>(null);

  const countries = Country.getAllCountries();

  // Initialize with default or value
  React.useEffect(() => {
    if (value) {
      const country = countries.find((c) => c.name === value);
      if (country) setSelectedCountry(country);
    } else if (defaultCountryCode && !selectedCountry) {
      const defaultCountry = Country.getCountryByCode(defaultCountryCode);
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
        onChange?.(defaultCountry);
      }
    }
  }, [value, defaultCountryCode]);

  const handleSelect = (country: ICountry) => {
    setSelectedCountry(country);
    onChange?.(country);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between h-11 font-normal", className)}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <FlagComponent countryCode={selectedCountry.isoCode} countryName={selectedCountry.name} />
              <span>{selectedCountry.name}</span>
            </span>
          ) : (
            "Select country..."
          )}
          <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-white" align="start">
        <Command className="bg-white">
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {countries.map((country) => (
                <CommandItem
                  key={country.isoCode}
                  value={`${country.name} ${country.isoCode}`}
                  onSelect={() => handleSelect(country)}
                >
                  <Check
                    weight="bold"
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCountry?.isoCode === country.isoCode
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <FlagComponent countryCode={country.isoCode} countryName={country.name} />
                  <span className="ml-2">{country.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface StateSelectorProps {
  countryCode?: string;
  value?: string;
  onChange?: (state: IState | null) => void;
  disabled?: boolean;
  className?: string;
}

export function StateSelector({
  countryCode,
  value,
  onChange,
  disabled = false,
  className,
}: StateSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedState, setSelectedState] = React.useState<IState | null>(null);

  const states = countryCode ? State.getStatesOfCountry(countryCode) : [];

  React.useEffect(() => {
    if (value && countryCode) {
      const state = states.find((s) => s.name === value);
      if (state) setSelectedState(state);
    } else {
      setSelectedState(null);
    }
  }, [value, countryCode]);

  const handleSelect = (state: IState) => {
    setSelectedState(state);
    onChange?.(state);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !countryCode || states.length === 0}
          className={cn("w-full justify-between h-11", className)}
        >
          {selectedState ? selectedState.name : countryCode ? "Select region..." : "Select country first"}
          <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-white" align="start">
        <Command className="bg-white">
          <CommandInput placeholder="Search region..." />
          <CommandList>
            <CommandEmpty>No region found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {states.map((state) => (
                <CommandItem
                  key={state.isoCode}
                  value={state.name}
                  onSelect={() => handleSelect(state)}
                >
                  <Check
                    weight="bold"
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedState?.isoCode === state.isoCode
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {state.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface CitySelectorProps {
  countryCode?: string;
  stateCode?: string;
  value?: string;
  onChange?: (city: ICity | null) => void;
  disabled?: boolean;
  className?: string;
}

export function CitySelector({
  countryCode,
  stateCode,
  value,
  onChange,
  disabled = false,
  className,
}: CitySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCity, setSelectedCity] = React.useState<ICity | null>(null);

  const cities =
    countryCode && stateCode
      ? City.getCitiesOfState(countryCode, stateCode)
      : [];

  React.useEffect(() => {
    if (value && countryCode && stateCode) {
      const city = cities.find((c) => c.name === value);
      if (city) setSelectedCity(city);
    } else {
      setSelectedCity(null);
    }
  }, [value, countryCode, stateCode]);

  const handleSelect = (city: ICity) => {
    setSelectedCity(city);
    onChange?.(city);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !stateCode || cities.length === 0}
          className={cn("w-full justify-between h-11", className)}
        >
          {selectedCity ? selectedCity.name : stateCode ? "Select city..." : "Select region first"}
          <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-white" align="start">
        <Command className="bg-white">
          <CommandInput placeholder="Search city..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {cities.map((city) => (
                <CommandItem
                  key={city.name}
                  value={city.name}
                  onSelect={() => handleSelect(city)}
                >
                  <Check
                    weight="bold"
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCity?.name === city.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
