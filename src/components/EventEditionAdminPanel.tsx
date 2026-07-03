import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createEventEditionDraft,
  fetchAdminEventEditions,
  normalizeEventSlug,
  saveEventEdition,
  type EventEdition,
  type EventEditionConfig,
  type EventEditionStatus,
} from "../lib/eventEditions";
import type { AuthSession } from "../types";
import { PlayIcon, RefreshIcon, SparklesIcon } from "./AppIcons";

type JsonField = "rounds" | "challenges" | "categories" | "rules";

export const EventEditionAdminPanel = ({ session }: { session: AuthSession }) => {
  const [editions, setEditions] = useState<EventEdition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jsonDrafts, setJsonDrafts] = useState<Record<JsonField, string>>({
    rounds: "[]",
    challenges: "[]",
    categories: "[]",
    rules: "[]",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedEdition = useMemo(
    () => editions.find((edition) => edition.id === selectedId) ?? editions[0] ?? null,
    [editions, selectedId],
  );

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAdminEventEditions();
      setEditions(rows);
      setSelectedId((current) => current ?? rows[0]?.id ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load event editions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!selectedEdition) return;
    setJsonDrafts({
      rounds: JSON.stringify(selectedEdition.config.rounds, null, 2),
      challenges: JSON.stringify(selectedEdition.config.challenges, null, 2),
      categories: JSON.stringify(selectedEdition.config.categories, null, 2),
      rules: JSON.stringify(selectedEdition.config.rules, null, 2),
    });
  }, [selectedEdition?.id]);

  const updateSelected = (patch: Partial<EventEdition>) => {
    if (!selectedEdition) return;
    setEditions((current) =>
      current.map((edition) => (edition.id === selectedEdition.id ? { ...edition, ...patch } : edition)),
    );
    setMessage(null);
    setError(null);
  };

  const updateConfig = (patch: Partial<EventEditionConfig>) => {
    if (!selectedEdition) return;
    updateSelected({ config: { ...selectedEdition.config, ...patch } });
  };

  const createDraft = () => {
    const draft = createEventEditionDraft(`event-${Date.now().toString(36).slice(-5)}`);
    setEditions((current) => [draft, ...current]);
    setSelectedId(draft.id);
    setMessage("Draft created. Edit the slug and publish when ready.");
    setError(null);
  };

  const saveSelected = async () => {
    if (!selectedEdition) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const parsedConfig: EventEditionConfig = {
        ...selectedEdition.config,
        rounds: JSON.parse(jsonDrafts.rounds),
        challenges: JSON.parse(jsonDrafts.challenges),
        categories: JSON.parse(jsonDrafts.categories),
        rules: JSON.parse(jsonDrafts.rules),
      };
      const saved = await saveEventEdition(session, { ...selectedEdition, config: parsedConfig });
      setEditions((current) => [saved, ...current.filter((edition) => edition.id !== saved.id)]);
      setSelectedId(saved.id);
      setMessage(`Saved. Public route: /${saved.slug}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save event edition.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[1.6rem] border border-white/70 bg-white/84 shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
      <div className="border-b border-[#ececf6] px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-[0.16em] text-[#1a2340]">
              Event editions and tournaments
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#6c7489]">
              Create one-time public event pages. The route slug becomes the page URL automatically.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-2 rounded-full border border-[#d9deee] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#3525cd]"
            >
              <RefreshIcon className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={createDraft}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
            >
              <SparklesIcon className="h-4 w-4" />
              New Event
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[0.42fr_1fr]">
        <div className="space-y-2">
          {loading ? <p className="rounded-[1rem] bg-[#f8faff] p-4 text-sm text-[#6c7489]">Loading events...</p> : null}
          {editions.map((edition) => (
            <button
              key={edition.id}
              type="button"
              onClick={() => setSelectedId(edition.id)}
              className={`w-full rounded-[1.2rem] border p-4 text-left transition ${
                selectedEdition?.id === edition.id
                  ? "border-[#4f46e5] bg-[#eef2ff]"
                  : "border-[#e5e9f5] bg-white hover:border-[#c9d5f6]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#111c2d]">{edition.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#6c7489]">/{edition.slug}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#3525cd]">
                  {edition.status}
                </span>
              </div>
            </button>
          ))}
        </div>

        {selectedEdition ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <EventInput
                label="Event title"
                value={selectedEdition.title}
                onChange={(value) => updateSelected({ title: value })}
              />
              <EventInput
                label="Route slug"
                value={selectedEdition.slug}
                onChange={(value) => updateSelected({ slug: normalizeEventSlug(value) })}
                helper={`Public route: /${selectedEdition.slug || "event"}`}
              />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">
                  Status
                </span>
                <select
                  value={selectedEdition.status}
                  onChange={(event) => updateSelected({ status: event.target.value as EventEditionStatus })}
                  className="h-13 w-full rounded-[1.1rem] border border-[#dfe4f2] bg-white px-4 py-3 text-sm text-[#1f2740] outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <EventInput
                label="Event label"
                value={selectedEdition.config.eventLabel}
                onChange={(value) => updateConfig({ eventLabel: value })}
              />
              <EventInput
                label="Hero label"
                value={selectedEdition.config.heroLabel}
                onChange={(value) => updateConfig({ heroLabel: value })}
              />
              <EventInput
                label="Tagline"
                value={selectedEdition.config.tagline}
                onChange={(value) => updateConfig({ tagline: value })}
              />
              <EventInput
                label="Qualification score"
                type="number"
                value={`${selectedEdition.config.qualificationScore}`}
                onChange={(value) => updateConfig({ qualificationScore: Number(value) || 0 })}
              />
              <EventInput
                label="Max bonus score"
                type="number"
                value={`${selectedEdition.config.maxBonusScore}`}
                onChange={(value) => updateConfig({ maxBonusScore: Number(value) || 0 })}
              />
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">
                Description
              </span>
              <textarea
                value={selectedEdition.config.description}
                onChange={(event) => updateConfig({ description: event.target.value })}
                rows={3}
                className="w-full rounded-[1.1rem] border border-[#dfe4f2] bg-white px-4 py-3 text-sm leading-6 text-[#1f2740] outline-none"
              />
            </label>

            <div className="grid gap-3 lg:grid-cols-2">
              <JsonEditor label="Rules JSON" value={jsonDrafts.rules} onChange={(value) => setJsonDrafts((current) => ({ ...current, rules: value }))} />
              <JsonEditor label="Rounds JSON" value={jsonDrafts.rounds} onChange={(value) => setJsonDrafts((current) => ({ ...current, rounds: value }))} />
              <JsonEditor label="Challenges JSON" value={jsonDrafts.challenges} onChange={(value) => setJsonDrafts((current) => ({ ...current, challenges: value }))} />
              <JsonEditor label="Categories JSON" value={jsonDrafts.categories} onChange={(value) => setJsonDrafts((current) => ({ ...current, categories: value }))} />
            </div>

            {message ? <p className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void saveSelected()}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60"
              >
                <SparklesIcon className="h-4 w-4" />
                {saving ? "Saving..." : "Save Event"}
              </button>
              <Link
                to={`/${selectedEdition.slug}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d9deee] bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#3525cd]"
              >
                <PlayIcon className="h-4 w-4" />
                Preview Route
              </Link>
            </div>
          </div>
        ) : (
          <p className="rounded-[1rem] bg-[#f8faff] p-4 text-sm text-[#6c7489]">Create an event to start editing.</p>
        )}
      </div>
    </section>
  );
};

const EventInput = ({
  label,
  value,
  onChange,
  helper,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  type?: "text" | "number";
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-13 w-full rounded-[1.1rem] border border-[#dfe4f2] bg-white px-4 py-3 text-sm text-[#1f2740] outline-none"
    />
    {helper ? <span className="mt-1 block text-xs text-[#6c7489]">{helper}</span> : null}
  </label>
);

const JsonEditor = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={8}
      spellCheck={false}
      className="w-full rounded-[1.1rem] border border-[#dfe4f2] bg-[#111c2d] px-4 py-3 font-mono text-xs leading-5 text-white outline-none"
    />
  </label>
);
