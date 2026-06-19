import React from "react";
import { useFormContext } from "react-hook-form";
import FieldError from "../FieldError.jsx";
import { IoCheckmark } from "react-icons/io5";

const SKILL_OPTIONS = [];
const LOCATION_OPTIONS = [];
const INDUSTRY_OPTIONS = [];

const INDIAN_CITIES = [
  "Ahmedabad",
  "Amritsar",
  "Bangalore",
  "Bhopal",
  "Bhubaneswar",
  "Chandigarh",
  "Chennai",
  "Coimbatore",
  "Delhi",
  "Delhi NCR",
  "Faridabad",
  "Ghaziabad",
  "Gurugram",
  "Guwahati",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Jodhpur",
  "Kanpur",
  "Kochi",
  "Kolkata",
  "Lucknow",
  "Ludhiana",
  "Madurai",
  "Mumbai",
  "Mysuru",
  "Nagpur",
  "Noida",
  "Patna",
  "Pune",
  "Raipur",
  "Ranchi",
  "Surat",
  "Thane",
  "Vadodara",
  "Varanasi",
  "Visakhapatnam",
];

const MultiCheckboxGroup = ({ name, options, label, placeholder }) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const selected = watch(name) || [];

  const [customValue, setCustomValue] = React.useState("");

  const handleAddCustom = () => {
    const value = customValue.trim();
    if (!value) return;
    if (!selected.includes(value)) {
      setValue(name, [...selected, value], { shouldValidate: true });
    }
    setCustomValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const allOptions = React.useMemo(() => {
    const extra = selected.filter((v) => !options.includes(v));
    return [...options, ...extra];
  }, [options, selected]);

  return (
    <div className="space-y-2">
      <p className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-2.5 mt-1">
        {allOptions.map((option) => {
          const id = `${name}-${option}`;
          const isSelected = selected.includes(option);
          return (
            <label
              key={option}
              htmlFor={id}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm cursor-pointer transition-colors ${
                isSelected
                  ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
                  : "bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
              }`}
            >
              <input
                id={id}
                type="checkbox"
                value={option}
                className="hidden"
                {...register(name)}
              />
              <span className="truncate">{option}</span>
              {isSelected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setValue(
                      name,
                      selected.filter((v) => v !== option),
                      { shouldValidate: true },
                    );
                  }}
                  className="text-emerald-400 text-xs hover:text-emerald-300"
                >
                  ✕
                </button>
              )}
            </label>
          );
        })}
      </div>
      {placeholder && (
        <div className="mt-3 flex items-center gap-3">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-glass text-sm py-3"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="btn-secondary text-sm px-4 py-2"
          >
            Add
          </button>
        </div>
      )}
      <FieldError message={errors[name]?.message} persistent />
    </div>
  );
};

const LocationMultiSelect = () => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const selected = watch("preferredLocations") || [];
  const [open, setOpen] = React.useState(false);

  const toggleCity = (city) => {
    if (selected.includes(city)) {
      setValue(
        "preferredLocations",
        selected.filter((c) => c !== city),
        { shouldValidate: true },
      );
    } else {
      setValue("preferredLocations", [...selected, city], {
        shouldValidate: true,
      });
    }
  };

  const summaryText = "Choose preferred locations";

  return (
    <div className="space-y-2 relative">
      <p className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        Preferred locations
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full inline-flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-slate-300 hover:border-white/20 transition-colors"
      >
        <span className="truncate text-left mr-2">{summaryText}</span>
        <span className="text-slate-500 text-xs">▾</span>
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-xl bg-slate-900/95 border border-white/10 text-sm text-slate-300 shadow-lg backdrop-blur-md">
          {INDIAN_CITIES.map((city) => {
            const isSelected = selected.includes(city);
            return (
              <li
                key={city}
                className={`px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-2.5 ${
                  isSelected ? "bg-emerald-500/10 text-emerald-300" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleCity(city);
                }}
              >
                {isSelected ? (
                  <IoCheckmark className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-4 h-4 shrink-0" />
                )}
                <span>{city}</span>
              </li>
            );
          })}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mt-2">
          {selected.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => toggleCity(city)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm cursor-pointer transition-colors bg-emerald-500/15 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/20"
            >
              <span>{city}</span>
              <span className="text-emerald-400 text-xs">✕</span>
            </button>
          ))}
        </div>
      )}

      <FieldError message={errors.preferredLocations?.message} persistent />
    </div>
  );
};

const SkillsPreferencesStep = () => {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Choose skills and preferences so we can match you with the right
        opportunities.
      </p>

      <MultiCheckboxGroup
        name="skills"
        options={SKILL_OPTIONS}
        label={
          <>
            Skills<span className="text-rose-400"> *</span>
          </>
        }
        placeholder="Type a skill and press Enter to add"
      />

      <LocationMultiSelect />

      <MultiCheckboxGroup
        name="preferredIndustries"
        options={INDUSTRY_OPTIONS}
        label="Preferred industries"
        placeholder="Type an industry and press Enter to add"
      />

      <FieldError message={errors.skills?.message} persistent />
    </div>
  );
};

export default SkillsPreferencesStep;
