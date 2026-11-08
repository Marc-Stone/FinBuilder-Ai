import { useMemo, useState } from "react";
import {
  financialProfileBlueprints,
  getFinancialProfileBlueprint,
  type FinancialProfileType,
} from "@/lib/financialProfiles";
import { useFinancialProfile, type FinancialProfileRow } from "@/hooks/useFinancialProfile";

type FinancialProfileWizardProps = {
  initial?: FinancialProfileRow | null;
  onSaved?: () => void;
  onCancel?: () => void;
  variant?: "modal" | "page";
};

export default function FinancialProfileWizard({
  initial,
  onSaved,
  onCancel,
  variant = "page",
}: FinancialProfileWizardProps) {
  const { save } = useFinancialProfile();
  const [step, setStep] = useState<1 | 2>(initial ? 2 : 1);
  const [profileType, setProfileType] = useState<FinancialProfileType | "">(
    initial?.profile_type ?? "",
  );
  const [income, setIncome] = useState(
    initial && initial.monthly_income > 0 ? String(initial.monthly_income) : "",
  );
  const [incomeType, setIncomeType] = useState(initial?.income_type ?? "");
  const [familySize, setFamilySize] = useState(String(initial?.family_size ?? 1));
  const [goals, setGoals] = useState<string[]>(initial?.financial_goals ?? []);
  const [customGoal, setCustomGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const blueprint = useMemo(() => getFinancialProfileBlueprint(profileType), [profileType]);

  const handlePick = (key: FinancialProfileType) => {
    setProfileType(key);
    setError("");
    const next = getFinancialProfileBlueprint(key);
    if (next) {
      setIncomeType((current) => (next.incomeTypes.includes(current) ? current : next.incomeTypes[0] ?? ""));
    }
    setStep(2);
  };

  const toggleGoal = (label: string) => {
    setGoals((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  };

  const addCustomGoal = () => {
    const value = customGoal.trim();
    if (!value || goals.includes(value)) {
      setCustomGoal("");
      return;
    }
    setGoals((current) => [...current, value]);
    setCustomGoal("");
  };

  const handleSubmit = async () => {
    if (!blueprint) {
      setError("Choisissez d'abord votre profil financier.");
      setStep(1);
      return;
    }
    const parsedIncome = Number(income.replace(/\s/g, "").replace(",", "."));
    if (income.trim() && (!Number.isFinite(parsedIncome) || parsedIncome < 0)) {
      setError("Indiquez un revenu mensuel valide (ou laissez vide si vous ne savez pas).");
      return;
    }
    const parsedFamily = Number(familySize);
    if (!Number.isFinite(parsedFamily) || parsedFamily < 1) {
      setError("Le nombre de personnes doit être au moins 1.");
      return;
    }

    setSaving(true);
    setError("");
    const result = await save({
      profile_type: blueprint.key,
      monthly_income: Number.isFinite(parsedIncome) ? parsedIncome : 0,
      income_type: incomeType || blueprint.incomeTypes[0] || null,
      family_size: parsedFamily,
      financial_goals: goals,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved?.();
  };

  return (
    <div className={variant === "modal" ? "w-full" : "w-full"}>
      <div className="flex items-center gap-2">
        {[1, 2].map((value) => (
          <div key={value} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                step >= value
                  ? "bg-primary-500 text-background-50"
                  : "bg-background-200 text-foreground-500"
              }`}
            >
              {step > value ? <i className="ri-check-line text-[11px]" /> : value}
            </span>
            <span
              className={`truncate text-[11px] font-semibold ${
                step >= value ? "text-foreground-900" : "text-foreground-400"
              }`}
            >
              {value === 1 ? "Votre situation" : "Vos informations"}
            </span>
            {value === 1 && <span className="hidden h-px flex-1 bg-background-200 sm:block" />}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div className="mt-5 animate-fade-up">
          <h2
            className="text-lg font-semibold text-foreground-950 md:text-xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Quel est votre profil financier ?
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-foreground-500">
            Choisissez la situation qui vous ressemble le plus. FinBuilder AI adapte ensuite votre
            tableau de bord, vos objectifs et les conseils de votre coach.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {financialProfileBlueprints.map((item) => {
              const active = profileType === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handlePick(item.key)}
                  className={`group cursor-pointer rounded-lg border p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                    active
                      ? `border-transparent bg-background-50 ring-2 ${item.ring}`
                      : "border-background-200 bg-background-50 hover:border-primary-300"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-transform duration-300 group-hover:scale-105 ${item.bubble}`}
                    >
                      <i className={`${item.icon} text-base`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-foreground-950">
                          {item.label}
                        </p>
                        {active && (
                          <i className="ri-checkbox-circle-fill text-xs text-primary-600" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                        {item.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.focus.slice(0, 3).map((focus) => (
                      <span
                        key={focus}
                        className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-600"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {onCancel && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold text-foreground-500 transition-colors hover:text-foreground-800"
              >
                Plus tard
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 animate-fade-up">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                className="text-lg font-semibold text-foreground-950 md:text-xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {blueprint ? `Profil ${blueprint.label}` : "Vos informations"}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-foreground-500">
                {blueprint?.objectif ?? "Complétez vos informations financières."}
              </p>
            </div>
            {blueprint && (
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${blueprint.bubble}`}
              >
                <i className={`${blueprint.icon} text-lg`} />
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="profile-income"
                className="block text-[11px] font-semibold text-foreground-700"
              >
                {blueprint?.incomeLabel ?? "Revenu mensuel"}
              </label>
              <input
                id="profile-income"
                name="monthly_income"
                type="number"
                min={0}
                step={1000}
                inputMode="numeric"
                value={income}
                onChange={(event) => setIncome(event.target.value)}
                placeholder="Ex. : 250000"
                className="box-border mt-1 h-10 w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-950 transition-colors placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <p className="mt-1 text-[10px] text-foreground-400">
                Une estimation suffit, vous pourrez la modifier.
              </p>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="profile-income-type"
                className="block text-[11px] font-semibold text-foreground-700"
              >
                Type de revenu
              </label>
              <select
                id="profile-income-type"
                name="income_type"
                value={incomeType}
                onChange={(event) => setIncomeType(event.target.value)}
                className="box-border mt-1 h-10 w-full min-w-0 cursor-pointer rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-950 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="">À préciser</option>
                {(blueprint?.incomeTypes ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="profile-family"
                className="block text-[11px] font-semibold text-foreground-700"
              >
                Personnes dans le foyer
              </label>
              <input
                id="profile-family"
                name="family_size"
                type="number"
                min={1}
                max={30}
                value={familySize}
                onChange={(event) => setFamilySize(event.target.value)}
                className="box-border mt-1 h-10 w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-950 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-foreground-700">
                Profil sélectionné
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="box-border mt-1 flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-background-300 bg-background-100/70 px-3 text-left text-sm text-foreground-800 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="truncate">{blueprint?.label ?? "Choisir"}</span>
                <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-primary-700">
                  Changer
                </span>
              </button>
            </div>
          </div>

          {blueprint && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-foreground-700">Vos objectifs</p>
              <p className="mt-0.5 text-[10px] text-foreground-400">
                Sélectionnez ceux qui comptent pour vous.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {blueprint.goals.map((goal) => {
                  const active = goals.includes(goal.nom);
                  return (
                    <button
                      key={goal.nom}
                      type="button"
                      onClick={() => toggleGoal(goal.nom)}
                      className={`cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        active
                          ? "border-primary-300 bg-primary-100 text-primary-900"
                          : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:bg-primary-50"
                      }`}
                    >
                      {active && <i className="ri-check-line mr-1 text-[10px]" />}
                      {goal.nom}
                    </button>
                  );
                })}
                {goals
                  .filter((goal) => !blueprint.goals.some((item) => item.nom === goal))
                  .map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className="cursor-pointer whitespace-nowrap rounded-full border border-primary-300 bg-primary-100 px-2.5 py-1 text-[11px] font-medium text-primary-900"
                    >
                      <i className="ri-check-line mr-1 text-[10px]" />
                      {goal}
                    </button>
                  ))}
              </div>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  name="custom_goal"
                  value={customGoal}
                  maxLength={80}
                  onChange={(event) => setCustomGoal(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomGoal();
                    }
                  }}
                  placeholder="Ajouter un objectif personnel"
                  className="box-border h-9 w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-3 text-xs text-foreground-950 transition-colors placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={addCustomGoal}
                  disabled={!customGoal.trim()}
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="ri-add-line text-xs" />
                  Ajouter
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-md border border-accent-300 bg-accent-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-accent-900">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold text-foreground-600 transition-colors hover:text-foreground-900"
            >
              <i className="ri-arrow-left-line text-xs" />
              Retour
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !blueprint}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <i className="ri-check-line text-base" />
                  {initial ? "Mettre à jour mon profil" : "Enregistrer mon profil"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}