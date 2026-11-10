import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fichesEducation } from "@/mocks/education";
import { fetchPublishedFiches } from "@/lib/content";
import {
  educationModules,
  getEducationModule,
  readStorageKey,
  type Fiche,
} from "@/lib/education";
import FeaturedFiche from "@/pages/app/education/components/FeaturedFiche";
import ReadingProgress from "@/pages/app/education/components/ReadingProgress";
import EducationFilters from "@/pages/app/education/components/EducationFilters";
import FicheCard from "@/pages/app/education/components/FicheCard";
import FicheModal from "@/pages/app/education/components/FicheModal";

const baseFiches = fichesEducation as Fiche[];

export default function EducationPage() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id ?? "anonyme";
  const storageKey = `${readStorageKey}:${userId}`;

  const [publishedFiches, setPublishedFiches] = useState<Fiche[]>([]);

  // The library is fed by the fiches published from the administration console.
  useEffect(() => {
    let active = true;
    fetchPublishedFiches()
      .then((rows) => {
        if (active && rows.length > 0) setPublishedFiches(rows);
      })
      .catch(() => {
        // Muted: the base library below stays available as a fallback.
      });
    return () => {
      active = false;
    };
  }, []);

  // Les fiches publiées depuis la console viennent compléter la bibliothèque
  // de base : elles ne doivent jamais la remplacer entièrement.
  const fiches = useMemo(() => {
    if (publishedFiches.length === 0) return baseFiches;
    const publishedIds = new Set(publishedFiches.map((fiche) => fiche.id));
    const remaining = baseFiches.filter((fiche) => !publishedIds.has(fiche.id));
    return [...publishedFiches, ...remaining];
  }, [publishedFiches]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Tous");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const requestedFiche = searchParams.get("fiche");

  // Opens a specific fiche when arriving from a recommendation link.
  useEffect(() => {
    if (!requestedFiche) return;
    if (fiches.some((fiche) => fiche.id === requestedFiche)) {
      setSelectedId(requestedFiche);
    }
  }, [requestedFiche, fiches]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setReadIds(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
    } catch {
      setReadIds([]);
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: string[]) => {
      setReadIds(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Storage unavailable: reading progress simply stays in memory.
      }
    },
    [storageKey],
  );

  const toggleRead = (id: string) => {
    persist(readIds.includes(id) ? readIds.filter((item) => item !== id) : [...readIds, id]);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return fiches.filter((fiche) => {
      if (category !== "Tous" && fiche.categorie !== category) return false;
      if (unreadOnly && readIds.includes(fiche.id)) return false;
      if (!term) return true;
      const haystack = [
        fiche.titre,
        fiche.resume,
        fiche.categorie,
        fiche.niveau,
        fiche.points.join(" "),
        fiche.modules.map((module) => getEducationModule(module).label).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [fiches, search, category, unreadOnly, readIds]);

  const featured = useMemo(
    () => fiches.find((fiche) => !readIds.includes(fiche.id)) ?? fiches[0],
    [fiches, readIds],
  );

  const nextFiche = featured;
  const selected = selectedId ? fiches.find((fiche) => fiche.id === selectedId) ?? null : null;

  const modulesCovered = useMemo(() => {
    const set = new Set<string>();
    fiches
      .filter((fiche) => readIds.includes(fiche.id))
      .forEach((fiche) => fiche.modules.forEach((module) => set.add(module)));
    return set.size;
  }, [fiches, readIds]);

  const averageMinutes = Math.round(
    fiches.length > 0
      ? fiches.reduce((total, fiche) => total + fiche.minutes, 0) / fiches.length
      : 0,
  );

  return (
    <div className="w-full animate-fade-up space-y-4">
      <section className="rounded-lg border border-background-200 bg-background-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Éducation financière
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Comprendre avant d'agir
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Des fiches courtes, chiffrées et reliées à vos modules : chaque lecture se termine par
              une action concrète dans FinBuilder.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
              <i className="ri-book-open-line text-xs text-primary-600" />
              {fiches.length} fiches · {averageMinutes} min en moyenne
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-800">
              <i className="ri-check-double-line text-xs" />
              {readIds.length} lue{readIds.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <FeaturedFiche
            fiche={featured}
            read={readIds.includes(featured.id)}
            onOpen={() => setSelectedId(featured.id)}
          />
        </div>
        <div className="lg:col-span-5">
          <ReadingProgress
            total={fiches.length}
            readCount={readIds.length}
            modulesCovered={modulesCovered}
            modulesTotal={educationModules.length}
            nextFiche={nextFiche}
            onOpenNext={() => setSelectedId(nextFiche.id)}
            onReset={() => persist([])}
          />
        </div>
      </div>

      <EducationFilters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        unreadOnly={unreadOnly}
        onToggleUnread={() => setUnreadOnly((value) => !value)}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-4 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-400">
            <i className="ri-search-eye-line text-xl" />
          </span>
          <p className="mt-2.5 text-sm font-semibold text-foreground-950">Aucune fiche ne correspond</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
            Essayez un autre mot-clé ou revenez à la catégorie « Tous » pour retrouver la bibliothèque
            complète.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("Tous");
              setUnreadOnly(false);
            }}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
          >
            <i className="ri-refresh-line text-xs" />
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((fiche) => (
            <FicheCard
              key={fiche.id}
              fiche={fiche}
              read={readIds.includes(fiche.id)}
              onOpen={() => setSelectedId(fiche.id)}
            />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-800">
            <i className="ri-sparkling-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground-900">
              Une question sur votre situation ?
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
              Décrivez votre projet à l'assistant : il transformera votre phrase en objectif, puis en
              plan d'action chiffré.
            </p>
          </div>
        </div>
        <Link
          to="/app/assistant"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
        >
          Ouvrir l'assistant
          <i className="ri-arrow-right-line text-xs" />
        </Link>
      </section>

      <p className="text-[11px] text-foreground-400">
        {profile?.prenom ? `${profile.prenom}, ` : ""}votre progression de lecture est enregistrée sur
        cet appareil.
      </p>

      {selected && (
        <FicheModal
          fiche={selected}
          read={readIds.includes(selected.id)}
          onClose={() => setSelectedId(null)}
          onToggleRead={() => toggleRead(selected.id)}
        />
      )}
    </div>
  );
}