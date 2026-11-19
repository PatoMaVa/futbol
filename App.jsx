import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Goal,
  ListOrdered,
  RefreshCw,
  Shield,
  Trophy,
} from "lucide-react";

const DATA_URL = `${import.meta.env.BASE_URL}data/index.json`;

const LEAGUES = [
  { code: "PD", name: "LaLiga", country: "España", flag: "🇪🇸" },
  { code: "PL", name: "Premier League", country: "Inglaterra", flag: "🏴" },
  { code: "SA", name: "Serie A", country: "Italia", flag: "🇮🇹" },
  { code: "FL1", name: "Ligue 1", country: "Francia", flag: "🇫🇷" },
];

const TABS = [
  { key: "matches", label: "Partidos", icon: CalendarDays },
  { key: "standings", label: "Clasificación", icon: ListOrdered },
  { key: "scorers", label: "Goleadores", icon: Goal },
];

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  const labels = {
    SCHEDULED: "Programado",
    TIMED: "Programado",
    IN_PLAY: "En juego",
    PAUSED: "Descanso",
    FINISHED: "Final",
    POSTPONED: "Aplazado",
    SUSPENDED: "Suspendido",
    CANCELLED: "Cancelado",
  };
  return labels[status] || status || "";
}

function TeamBadge({ team, size = "normal" }) {
  const box = size === "large" ? "h-16 w-16" : "h-10 w-10";
  const image = size === "large" ? "h-13 w-13" : "h-8 w-8";
  return (
    <div className={`grid ${box} flex-shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm`}>
      {team?.crest ? (
        <img src={team.crest} alt={team.shortName || team.name} className={`${image} object-contain`} />
      ) : (
        <Shield className="text-emerald-700" size={size === "large" ? 30 : 20} />
      )}
    </div>
  );
}

function TeamLine({ team, goals, winner }) {
  return (
    <div className="flex items-center gap-3">
      <TeamBadge team={team} />
      <div className={`min-w-0 flex-1 truncate ${winner ? "font-black" : "font-semibold text-slate-700"}`}>
        {team?.shortName || team?.name}
      </div>
      <div className={`text-2xl ${winner ? "font-black" : "font-bold text-slate-500"}`}>{goals ?? "-"}</div>
    </div>
  );
}

function MatchCard({ match, onOpen }) {
  const homeGoals = match.score?.fullTime?.home;
  const awayGoals = match.score?.fullTime?.away;
  const finished = match.status === "FINISHED";
  return (
    <button onClick={() => onOpen(match)} className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition active:bg-emerald-50 md:hover:border-emerald-300">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className={`text-xs font-black uppercase ${match.status === "IN_PLAY" ? "text-red-600" : "text-emerald-700"}`}>
            {statusLabel(match.status)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">{formatDate(match.utcDate)}</div>
        </div>
        <div className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">J{match.matchday || "-"}</div>
      </div>
      <div className="space-y-4">
        <TeamLine team={match.homeTeam} goals={homeGoals} winner={finished && homeGoals > awayGoals} />
        <TeamLine team={match.awayTeam} goals={awayGoals} winner={finished && awayGoals > homeGoals} />
      </div>
      <div className="mt-4 text-right text-xs font-black text-emerald-700">Ver detalle →</div>
    </button>
  );
}

function MatchesView({ matches, onOpen }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = useMemo(() => {
    if (filter === "FINISHED") return matches.filter((m) => m.status === "FINISHED");
    if (filter === "UPCOMING") return matches.filter((m) => ["SCHEDULED", "TIMED"].includes(m.status));
    if (filter === "LIVE") return matches.filter((m) => ["IN_PLAY", "PAUSED"].includes(m.status));
    return matches;
  }, [matches, filter]);

  const ordered = [...filtered].sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

  return (
    <section>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {[["ALL", "Todos"], ["LIVE", "En directo"], ["UPCOMING", "Próximos"], ["FINISHED", "Finalizados"]].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`flex-shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${filter === key ? "bg-emerald-700 text-white" : "bg-white text-slate-600"}`}>
            {label}
          </button>
        ))}
      </div>
      {ordered.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ordered.map((match) => <MatchCard key={match.id} match={match} onOpen={onOpen} />)}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">No hay partidos para este filtro.</div>
      )}
    </section>
  );
}

function StandingsView({ standings }) {
  const table = standings?.find((item) => item.type === "TOTAL")?.table || standings?.[0]?.table || [];
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[30px_minmax(0,1fr)_30px_30px_34px_42px] bg-slate-100 px-2 py-3 text-[9px] font-black uppercase text-slate-500">
        <div>#</div><div>Equipo</div><div className="text-center">PJ</div><div className="text-center">V</div><div className="text-center">DG</div><div className="text-right">PTS</div>
      </div>
      {table.map((row) => (
        <div key={row.team.id} className="grid grid-cols-[30px_minmax(0,1fr)_30px_30px_34px_42px] items-center border-t border-slate-200 px-2 py-3">
          <div className="text-xs font-black text-slate-400">{row.position}</div>
          <div className="flex min-w-0 items-center gap-2">
            <TeamBadge team={row.team} />
            <div className="min-w-0 truncate text-xs font-bold">{row.team.shortName || row.team.name}</div>
          </div>
          <div className="text-center text-xs">{row.playedGames}</div>
          <div className="text-center text-xs">{row.won}</div>
          <div className="text-center text-xs">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</div>
          <div className="text-right text-sm font-black text-emerald-700">{row.points}</div>
        </div>
      ))}
    </section>
  );
}

function ScorersView({ scorers }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[30px_minmax(0,1fr)_38px_38px] bg-slate-100 px-3 py-3 text-[9px] font-black uppercase text-slate-500">
        <div>#</div><div>Jugador</div><div className="text-center">G</div><div className="text-right">A</div>
      </div>
      {scorers.map((item, index) => (
        <div key={`${item.player.id}-${item.team.id}`} className="grid grid-cols-[30px_minmax(0,1fr)_38px_38px] items-center border-t border-slate-200 px-3 py-3">
          <div className="text-xs font-black text-slate-400">{index + 1}</div>
          <div className="flex min-w-0 items-center gap-2">
            <TeamBadge team={item.team} />
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{item.player.name}</div>
              <div className="truncate text-[9px] text-slate-400">{item.team.shortName || item.team.name} · {item.playedMatches ?? 0} PJ</div>
            </div>
          </div>
          <div className="text-center text-sm font-black text-emerald-700">{item.goals ?? 0}</div>
          <div className="text-right text-xs font-bold">{item.assists ?? 0}</div>
        </div>
      ))}
    </section>
  );
}

function MatchDetail({ match, onBack }) {
  const homeGoals = match.score?.fullTime?.home;
  const awayGoals = match.score?.fullTime?.away;
  return (
    <section>
      <button onClick={onBack} className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold"><ChevronLeft size={18} />Partidos</button>
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-br from-emerald-700 to-green-950 p-5 text-center text-white">
          <div className="text-xs font-black uppercase tracking-widest">{statusLabel(match.status)}</div>
          <div className="mt-1 text-xs text-emerald-100">{formatDate(match.utcDate)}</div>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-6">
          <div className="flex min-w-0 flex-col items-center text-center"><TeamBadge team={match.homeTeam} size="large" /><div className="mt-2 text-sm font-black">{match.homeTeam.shortName || match.homeTeam.name}</div></div>
          <div className="flex items-center gap-2"><span className="text-4xl font-black">{homeGoals ?? "-"}</span><span className="text-slate-300">-</span><span className="text-4xl font-black">{awayGoals ?? "-"}</span></div>
          <div className="flex min-w-0 flex-col items-center text-center"><TeamBadge team={match.awayTeam} size="large" /><div className="mt-2 text-sm font-black">{match.awayTeam.shortName || match.awayTeam.name}</div></div>
        </div>
        <div className="border-t border-slate-200 p-5 text-sm">
          <div className="flex items-center gap-2"><Clock3 size={18} className="text-emerald-700" />Jornada {match.matchday || "-"} · {match.stage?.replaceAll("_", " ")}</div>
          {match.venue && <div className="mt-3 text-slate-500">Estadio: {match.venue}</div>}
          {match.referees?.length > 0 && <div className="mt-2 text-slate-500">Árbitro: {match.referees[0].name}</div>}
        </div>
      </article>
    </section>
  );
}

export default function App() {
  const [data, setData] = useState({ competitions: {} });
  const [leagueCode, setLeagueCode] = useState("PD");
  const [tab, setTab] = useState("matches");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setData(await response.json());
    } catch (loadError) {
      console.error(loadError);
      setError("No ha sido posible cargar los datos de fútbol.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const league = LEAGUES.find((item) => item.code === leagueCode);
  const leagueData = data.competitions?.[leagueCode] || {};
  const matches = leagueData.matches?.matches || [];
  const standings = leagueData.standings?.standings || [];
  const scorers = leagueData.scorers?.scorers || [];

  function changeLeague(code) {
    setLeagueCode(code);
    setSelectedMatch(null);
    window.scrollTo(0, 0);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button onClick={() => { setSelectedMatch(null); setTab("matches"); }} className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-xl">⚽</div>
            <div className="text-left"><div className="text-lg font-black">Fútbol</div><div className="text-[10px] text-slate-500">Resultados y clasificaciones</div></div>
          </button>
          <button onClick={loadData} className="rounded-xl border border-slate-200 p-2 text-slate-600"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 pb-28">
        {selectedMatch ? (
          <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />
        ) : (
          <>
            <section className="mb-5 rounded-3xl bg-gradient-to-br from-emerald-700 to-green-950 p-5 text-white shadow-lg">
              <div className="text-xs font-black uppercase tracking-widest text-emerald-200">Europa</div>
              <h1 className="mt-1 text-3xl font-black">El fútbol, al día.</h1>
              <p className="mt-2 text-sm text-emerald-100">España, Inglaterra, Italia y Francia.</p>
            </section>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {LEAGUES.map((item) => (
                <button key={item.code} onClick={() => changeLeague(item.code)} className={`flex-shrink-0 rounded-2xl px-4 py-3 text-left ${leagueCode === item.code ? "bg-emerald-700 text-white" : "bg-white text-slate-700"}`}>
                  <div className="text-lg">{item.flag}</div><div className="text-xs font-black">{item.name}</div><div className={`text-[9px] ${leagueCode === item.code ? "text-emerald-100" : "text-slate-400"}`}>{item.country}</div>
                </button>
              ))}
            </div>

            <div className="mb-5 flex items-end justify-between">
              <div><p className="text-xs font-black uppercase text-emerald-700">{league?.country}</p><h2 className="text-2xl font-black">{league?.name}</h2></div>
              {data.updatedAt && <div className="text-right text-[9px] text-slate-400">Actualizado<br />{new Date(data.updatedAt).toLocaleString("es-ES")}</div>}
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">Cargando datos...</div>
            ) : error ? (
              <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">{error}</div>
            ) : tab === "matches" ? (
              <MatchesView matches={matches} onOpen={setSelectedMatch} />
            ) : tab === "standings" ? (
              <StandingsView standings={standings} />
            ) : (
              <ScorersView scorers={scorers} />
            )}
          </>
        )}
      </main>

      {!selectedMatch && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-2 pt-2 backdrop-blur" style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTab(key); window.scrollTo(0, 0); }} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${tab === key ? "bg-slate-950 text-white" : "text-slate-500"}`}>
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
