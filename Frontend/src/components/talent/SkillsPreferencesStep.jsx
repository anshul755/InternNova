import React from "react";
import { useFormContext } from "react-hook-form";

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
    <div className="space-y-1.5">
      <p className="block text-xs font-medium text-slate-600">{label}</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {allOptions.map((option) => {
          const id = `${name}-${option}`;
          const isSelected = selected.includes(option);
          return (
            <label
              key={option}
              htmlFor={id}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[0.7rem] cursor-pointer transition-colors ${
                isSelected
                  ? "bg-emerald-500/15 border-emerald-400 text-emerald-700"
                  : "bg-white/70 border-white/60 text-slate-600 hover:border-slate-300"
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
                  className="text-emerald-600 text-[0.6rem] hover:text-emerald-700"
                >
                  ✕
                </button>
              )}
            </label>
          );
        })}
      </div>
      {placeholder && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-glass text-xs"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="btn-secondary text-[0.7rem] px-3 py-1"
          >
            Add
          </button>
        </div>
      )}
      {errors[name] && (
        <p className="text-[0.7rem] text-rose-400 mt-1">
          {errors[name]?.message}
        </p>
      )}
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
    <div className="space-y-1.5 relative">
      <p className="block text-xs font-medium text-slate-600">
        Preferred locations
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full inline-flex items-center justify-between rounded-lg bg-white/70 border border-white/60 px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:border-slate-300"
      >
        <span className="truncate text-left mr-2">{summaryText}</span>
        <span className="text-slate-400 text-xs">v</span>
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-lg bg-white/90 border border-white/70 text-xs sm:text-sm text-slate-700 shadow-lg">
          {INDIAN_CITIES.map((city) => {
            const isSelected = selected.includes(city);
            return (
              <li
                key={city}
                className={`px-3 py-1.5 cursor-pointer hover:bg-white ${
                  isSelected ? "bg-emerald-50" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleCity(city);
                }}
              >
                <span>{city}</span>
              </li>
            );
          })}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => toggleCity(city)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[0.7rem] cursor-pointer transition-colors bg-emerald-500/15 border-emerald-400 text-emerald-700 hover:bg-emerald-500/20"
            >
              <span>{city}</span>
              <span className="text-emerald-600 text-[0.6rem]">x</span>
            </button>
          ))}
        </div>
      )}

      {errors.preferredLocations && (
        <p className="text-[0.7rem] text-rose-400 mt-1">
          {errors.preferredLocations.message}
        </p>
      )}
    </div>
  );
};

const SkillsPreferencesStep = () => {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 4 - Skills & preferences
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
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

      {errors.skills && (
        <p className="text-[0.7rem] text-rose-400 mt-1">
          {errors.skills.message}
        </p>
      )}
    </div>
  );
};

export default SkillsPreferencesStep;
