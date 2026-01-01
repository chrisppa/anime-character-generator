import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type ModelSelectProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: Option[];
  onValueChange?: (value: string) => void;
  className?: string;
};

export function ModelSelect({
  value,
  defaultValue,
  placeholder = "Select option",
  options,
  onValueChange,
  className = "",
}: ModelSelectProps) {
  return (
    <Select.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
    >
      <Select.Trigger
        className={`
          w-full bg-white border border-black py-2 px-3
          text-sm font-mono cursor-pointer
          flex items-center justify-between
          focus:outline-none focus:ring-0 focus:ring-black
          ${className}
        `}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown size={14} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="
            z-50 bg-white border border-black shadow-md
            text-sm font-mono
          "
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="
                  px-3 py-2 cursor-pointer
                  data-highlighted:bg-black
                  data-highlighted:text-white
                  data-[state=checked]:bg-black
                  data-[state=checked]:text-white
                  outline-none
                "
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
