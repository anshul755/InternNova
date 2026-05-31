import * as Select from "@radix-ui/react-select";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";

const CLEAR_VALUE = "__glass_select_clear__";

export default function GlassSelect({
  label,
  labelId,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  clearLabel,
  showClearOption = true,
  className = "",
  disabled = false,
}) {
  const selectedValue = value || undefined;
  const resolvedClearLabel = clearLabel || placeholder;

  return (
    <Select.Root
      value={selectedValue}
      onValueChange={(nextValue) => {
        onValueChange(nextValue === CLEAR_VALUE ? "" : nextValue);
      }}
      disabled={disabled}
    >
      <Select.Trigger
        aria-label={labelId ? undefined : label}
        aria-labelledby={labelId}
        className={`glass-select__trigger ${className}`.trim()}
      >
        <Select.Value
          placeholder={placeholder}
          className="glass-select__value"
        />
        <Select.Icon className="glass-select__chevron" aria-hidden="true">
          <IoChevronDown />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          align="start"
          style={{
            width: "var(--radix-select-trigger-width)",
            minWidth: "var(--radix-select-trigger-width)",
          }}
          className="glass-select__content"
          forceMount
        >
          <Select.Viewport className="glass-select__viewport">
            {showClearOption && (
              <Select.Item value={CLEAR_VALUE} className="glass-select__item">
                <Select.ItemText>{resolvedClearLabel}</Select.ItemText>
                <Select.ItemIndicator className="glass-select__indicator">
                  <IoCheckmark />
                </Select.ItemIndicator>
              </Select.Item>
            )}

            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="glass-select__item"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="glass-select__indicator">
                  <IoCheckmark />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
