import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useDataSync, useSyncedReload } from "@/hooks/useDataSync";
import { formatDateFr, formatMoney, toIsoDate } from "@/lib/finance";
import { computeGoalProgress, getGoalCategory, type GoalEntry } from "@/lib/goals";
import { buildPostesFromTemplate, buildEtapesFromTemplate } from "@/lib/projects";
import {
  analyzeRequest,
  assistantSuggestions,
  draftPostes,
  draftEtapes,
  type AssistantDraft,
} from "@/lib/assistant";
import AssistantPlanCard from "@/pages/app/assistant/components/AssistantPlanCard";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import {
  getFinancialProfileBlueprint,
  type FinancialProfileBlueprint,
} from "@/lib/financialProfiles";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  draft?: AssistantDraft;
};

const GOAL_SELECT =
  "id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note";

const greeting: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Bonjour, je suis votre assistant FinBuilder. Dites-moi ce que vous voulez accomplir, par exemple « je veux acheter une maison » : je vous proposerai d'abord l'objectif (la destination), puis le projet qui organise le budget pour y arriver.",
};

function buildWelcome(blueprint: FinancialProfileBlueprint | null): ChatMessage {
  if (!blueprint) return greeting;
  return {
    id: "welcome",
    role: "assistant",
    text: `Bonjour, je suis votre coach FinBuilder. Votre profil ${blueprint.label} est actif : ${blueprint.advice} Dites-moi ce que vous voulez accomplir, par exemple « ${blueprint.assistantSuggestions[0]} » : je vous proposerai l'objectif, puis le projet qui organise le budget pour y arriver.`,
  };
}

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export default function AssistantPage() {
  const { session, profile } = useAuth();
  const { notifyChange } = useDataSync();
  const userId = session?.user?.id;
  const devise = profile?.devise ?? "FCFA";
  const { financialProfile } = useFinancialProfile();
  const blueprint = getFinancialProfileBlueprint(financialProfile?.profile_type);
  const profileKey = financialProfile?.profile_type ?? "";

  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [hints, setHints] = useState<string[]>(assistantSuggestions);

  const [capacity, setCapacity] = useState(0);
  const [capacityKnown, setCapacityKnown] = useState(false);
  const [recentGoals, setRecentGoals] = useState<GoalEntry[]>([]);
  const [projectCount, setProjectCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    const activeBlueprint = getFinancialProfileBlueprint(profileKey);
    setMessages((current) =>
      current.map((message) =>
        message.id === "welcome" ? buildWelcome(activeBlueprint) : message,
      ),
    );
    setHints(
      activeBlueprint && activeBlueprint.assistantSuggestions.length > 0
        ? activeBlueprint.assistantSuggestions
        : assistantSuggestions,
    );
  }, [profileKey]);

  const loadContext = useCallback(async () => {
    if (!userId) return;
    try {
      const now = new Date();
      const windowStart = toIsoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1));
      const [goalsResult, incomeResult, expenseResult, projectsResult] = await Promise.all([
        supabase
          .from("goals")
          .select(GOAL_SELECT)
          .order("date_creation", { ascending: false })
          .limit(3),
        supabase.from("income").select("montant").gte("date", windowStart),
        supabase.from("expenses").select("montant").gte("date", windowStart),
        supabase.from("projects").select("id, statut"),
      ]);

      if (!goalsResult.error) setRecentGoals((goalsResult.data ?? []) as GoalEntry[]);

      const incomeTotal = (incomeResult.data ?? []).reduce(
        (total, row) => total + (Number((row as { montant: number }).montant) || 0),
        0,
      );
      const expenseTotal = (expenseResult.data ?? []).reduce(
        (total, row) => total + (Number((row as { montant: number }).montant) || 0),
        0,
      );
      setCapacity(Math.max(Math.round(incomeTotal / 3 - expenseTotal / 3), 0));
      setCapacityKnown(incomeTotal > 0 && expenseTotal > 0);

      const projects = (projectsResult.data ?? []) as { statut: string }[];
      setProjectCount(
        projects.filter((row) => row.statut === "en_cours" || row.statut === "preparation").length,
      );
    } catch {
      setCapacity(0);
      setCapacityKnown(false);
    }
  }, [userId]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  useSyncedReload(loadContext);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, thinking]);

  const patchDraft = (messageId: string, patch: Partial<AssistantDraft>) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId && message.draft
          ? { ...message, draft: { ...message.draft, ...patch } }
          : message,
      ),
    );
  };

  const pushAssistant = (text: string) => {
    setMessages((current) => [...current, { id: newId(), role: "assistant", text }]);
  };

  const handleSend = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;

    setMessages((current) => [...current, { id: newId(), role: "user", text }]);
    setInput("");
    setThinking(true);

    const timer = window.setTimeout(() => {
      const analysis = analyzeRequest(text, {
        capacity,
        devise,
        profile: blueprint ? { label: blueprint.label, advice: blueprint.advice } : null,
      });
      setMessages((current) => [
        ...current,
        {
          id: newId(),
          role: "assistant",
          text: analysis.reply,
          draft: analysis.draft ?? undefined,
        },
      ]);
      setHints(
        analysis.hints.length > 0
          ? analysis.hints
          : blueprint?.assistantSuggestions.length
            ? blueprint.assistantSuggestions
            : assistantSuggestions,
      );
      setThinking(false);
    }, 620);

    timers.current.push(timer);
  };

  const insertGoal = async (draft: AssistantDraft) => {
    if (!userId) return { id: null as string | null, error: "Session expirée. Reconnectez-vous." };
    const target = Math.max(Math.round(draft.target), 0);
    const saved = Math.min(Math.max(Math.round(draft.saved), 0), target);
    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        nom: draft.goalNom,
        categorie: draft.goalCategorie,
        montant_objectif: target,
        montant_actuel: saved,
        date_limite: draft.dateLimite,
        priorite: "haute",
        statut: target > 0 && saved >= target ? "atteint" : "actif",
        note: null,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (error) return { id: null, error: error.message };
    if (!data) return { id: null, error: "L'objectif n'a pas pu être confirmé." };
    return { id: (data as { id: string }).id, error: "" };
  };

  const insertProject = async (draft: AssistantDraft, goalId: string) => {
    if (!userId) return { id: null as string | null, error: "Session expirée. Reconnectez-vous." };
    const budget = Math.max(Math.round(draft.target), 0);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        nom: draft.projectNom,
        categorie: draft.projectCategorie,
        description: `Projet créé avec l'assistant à partir de : « ${draft.phrase} »`,
        budget_total: budget,
        montant_finance: Math.min(Math.max(Math.round(draft.saved), 0), budget),
        goal_id: goalId,
        postes: buildPostesFromTemplate(draft.projectCategorie, budget),
        etapes: buildEtapesFromTemplate(draft.projectCategorie),
        documents: [],
        date_debut: toIsoDate(new Date()),
        date_fin: draft.dateLimite,
        statut: "preparation",
        priorite: "moyenne",
        note: null,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (error) return { id: null, error: error.message };
    if (!data) return { id: null, error: "Le projet n'a pas pu être confirmé." };
    return { id: (data as { id: string }).id, error: "" };
  };

  const handleCreateGoal = async (messageId: string) => {
    const message = messages.find((item) => item.id === messageId);
    const draft = message?.draft;
    if (!draft || draft.status === "saving" || draft.goalId) return;

    patchDraft(messageId, { status: "saving", error: "" });
    try {
      const { id, error } = await insertGoal(draft);
      if (!id) throw new Error(error || "Création impossible.");
      patchDraft(messageId, { goalId: id, status: "goal-ready", error: "" });
      pushAssistant(
        `Objectif « ${draft.goalNom} » enregistré. Il reste ${formatMoney(
          Math.max(draft.target - draft.saved, 0),
          devise,
        )} à financer. Je peux maintenant créer le projet qui organise ce budget.`,
      );
      loadContext();
      notifyChange();
    } catch (createError) {
      patchDraft(messageId, {
        status: "idle",
        error:
          createError instanceof Error
            ? `Création impossible : ${createError.message}`
            : "Création impossible. Réessayez.",
      });
    }
  };

  const handleCreateProject = async (messageId: string) => {
    const message = messages.find((item) => item.id === messageId);
    const draft = message?.draft;
    if (!draft || draft.status === "saving" || !draft.goalId) return;

    patchDraft(messageId, { status: "saving", error: "" });
    try {
      const { id, error } = await insertProject(draft, draft.goalId);
      if (!id) throw new Error(error || "Création impossible.");
      patchDraft(messageId, { projectId: id, status: "done", error: "" });
      pushAssistant(
        `Projet « ${draft.projectNom} » créé avec ${draftPostes(draft).length} postes budgétaires et ${
          draftEtapes(draft).length
        } étapes. Chaque épargne versée sur l'objectif alimentera automatiquement son financement.`,
      );
      loadContext();
      notifyChange();
    } catch (createError) {
      patchDraft(messageId, {
        status: "goal-ready",
        error:
          createError instanceof Error
            ? `Création impossible : ${createError.message}`
            : "Création impossible. Réessayez.",
      });
    }
  };

  const handleCreateAll = async (messageId: string) => {
    const message = messages.find((item) => item.id === messageId);
    const draft = message?.draft;
    if (!draft || draft.status === "saving") return;

    patchDraft(messageId, { status: "saving", error: "" });
    let goalId = draft.goalId;
    try {
      if (!goalId) {
        const goalResult = await insertGoal(draft);
        if (!goalResult.id) throw new Error(goalResult.error || "Création de l'objectif impossible.");
        goalId = goalResult.id;
        patchDraft(messageId, { goalId, status: "goal-ready" });
      }

      const projectResult = await insertProject({ ...draft, goalId }, goalId);
      if (!projectResult.id) {
        throw new Error(projectResult.error || "Création du projet impossible.");
      }
      patchDraft(messageId, { projectId: projectResult.id, status: "done", error: "" });
      pushAssistant(
        `C'est prêt. Objectif « ${draft.goalNom} » et projet « ${draft.projectNom} » sont créés et liés : ${
          draftPostes(draft).length
        } postes budgétaires, ${draftEtapes(draft).length} étapes, échéance ${formatDateFr(
          draft.dateLimite,
        )}.`,
      );
      loadContext();
      notifyChange();
    } catch (createError) {
      patchDraft(messageId, {
        goalId,
        status: goalId ? "goal-ready" : "idle",
        error:
          createError instanceof Error
            ? `Création impossible : ${createError.message}`
            : "Création impossible. Réessayez.",
      });
    }
  };

  const resetConversation = () => {
    setMessages([buildWelcome(blueprint)]);
    setHints(
      blueprint && blueprint.assistantSuggestions.length > 0
        ? blueprint.assistantSuggestions
        : assistantSuggestions,
    );
    setInput("");
    setThinking(false);
  };

  const lastDraft = [...messages].reverse().find((message) => message.draft)?.draft;

  return (
    <div className="w-full animate-fade-up space-y-4 md:space-y-5">
      <section className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
            <i className="ri-sparkling-line text-lg" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
              Assistant FinBuilder
            </p>
            <p
              className="mt-0.5 text-sm font-semibold text-foreground-950 md:text-base"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Une phrase, un objectif, puis son projet
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {blueprint && (
            <Link
              to="/app/profil-financier"
              className="inline-flex items-center gap-1 rounded-full border border-secondary-200 bg-secondary-100 px-2.5 py-1 text-[10px] font-semibold text-secondary-900 transition-colors hover:bg-secondary-200"
            >
              <i className={`${blueprint.icon} text-[10px]`} />
              Profil {blueprint.label}
            </Link>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-[10px] font-semibold text-accent-900">
            <i className="ri-flag-2-line text-[10px]" />
            Objectif = destination
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[10px] font-semibold text-primary-800">
            <i className="ri-building-4-line text-[10px]" />
            Projet = chemin
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 lg:col-span-2">
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-background-200 px-4 py-2.5 md:px-5">
            <p className="flex items-center gap-2 text-xs font-semibold text-foreground-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-background-50">
                <i className="ri-robot-2-line text-xs" />
              </span>
              Conversation
            </p>
            <button
              type="button"
              onClick={resetConversation}
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1 text-[11px] font-semibold text-foreground-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              <i className="ri-restart-line text-xs" />
              Nouvelle conversation
            </button>
          </header>

          <div
            ref={scrollRef}
            className="h-[520px] min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-5"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-lg rounded-br-sm bg-primary-500 px-3.5 py-2.5 text-xs leading-relaxed text-background-50"
                      : "w-full max-w-full rounded-lg rounded-bl-sm bg-background-100 px-3.5 py-2.5"
                  }
                >
                  {message.role === "assistant" && (
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary-800">
                      <i className="ri-sparkling-line text-[11px]" />
                      Assistant
                    </p>
                  )}
                  <p
                    className={`text-xs leading-relaxed ${
                      message.role === "user" ? "text-background-50" : "text-foreground-800"
                    }`}
                  >
                    {message.text}
                  </p>

                  {message.role === "assistant" && (
                    <p className="mt-2 border-t border-background-200/70 pt-2 text-[10px] leading-relaxed text-foreground-500">
                      Informations générales, ne constitue pas un conseil en investissement.
                    </p>
                  )}

                  {message.draft && (
                    <AssistantPlanCard
                      draft={message.draft}
                      devise={devise}
                      capacity={capacity}
                      onChange={(patch) => patchDraft(message.id, patch)}
                      onCreateGoal={() => handleCreateGoal(message.id)}
                      onCreateProject={() => handleCreateProject(message.id)}
                      onCreateAll={() => handleCreateAll(message.id)}
                    />
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-lg rounded-bl-sm bg-background-100 px-3.5 py-2.5">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary-500"
                      style={{ animationDelay: `${dot * 150}ms` }}
                    />
                  ))}
                  <span className="ml-1 text-[10px] font-medium text-foreground-500">
                    Analyse de votre phrase…
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-background-200 px-4 py-3 md:px-5">
            {hints.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {hints.slice(0, 4).map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => handleSend(hint)}
                    className="cursor-pointer whitespace-nowrap rounded-full border border-background-300 bg-background-50 px-2.5 py-1 text-[10px] font-medium text-foreground-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Votre message
              </label>
              <input
                id="assistant-input"
                name="message"
                type="text"
                value={input}
                maxLength={220}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ex. : je veux acheter une maison à 15 millions dans 3 ans"
                className="box-border h-10 w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-3.5 text-sm text-foreground-950 transition-colors placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                aria-label="Envoyer le message"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-primary-500 text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <i className="ri-send-plane-2-line text-base" />
              </button>
            </form>
            <p className="mt-1.5 text-[10px] leading-relaxed text-foreground-400">
              L'assistant s'appuie sur vos revenus et dépenses des 3 derniers mois pour estimer votre
              capacité d'épargne. Vérifiez toujours les montants proposés avant de créer.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-secondary-200 bg-secondary-100/55 p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary-900">
              <i className="ri-safe-2-line text-sm" />
              Capacité d'épargne estimée
            </p>
            <p
              className="mt-1 text-lg font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {capacityKnown ? `${formatMoney(capacity, devise)} / mois` : "À calculer"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-secondary-900/75">
              {capacityKnown
                ? `Moyenne de vos revenus moins vos dépenses sur les 3 derniers mois. L'assistant compare chaque effort mensuel à cette capacité${
                    blueprint ? ` en tenant compte de votre profil ${blueprint.label}` : ""
                  }.`
                : "Ajoutez vos revenus et vos dépenses : l'assistant vérifiera si l'effort mensuel proposé est réaliste."}
            </p>
            <Link
              to="/app/budget"
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-2 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
            >
              Compléter mon budget
              <i className="ri-arrow-right-line text-xs" />
            </Link>
          </section>

          <section className="rounded-lg border border-background-200 bg-background-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
              Comment je travaille
            </p>
            <ul className="mt-2 space-y-2">
              {[
                {
                  icon: "ri-flag-2-line",
                  title: "Je crée l'objectif",
                  text: "La cible, l'échéance et la priorité : votre destination.",
                },
                {
                  icon: "ri-building-4-line",
                  title: "Puis le projet",
                  text: "Budget par poste et étapes concrètes : le chemin.",
                },
                {
                  icon: "ri-link-m",
                  title: "Je les relie",
                  text: "Chaque épargne versée sur l'objectif finance le projet.",
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                    <i className={`${item.icon} text-xs`} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-foreground-900">{item.title}</p>
                    <p className="text-[10px] leading-relaxed text-foreground-500">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-background-200 bg-background-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                Vos derniers objectifs
              </p>
              <Link
                to="/app/objectifs"
                className="shrink-0 text-[10px] font-semibold text-primary-700 transition-colors hover:text-primary-800"
              >
                Tout voir
              </Link>
            </div>

            {recentGoals.length === 0 ? (
              <p className="mt-2 text-[11px] leading-relaxed text-foreground-500">
                Aucun objectif pour l'instant. Envoyez une phrase à l'assistant pour créer le premier.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {recentGoals.map((goal) => {
                  const meta = getGoalCategory(goal.categorie);
                  const progress = computeGoalProgress(goal);
                  return (
                    <li key={goal.id} className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <i className={`${meta.icon} text-xs text-foreground-500`} />
                        <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-foreground-900">
                          {goal.nom}
                        </p>
                        <span className="shrink-0 text-[10px] font-semibold text-primary-700">
                          {Math.round(progress.progression)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-background-200">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${Math.max(progress.progression, 2)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {projectCount > 0 && (
              <p className="mt-3 rounded-md bg-background-100 px-2.5 py-1.5 text-[10px] font-medium text-foreground-600">
                {projectCount} projet{projectCount > 1 ? "s" : ""} actif
                {projectCount > 1 ? "s" : ""} suivi{projectCount > 1 ? "s" : ""} dans Projets.
              </p>
            )}
          </section>

          {lastDraft && lastDraft.status === "done" && (
            <section className="rounded-lg border border-primary-200 bg-primary-50 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-900">
                <i className="ri-checkbox-circle-line text-sm" />
                Plan créé
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-primary-900/80">
                Suivez vos étapes et vos dépenses réelles dans le module Projets, et votre épargne dans
                le module Objectifs.
              </p>
              <Link
                to="/app"
                className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-primary-300 bg-background-50 px-3 py-2 text-[11px] font-semibold text-primary-800 transition-colors hover:bg-primary-100"
              >
                Retour au tableau de bord
                <i className="ri-arrow-right-line text-xs" />
              </Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}