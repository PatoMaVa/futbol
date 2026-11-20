import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, ChevronLeft, Clock3, Goal, ListOrdered, MapPin,
  RefreshCw, Shield, Square, Repeat2, Target, Trophy, RotateCcw
} from "lucide-react";

const DATA_URL = `${import.meta.env.BASE_URL}data/index.json`;

const LEAGUES = [
  { code: "PD", name: "LaLiga", country: "España", flag: "🇪🇸" },
  { code: "PL", name: "Premier", country: "Inglaterra", flag: "🇬🇧" },
  { code: "SA", name: "Serie A", country: "Italia", flag: "🇮🇹" },
  { code: "FL1", name: "Ligue 1", country: "Francia", flag: "🇫🇷" },
];

const TABS = [
  { key: "matches", label: "Partidos", icon: CalendarDays },
  { key: "standings", label: "Clasificación", icon: ListOrdered },
  { key: "statistics", label: "Estadísticas", icon: Goal },
  { key: "penalties", label: "Penaltis", icon: Target },
];

const SHOT_ZONES = [
  { id: "tl", label: "↖", name: "Izquierda alta", x: 18, y: 22 },
  { id: "tc", label: "↑", name: "Centro alto", x: 50, y: 17 },
  { id: "tr", label: "↗", name: "Derecha alta", x: 82, y: 22 },
  { id: "bl", label: "↙", name: "Izquierda baja", x: 20, y: 68 },
  { id: "bc", label: "↓", name: "Centro bajo", x: 50, y: 72 },
  { id: "br", label: "↘", name: "Derecha baja", x: 80, y: 68 },
];

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" });
}
function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
function formatFullDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("es-ES", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}
function isLive(match) { return ["IN_PLAY", "PAUSED"].includes(match?.status); }
function isUpcoming(match) { return ["SCHEDULED", "TIMED"].includes(match?.status); }
function statusLabel(match) {
  if (!match) return "";
  if (match.status === "IN_PLAY") {
    if (match.minute && match.injuryTime) return `${match.minute}+${match.injuryTime}'`;
    if (match.minute) return `${match.minute}'`;
    return "EN DIRECTO";
  }
  return ({ SCHEDULED: "Programado", TIMED: "Programado", PAUSED: "Descanso", FINISHED: "Final", POSTPONED: "Aplazado", SUSPENDED: "Suspendido", CANCELLED: "Cancelado" })[match.status] || match.status || "";
}
function scrollTop() {
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function TeamBadge({ team, size = "normal" }) {
  const [error, setError] = useState(false);
  useEffect(() => setError(false), [team?.id]);
  const box = size === "large" ? "h-16 w-16" : "h-10 w-10";
  const image = size === "large" ? "h-13 w-13" : "h-8 w-8";
  return <div className={`grid ${box} flex-shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm`}>
    {team?.crest && !error ? <img src={team.crest} alt={team.shortName || team.name || "Equipo"} className={`${image} object-contain`} onError={() => setError(true)} /> : <Shield size={size === "large" ? 30 : 20} className="text-emerald-700" />}
  </div>;
}

function TeamLine({ team, goals, winner }) {
  return <div className="flex items-center gap-3">
    <TeamBadge team={team} />
    <div className={`min-w-0 flex-1 truncate ${winner ? "font-black text-slate-950" : "font-semibold text-slate-700"}`}>{team?.shortName || team?.name}</div>
    <div className={`text-2xl ${winner ? "font-black" : "font-bold text-slate-500"}`}>{goals ?? "-"}</div>
  </div>;
}

function MatchCard({ match, onOpen }) {
  const home = match.score?.fullTime?.home;
  const away = match.score?.fullTime?.away;
  const finished = match.status === "FINISHED";
  const live = isLive(match);
  return <button onClick={() => onOpen(match)} className={`w-full rounded-3xl border bg-white p-4 text-left shadow-sm transition active:bg-emerald-50 ${live ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"}`}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div><div className={`text-xs font-black uppercase ${live ? "text-red-600" : finished ? "text-emerald-700" : "text-slate-600"}`}>{live && "● "}{statusLabel(match)}</div>
      <div className="mt-1 text-[11px] text-slate-400">{formatDate(match.utcDate)}{isUpcoming(match) && ` · ${formatTime(match.utcDate)}`}</div></div>
      <div className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">J{match.matchday || "-"}</div>
    </div>
    <div className="space-y-3"><TeamLine team={match.homeTeam} goals={home} winner={finished && home > away} /><TeamLine team={match.awayTeam} goals={away} winner={finished && away > home} /></div>
    <div className="mt-3 text-right text-xs font-black text-emerald-700">Ver detalle →</div>
  </button>;
}

function MatchGroup({ title, subtitle, matches = [], onOpen, live = false }) {
  if (!matches.length) return null;
  return <section className="mb-8"><div className="mb-3"><div className="flex items-center gap-2">{live && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />}<h3 className="text-lg font-black">{title}</h3></div>{subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}</div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{matches.map(m => <MatchCard key={m.id} match={m} onOpen={onOpen} />)}</div></section>;
}
function MatchesView(props) {
  const { lastMatches=[], liveMatches=[], nextMatches=[], lastMatchday, nextMatchday, onOpen } = props;
  return <div><MatchGroup title="En directo" subtitle="Partidos que se están disputando ahora" matches={liveMatches} onOpen={onOpen} live />
    <MatchGroup title="Última jornada" subtitle={lastMatchday ? `Jornada ${lastMatchday}` : ""} matches={lastMatches} onOpen={onOpen} />
    <MatchGroup title="Próxima jornada" subtitle={nextMatchday ? `Jornada ${nextMatchday}` : ""} matches={nextMatches} onOpen={onOpen} />
    {!lastMatches.length && !liveMatches.length && !nextMatches.length && <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">No hay partidos disponibles.</div>}
  </div>;
}

function StandingsView({ standings }) {
  const table = standings?.find(x => x.type === "TOTAL")?.table || standings?.[0]?.table || [];
  return <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="grid grid-cols-[28px_minmax(0,1fr)_28px_27px_27px_34px_40px] bg-slate-100 px-2 py-3 text-[8px] font-black uppercase text-slate-500"><div>#</div><div>Equipo</div><div className="text-center">PJ</div><div className="text-center">V</div><div className="text-center">E</div><div className="text-center">DG</div><div className="text-right">PTS</div></div>
    {table.map(row => <div key={row.team.id} className="grid grid-cols-[28px_minmax(0,1fr)_28px_27px_27px_34px_40px] items-center border-t border-slate-200 px-2 py-3">
      <div className="text-xs font-black text-slate-400">{row.position}</div><div className="flex min-w-0 items-center gap-2"><TeamBadge team={row.team} /><div className="min-w-0 truncate text-xs font-bold">{row.team.shortName || row.team.name}</div></div><div className="text-center text-xs">{row.playedGames}</div><div className="text-center text-xs">{row.won}</div><div className="text-center text-xs">{row.draw}</div><div className="text-center text-xs">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</div><div className="text-right text-sm font-black text-emerald-700">{row.points}</div>
    </div>)}</section>;
}

function StatisticsView({ scorers=[] }) {
  const [mode, setMode] = useState("goals");
  const ordered = useMemo(() => [...scorers].sort((a,b) => Number(mode === "goals" ? b.goals||0 : b.assists||0) - Number(mode === "goals" ? a.goals||0 : a.assists||0)), [scorers, mode]);
  return <section><div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-200 p-1">
    {[["goals","Goleadores"],["assists","Asistencias"]].map(([key,label]) => <button key={key} onClick={() => setMode(key)} className={`rounded-xl py-2 text-sm font-black ${mode===key ? "bg-white shadow-sm" : "text-slate-500"}`}>{label}</button>)}
  </div><div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="grid grid-cols-[30px_minmax(0,1fr)_48px] bg-slate-100 px-3 py-3 text-[9px] font-black uppercase text-slate-500"><div>#</div><div>Jugador</div><div className="text-right">{mode === "goals" ? "Goles" : "Asist."}</div></div>
    {ordered.map((item,index) => <div key={`${item.player.id}-${item.team.id}`} className="grid grid-cols-[30px_minmax(0,1fr)_48px] items-center border-t border-slate-200 px-3 py-3"><div className="text-xs font-black text-slate-400">{index+1}</div><div className="flex min-w-0 items-center gap-2"><TeamBadge team={item.team}/><div className="min-w-0"><div className="truncate text-xs font-bold">{item.player.name}</div><div className="truncate text-[9px] text-slate-400">{item.team.shortName || item.team.name} · {item.playedMatches ?? 0} PJ</div></div></div><div className="text-right text-lg font-black text-emerald-700">{mode === "goals" ? item.goals ?? 0 : item.assists ?? 0}</div></div>)}
  </div></section>;
}

function eventType(e){ return String(e?.event_type||"").toLowerCase().trim(); }
function eventMinute(e){ if(e?.minute==null) return ""; return Number(e.minute_added)>0 ? `${e.minute}+${e.minute_added}'` : `${e.minute}'`; }
function eventTeam(e,p){ if(String(e?.team_id)===String(p?.home_team?.id)) return p.home_team?.name||""; if(String(e?.team_id)===String(p?.away_team?.id)) return p.away_team?.name||""; return ""; }
function sorted(events){ return [...events].sort((a,b)=>Number(a.minute||0)-Number(b.minute||0)||Number(a.minute_added||0)-Number(b.minute_added||0)); }

function MatchTimeline({ events=[], pitchMatch }) {
  if(!events.length) return <div className="border-t border-slate-200 p-5 text-center text-sm text-slate-500">Los eventos detallados de este partido todavía no están disponibles.</div>;
  const goals=sorted(events.filter(e=>eventType(e)==="goal"));
  const cards=sorted(events.filter(e=>["yellowcard","redcard"].includes(eventType(e))));
  const subs=sorted(events.filter(e=>eventType(e)==="substitution"));
  return <>
    {goals.length>0 && <section className="border-t border-slate-200 p-5"><h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Goal size={19} className="text-emerald-700"/>Goles</h3><div className="space-y-3">{goals.map((e,i)=><div key={i} className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3"><div className="w-12 font-black text-emerald-700">{eventMinute(e)}</div><div className="flex-1"><div className="font-black">⚽ {e.player?.name||"Gol"}</div><div className="text-xs text-slate-500">{eventTeam(e,pitchMatch)}{e.assist_player?.name ? ` · Asistencia: ${e.assist_player.name}` : ""}{e.is_penalty ? " · Penalti" : ""}{e.is_own_goal ? " · Autogol" : ""}</div></div>{e.score_home!=null && e.score_away!=null && <div className="rounded-xl bg-white px-3 py-1.5 font-black">{e.score_home}-{e.score_away}</div>}</div>)}</div></section>}
    {cards.length>0 && <section className="border-t border-slate-200 p-5"><h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Square size={18} className="fill-yellow-400 text-yellow-400"/>Tarjetas</h3><div className="space-y-3">{cards.map((e,i)=><div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><div className="w-12 font-black text-slate-500">{eventMinute(e)}</div><div className={`h-6 w-4 rounded-sm ${eventType(e)==="redcard" ? "bg-red-600" : "bg-yellow-400"}`}/><div><div className="font-bold">{e.player?.name||"Jugador"}</div><div className="text-xs text-slate-500">{eventTeam(e,pitchMatch)}</div></div></div>)}</div></section>}
    {subs.length>0 && <Substitutions events={subs} pitchMatch={pitchMatch}/>} 
  </>;
}
function Substitutions({events,pitchMatch}){
  const [open,setOpen]=useState(false);
  return <section className="border-t border-slate-200 p-5"><button onClick={()=>setOpen(!open)} className="flex w-full items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-black"><Repeat2 size={19} className="text-blue-600"/>Cambios</h3><span className="text-xs font-bold text-emerald-700">{open?"Ocultar":`Ver ${events.length}`}</span></button>{open&&<div className="mt-4 space-y-3">{events.map((e,i)=><div key={i} className="flex gap-3 rounded-2xl bg-slate-50 p-3"><div className="w-12 font-black text-slate-500">{eventMinute(e)}</div><div><div className="text-xs text-slate-500">{eventTeam(e,pitchMatch)}</div><div className="font-bold text-emerald-700">↑ {e.sub_in_player?.name||""}</div><div className="text-red-600">↓ {e.player?.name||""}</div></div></div>)}</div>}</section>;
}

function MatchDetail({match,detail,pitchData,onBack}){
  const full=detail||match, pitch=pitchData?.pitchMatch||null, events=Array.isArray(pitchData?.events)?pitchData.events:[];
  const hg=full.score?.fullTime?.home ?? pitch?.score_home ?? "-", ag=full.score?.fullTime?.away ?? pitch?.score_away ?? "-";
  const referee=full.referees?.[0];
  return <section><button onClick={onBack} className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold"><ChevronLeft size={18}/>Partidos</button>
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg"><div className={`p-5 text-center text-white ${isLive(full)?"bg-gradient-to-br from-red-500 to-red-800":"bg-gradient-to-br from-emerald-700 to-green-950"}`}><div className="text-xs font-black uppercase tracking-widest">{isLive(full)&&"● "}{statusLabel(full)}</div><div className="mt-1 text-xs text-emerald-100">{formatFullDate(full.utcDate)}</div></div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-5"><div className="flex flex-col items-center text-center"><TeamBadge team={full.homeTeam} size="large"/><div className="mt-2 text-sm font-black">{full.homeTeam?.shortName||full.homeTeam?.name}</div></div><div className="flex items-center gap-2"><span className="text-4xl font-black">{hg}</span><span className="text-slate-300">-</span><span className="text-4xl font-black">{ag}</span></div><div className="flex flex-col items-center text-center"><TeamBadge team={full.awayTeam} size="large"/><div className="mt-2 text-sm font-black">{full.awayTeam?.shortName||full.awayTeam?.name}</div></div></div>
    <section className="border-t border-slate-200 p-5"><h3 className="mb-4 text-lg font-black">Información</h3><div className="space-y-4"><div className="flex gap-3"><CalendarDays size={18} className="text-emerald-700"/><div><div className="text-sm font-bold">Jornada {full.matchday||"-"}</div><div className="text-xs text-slate-500">{formatFullDate(full.utcDate)}</div></div></div>{full.venue&&<div className="flex gap-3"><MapPin size={18} className="text-emerald-700"/><div><div className="text-sm font-bold">Estadio</div><div className="text-xs text-slate-500">{full.venue}</div></div></div>}{referee&&<div className="flex gap-3"><Shield size={18} className="text-emerald-700"/><div><div className="text-sm font-bold">Árbitro</div><div className="text-xs text-slate-500">{referee.name}{referee.nationality?` · ${referee.nationality}`:""}</div></div></div>}</div></section>
    <MatchTimeline events={events} pitchMatch={pitch}/></article>
  </section>;
}

function PenaltyGame() {
  const fieldRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const timerRef = React.useRef([]);
  const [difficulty, setDifficulty] = useState(null);
  const [shots, setShots] = useState(0);
  const [goals, setGoals] = useState(0);
  const [history, setHistory] = useState([]);
  const [phase, setPhase] = useState("ready");
  const [message, setMessage] = useState("Desliza el balón hacia la portería");
  const [ball, setBall] = useState({ x: 50, y: 84, scale: 1, rotate: 0 });
  const [keeper, setKeeper] = useState({ x: 50, y: 31, rotate: 0 });
  const [trail, setTrail] = useState([]);
  const [record, setRecord] = useState(() => {
    try { return Number(localStorage.getItem("football-swipe-penalty-record") || 0); }
    catch { return 0; }
  });

  const settings = {
    rookie: { label: "Rookie", reaction: 620, reach: 4.5, error: 24, saveChance: 0.16, description: "Portero lento. Ideal para aprender a colocar los tiros." },
    professional: { label: "Profesional", reaction: 500, reach: 6.0, error: 18, saveChance: 0.28, description: "Portero equilibrado, pero batible con buenos disparos." },
    allstar: { label: "All-Star", reaction: 380, reach: 7.5, error: 12, saveChance: 0.42, description: "Más reflejos y alcance, sin ser imposible." },
  };

  useEffect(() => () => timerRef.current.forEach(clearTimeout), []);
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timerRef.current.push(id); return id; };
  const resetPositions = () => {
    setBall({ x: 50, y: 84, scale: 1, rotate: 0 });
    setKeeper({ x: 50, y: 31, rotate: 0 });
    setTrail([]);
  };

  function start(level) {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setDifficulty(level);
    setShots(0); setGoals(0); setHistory([]); setPhase("ready");
    setMessage("Desliza el balón hacia la portería");
    resetPositions();
    scrollTop();
  }

  function pointerPosition(event) {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
      time: performance.now(),
      width: rect.width,
      height: rect.height,
    };
  }

  function onPointerDown(event) {
    if (phase !== "ready") return;
    const point = pointerPosition(event);
    if (!point) return;
    const distance = Math.hypot(point.x - ball.x, point.y - ball.y);
    if (distance > 14) {
      setMessage("Toca el balón y desliza hacia arriba");
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, points: [point], start: point };
    setPhase("aiming");
    setMessage("Suelta para chutar");
  }

  function onPointerMove(event) {
    if (phase !== "aiming" || dragRef.current?.pointerId !== event.pointerId) return;
    const point = pointerPosition(event);
    if (!point) return;
    dragRef.current.points.push(point);
    dragRef.current.points = dragRef.current.points.slice(-12);
    setTrail(dragRef.current.points.slice(-5).map((p) => ({ x: p.x, y: p.y })));
    setBall((current) => ({ ...current, x: point.x, y: point.y, rotate: current.rotate + 12 }));
  }

  function onPointerCancel() {
    if (phase !== "aiming") return;
    dragRef.current = null;
    setPhase("ready");
    setMessage("Desliza el balón hacia la portería");
    resetPositions();
  }

  function onPointerUp(event) {
    if (phase !== "aiming" || dragRef.current?.pointerId !== event.pointerId) return;
    const end = pointerPosition(event);
    const data = dragRef.current;
    dragRef.current = null;
    if (!end || !data) return onPointerCancel();

    const samples = [...data.points, end];
    const recent = samples.filter((p) => end.time - p.time <= 130);
    const anchor = recent[0] || data.start;
    const dx = end.x - anchor.x;
    const dy = end.y - anchor.y;
    const totalDx = end.x - data.start.x;
    const totalDy = end.y - data.start.y;
    const duration = Math.max(35, end.time - anchor.time);
    const speed = Math.hypot(dx, dy) / duration;

    if (totalDy > -18 || speed < 0.11) {
      setPhase("ready");
      setMessage("Haz un gesto más rápido y hacia arriba");
      resetPositions();
      return;
    }

    const goalY = 29;
    const travelY = Math.max(1, data.start.y - end.y);
    const projection = Math.max(0.7, Math.min(2.2, (data.start.y - goalY) / travelY));
    const targetX = data.start.x + totalDx * projection;
    const lift = Math.max(0, Math.min(1, (-totalDy - 18) / 55));
    const targetY = 43 - lift * 30;
    resolveShot(targetX, targetY, speed, totalDx);
  }

  function resolveShot(rawX, rawY, speed, curve) {
    const config = settings[difficulty];
    setPhase("shooting");
    setTrail([]);

    const nearPost = rawX >= 7 && rawX <= 93 && rawY >= 7 && rawY <= 47 &&
      (rawX < 12 || rawX > 88 || rawY < 11 || rawY > 43);
    const inside = rawX >= 12 && rawX <= 88 && rawY >= 11 && rawY <= 43;
    const targetX = Math.max(3, Math.min(97, rawX));
    const targetY = Math.max(5, Math.min(54, rawY));

    const keeperError = (Math.random() * 2 - 1) * config.error;
    const predictedX = Math.max(12, Math.min(88, targetX + keeperError));
    const predictedY = Math.max(13, Math.min(43, targetY + (Math.random() * 2 - 1) * config.error * 0.35));
    const reactionDelay = Math.max(180, config.reaction - Math.min(80, speed * 55));
    const ballDuration = Math.max(330, 690 - speed * 280);

    later(() => setKeeper({ x: predictedX, y: predictedY, rotate: predictedX < 45 ? -35 : predictedX > 55 ? 35 : 0 }), reactionDelay);
    requestAnimationFrame(() => setBall({ x: targetX, y: targetY, scale: 0.58, rotate: curve * 5 }));

    later(() => {
      let outcome = "goal";
      let text = "¡GOOOL!";
      if (!inside) {
        outcome = nearPost ? "post" : "miss";
        text = nearPost ? "¡AL PALO!" : "FUERA";
      } else {
        const keeperDistance = Math.hypot(targetX - predictedX, (targetY - predictedY) * 1.35);
        const effectiveReach = Math.max(2.5, config.reach - Math.min(2.8, speed * 1.25));
        const cornerFactor = (targetX < 25 || targetX > 75 || targetY < 20) ? 0.55 : 1;
        const powerFactor = Math.max(0.55, 1 - Math.min(0.35, speed * 0.18));
        const saveChance = config.saveChance * cornerFactor * powerFactor;
        if (keeperDistance <= effectiveReach && Math.random() < saveChance) {
          outcome = "save";
          text = "¡PARADÓN!";
        }
      }

      const nextShots = shots + 1;
      const nextGoals = goals + (outcome === "goal" ? 1 : 0);
      setShots(nextShots);
      setGoals(nextGoals);
      setHistory((items) => [...items, outcome]);
      setPhase("result");
      setMessage(text);

      if (nextShots >= 10) {
        later(() => {
          setPhase("finished");
          if (nextGoals > record) {
            setRecord(nextGoals);
            try { localStorage.setItem("football-swipe-penalty-record", String(nextGoals)); } catch {}
          }
        }, 1050);
      } else {
        later(() => {
          resetPositions();
          setPhase("ready");
          setMessage("Desliza el balón hacia la portería");
        }, 1150);
      }
    }, ballDuration + 80);
  }

  if (!difficulty) {
    return <section className="mx-auto max-w-2xl">
      <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Penaltis</p>
      <h2 className="mt-1 text-3xl font-black">Elige al portero</h2>
      <p className="mt-2 text-sm text-slate-500">Desliza con el dedo o el ratón. La velocidad y la dirección decidirán el disparo.</p>
      <div className="mt-5 grid gap-3">
        {Object.entries(settings).map(([key, item]) => <button key={key} onClick={() => start(key)} className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] hover:border-emerald-400">
          <div className="flex items-center justify-between gap-3"><div><div className="text-lg font-black">{item.label}</div><div className="mt-1 text-xs text-slate-500">{item.description}</div></div><div className="text-3xl">🧤</div></div>
        </button>)}
      </div>
    </section>;
  }

  if (phase === "finished") {
    const title = goals >= 9 ? "Delantero de élite" : goals >= 7 ? "Gran tanda" : goals >= 5 ? "Buen trabajo" : "Toca entrenar";
    return <section className="mx-auto max-w-xl">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-green-950 p-7 text-center text-white shadow-xl">
        <Trophy className="mx-auto" size={44}/><p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Resultado final</p>
        <div className="mt-3 text-7xl font-black">{goals}/10</div><h2 className="mt-4 text-2xl font-black">{title}</h2><p className="mt-2 text-sm text-emerald-100">Récord en este dispositivo: {Math.max(record, goals)}/10</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => start(difficulty)} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 text-sm font-black text-white"><RotateCcw size={18}/>Otra tanda</button><button onClick={() => setDifficulty(null)} className="rounded-2xl border border-slate-300 bg-white py-4 text-sm font-black">Cambiar nivel</button></div>
    </section>;
  }

  const outcomeIcon = { goal: "⚽", save: "🧤", miss: "❌", post: "🥅" };
  return <section className="mx-auto max-w-3xl select-none">
    <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-700">{settings[difficulty].label}</p><h2 className="text-2xl font-black">Chuta a portería</h2></div><div className="flex gap-2"><div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm"><div className="font-black">{shots}/10</div><div className="text-[9px] uppercase text-slate-400">tiros</div></div><div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white"><div className="font-black">{goals}</div><div className="text-[9px] uppercase text-slate-300">goles</div></div></div></div>
    <div className="mb-3 flex min-h-7 flex-wrap gap-1">{Array.from({ length: 10 }, (_, index) => <span key={index} className={`grid h-7 w-7 place-items-center rounded-full text-xs ${history[index] ? "bg-white shadow-sm" : index === shots ? "bg-emerald-100 ring-2 ring-emerald-500" : "bg-slate-200"}`}>{history[index] ? outcomeIcon[history[index]] : index + 1}</span>)}</div>
    <div ref={fieldRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} className="relative aspect-[4/5] max-h-[680px] w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-600 shadow-xl" style={{ touchAction: "none" }}>
      <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-sky-300 to-sky-100"/>
      <div className="absolute bottom-0 left-0 right-0 h-[48%] bg-[linear-gradient(135deg,#15803d_25%,#16a34a_25%,#16a34a_50%,#15803d_50%,#15803d_75%,#16a34a_75%)] bg-[length:48px_48px]"/>
      <div className="absolute left-[8%] right-[8%] top-[9%] h-[37%] border-x-[8px] border-t-[8px] border-white shadow-[0_3px_8px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(to right,transparent 47%,white 48%,white 52%,transparent 53%),linear-gradient(to bottom,transparent 47%,white 48%,white 52%,transparent 53%)", backgroundSize: "34px 30px" }}/>
      </div>
      <div className="absolute left-1/2 top-[31%] h-16 w-9 -translate-x-1/2 -translate-y-1/2 rounded-t-full bg-slate-900 transition-all duration-300" style={{ left: `${keeper.x}%`, top: `${keeper.y}%`, transform: `translate(-50%,-50%) rotate(${keeper.rotate}deg)` }}><div className="absolute -left-5 top-5 h-2 w-7 -rotate-12 rounded-full bg-slate-900"/><div className="absolute -right-5 top-5 h-2 w-7 rotate-12 rounded-full bg-slate-900"/><div className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-amber-300"/></div>
      <div className="absolute left-1/2 top-[68%] h-20 w-20 -translate-x-1/2 rounded-full border-2 border-white/70"/>
      {trail.map((point, index) => <span key={index} className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" style={{ left: `${point.x}%`, top: `${point.y}%`, opacity: (index + 1) / trail.length }}/>) }
      <div className="pointer-events-none absolute z-20 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-4xl shadow-[0_8px_14px_rgba(0,0,0,0.35)] transition-[left,top,transform] ease-out" style={{ left: `${ball.x}%`, top: `${ball.y}%`, transform: `translate(-50%,-50%) scale(${ball.scale}) rotate(${ball.rotate}deg)`, transitionDuration: phase === "shooting" ? "520ms" : phase === "aiming" ? "0ms" : "260ms" }}>⚽</div>
      <div className={`absolute left-1/2 top-[57%] -translate-x-1/2 rounded-full px-4 py-2 text-center text-sm font-black shadow-lg ${phase === "result" ? "bg-white text-slate-950" : "bg-slate-950/80 text-white"}`}>{message}</div>
    </div>
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-center gap-2 font-black"><Target size={17} className="text-emerald-700"/>Cómo jugar</div><p className="mt-1 text-xs leading-5 text-slate-600">Toca el balón, desliza hacia la portería y suelta. Un gesto rápido da potencia; la dirección y la altura dependen del movimiento. Puedes marcar, fallar, dar al poste o encontrarte con el portero.</p></div>
  </section>;
}
export default function App(){
  const [data,setData]=useState({competitions:{},matchDetails:{},pitchEvents:{}}),[leagueCode,setLeagueCode]=useState("PD"),[tab,setTab]=useState("matches"),[selectedMatch,setSelectedMatch]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
  async function loadData(){setLoading(true);setError("");try{const r=await fetch(`${DATA_URL}?t=${Date.now()}`,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);setData(await r.json())}catch(e){console.error(e);setError("No ha sido posible cargar los datos de fútbol.")}finally{setLoading(false)}}
  useEffect(()=>{loadData()},[]);useEffect(()=>{if(selectedMatch)scrollTop()},[selectedMatch]);
  const league=LEAGUES.find(x=>x.code===leagueCode),ld=data.competitions?.[leagueCode]||{},matches=ld.matches?.matches||[],lastMatches=ld.lastMatches||matches.filter(m=>m.status==="FINISHED"&&m.matchday===ld.lastMatchday),liveMatches=ld.liveMatches||matches.filter(isLive),nextMatches=ld.nextMatches||matches.filter(m=>isUpcoming(m)&&m.matchday===ld.nextMatchday),standings=ld.standings?.standings||[],scorers=ld.scorers?.scorers||[];
  const detail=selectedMatch?data.matchDetails?.[String(selectedMatch.id)]||null:null,pitch=selectedMatch?data.pitchEvents?.[String(selectedMatch.id)]||null:null;
  function changeLeague(code){setLeagueCode(code);setSelectedMatch(null);scrollTop()} function changeTab(key){setTab(key);setSelectedMatch(null);scrollTop()}
  return <div className="min-h-screen bg-slate-50 text-slate-950"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur" style={{paddingTop:"env(safe-area-inset-top)"}}><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"><button onClick={()=>changeTab("matches")} className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-xl">⚽</div><div className="text-left"><div className="text-lg font-black">Fútbol</div><div className="text-[10px] text-slate-500">Resultados, estadísticas y juegos</div></div></button><button onClick={loadData} className="rounded-xl border border-slate-200 p-2 text-slate-600"><RefreshCw size={17} className={loading?"animate-spin":""}/></button></div></header>
  <main className="mx-auto max-w-7xl px-4 py-5 pb-28">{selectedMatch?<MatchDetail match={selectedMatch} detail={detail} pitchData={pitch} onBack={()=>{setSelectedMatch(null);scrollTop()}}/>:<>{tab!=="penalties"&&<><section className="mb-5 rounded-3xl bg-gradient-to-br from-emerald-700 to-green-950 p-5 text-white shadow-lg"><div className="text-xs font-black uppercase tracking-widest text-emerald-200">Europa</div><h1 className="mt-1 text-3xl font-black">El fútbol, al día.</h1><p className="mt-2 text-sm text-emerald-100">España, Inglaterra, Italia y Francia.</p></section><div className="mb-5 flex gap-2 overflow-x-auto pb-1">{LEAGUES.map(item=><button key={item.code} onClick={()=>changeLeague(item.code)} className={`w-[92px] flex-shrink-0 rounded-2xl px-3 py-3 text-left ${leagueCode===item.code?"bg-emerald-700 text-white":"bg-white text-slate-700"}`}><div className="text-lg">{item.flag}</div><div className="text-xs font-black">{item.name}</div><div className={`text-[9px] ${leagueCode===item.code?"text-emerald-100":"text-slate-400"}`}>{item.country}</div></button>)}</div><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-black uppercase text-emerald-700">{league?.country}</p><h2 className="text-2xl font-black">{league?.name}</h2></div>{data.updatedAt&&<div className="text-right text-[9px] text-slate-400">Actualizado<br/>{new Date(data.updatedAt).toLocaleString("es-ES")}</div>}</div></>}
  {tab==="penalties"?<PenaltyGame/>:loading?<div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">Cargando datos...</div>:error?<div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">{error}</div>:tab==="matches"?<MatchesView lastMatches={lastMatches} liveMatches={liveMatches} nextMatches={nextMatches} lastMatchday={ld.lastMatchday} nextMatchday={ld.nextMatchday} onOpen={setSelectedMatch}/>:tab==="standings"?<StandingsView standings={standings}/>:<StatisticsView scorers={scorers}/>}</>}</main>
  {!selectedMatch&&<nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-1 pt-2 backdrop-blur" style={{paddingBottom:"calc(0.5rem + env(safe-area-inset-bottom))"}}>{TABS.map(({key,label,icon:Icon})=><button key={key} onClick={()=>changeTab(key)} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold ${tab===key?"bg-slate-950 text-white":"text-slate-500"}`}><Icon size={18}/>{label}</button>)}</nav>}</div>;
}
