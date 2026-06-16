import React from "react";
import { useFormContext } from "react-hook-form";
import FieldError from "../FieldError.jsx";
import SearchableSelect from "../SearchableSelect.jsx";
import { Country, State, City } from "country-state-city";

const PersonalInfoStep = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedCountry = watch("location_country");
  const selectedState = watch("location_state");
  const selectedCity = watch("location_city");

  const countryOptions = React.useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: `${c.flag} ${c.name}`,
    }));
  }, []);

  const stateOptions = React.useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [selectedCountry]);

  const cityOptions = React.useMemo(() => {
    if (!selectedCountry) return [];
    if (stateOptions.length > 0) {
      if (!selectedState) return [];
      return City.getCitiesOfState(selectedCountry, selectedState).map((c) => ({
        value: c.name,
        label: c.name,
      }));
    } else {
      return City.getCitiesOfCountry(selectedCountry).map((c) => ({
        value: c.name,
        label: c.name,
      }));
    }
  }, [selectedCountry, selectedState, stateOptions]);

  const handleCountryChange = (val) => {
    setValue("location_country", val, { shouldValidate: true, shouldDirty: true });
    setValue("location_state", "", { shouldValidate: true, shouldDirty: true });
    setValue("location_city", "", { shouldValidate: true, shouldDirty: true });

    if (!val) {
      setValue("location", "", { shouldValidate: true, shouldDirty: true });
      return;
    }
    const countryObj = Country.getCountryByCode(val);
    const countryName = countryObj ? countryObj.name : "";
    setValue("location", countryName, { shouldValidate: true, shouldDirty: true });
  };

  const handleStateChange = (val) => {
    setValue("location_state", val, { shouldValidate: true, shouldDirty: true });
    setValue("location_city", "", { shouldValidate: true, shouldDirty: true });

    const countryObj = Country.getCountryByCode(selectedCountry);
    const countryName = countryObj ? countryObj.name : "";

    if (!val) {
      setValue("location", countryName, { shouldValidate: true, shouldDirty: true });
      return;
    }

    const stateObj = State.getStateByCodeAndCountry(val, selectedCountry);
    const stateName = stateObj ? stateObj.name : "";

    const parts = [stateName, countryName].filter(Boolean);
    setValue("location", parts.join(", "), { shouldValidate: true, shouldDirty: true });
  };

  const handleCityChange = (val) => {
    setValue("location_city", val, { shouldValidate: true, shouldDirty: true });

    const countryObj = Country.getCountryByCode(selectedCountry);
    const countryName = countryObj ? countryObj.name : "";

    let stateName = "";
    if (selectedState) {
      const stateObj = State.getStateByCodeAndCountry(selectedState, selectedCountry);
      stateName = stateObj ? stateObj.name : "";
    }

    const parts = [];
    if (val) parts.push(val);
    if (stateName) parts.push(stateName);
    if (countryName) parts.push(countryName);

    setValue("location", parts.join(", "), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Tell us a bit about yourself. This helps companies quickly understand
        who you are.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Full name<span className="text-rose-400"> *</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={`input-glass text-sm sm:text-base py-3.5 ${
            errors.name ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="Alex Sharma"
        />
        <FieldError message={errors.name?.message} persistent />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Short bio
        </label>
        <textarea
          id="bio"
          rows={10}
          {...register("bio")}
          className="input-glass text-sm sm:text-base placeholder:text-slate-500 resize-none bio-scroll py-3.5"
          placeholder="Summarize your interests, goals, and experience in 2-3 sentences."
        />
        <FieldError message={errors.bio?.message} persistent />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Current location
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Country
            </span>
            <SearchableSelect
              value={selectedCountry}
              onChange={handleCountryChange}
              options={countryOptions}
              placeholder="Select Country"
              searchPlaceholder="Search Country..."
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              State / Region
            </span>
            <SearchableSelect
              value={selectedState}
              onChange={handleStateChange}
              options={stateOptions}
              placeholder={
                selectedCountry
                  ? stateOptions.length > 0
                    ? "Select State"
                    : "N/A (No states)"
                  : "Select country first"
              }
              searchPlaceholder="Search State / Region..."
              disabled={!selectedCountry || stateOptions.length === 0}
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              City
            </span>
            <SearchableSelect
              value={selectedCity}
              onChange={handleCityChange}
              options={cityOptions}
              placeholder={
                !selectedCountry
                  ? "Select country first"
                  : stateOptions.length > 0 && !selectedState
                  ? "Select state first"
                  : cityOptions.length > 0
                  ? "Select City"
                  : "N/A (No cities)"
              }
              searchPlaceholder="Search City..."
              disabled={
                !selectedCountry ||
                (stateOptions.length > 0 && !selectedState) ||
                cityOptions.length === 0
              }
              className="w-full text-sm sm:text-base"
            />
          </div>
        </div>
        <input type="hidden" {...register("location")} />
        <FieldError message={errors.location?.message} persistent />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
