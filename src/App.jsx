import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronLeft,
  Clock3,
  Goal,
  ListOrdered,
  MapPin,
  RefreshCw,
  Shield,
  Square,
  Repeat2,
  UserRound,
} from "lucide-react";

const DATA_URL =
  `${import.meta.env.BASE_URL}data/index.json`;

const LEAGUES = [
  {
    code: "PD",
    name: "LaLiga",
    country: "España",
    flag: "🇪🇸",
  },
  {
    code: "PL",
    name: "Premier League",
    country: "Inglaterra",
    flag: "🏴",
  },
  {
    code: "SA",
    name: "Serie A",
    country: "Italia",
    flag: "🇮🇹",
  },
  {
    code: "FL1",
    name: "Ligue 1",
    country: "Francia",
    flag: "🇫🇷",
  },
];

const TABS = [
  {
    key: "matches",
    label: "Partidos",
    icon: CalendarDays,
  },
  {
    key: "standings",
    label: "Clasificación",
    icon: ListOrdered,
  },
  {
    key: "statistics",
    label: "Estadísticas",
    icon: Goal,
  },
];

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString(
    "es-ES",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }
  );
}

function formatTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleTimeString(
    "es-ES",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatFullDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleString(
    "es-ES",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function isLive(match) {
  return [
    "IN_PLAY",
    "PAUSED",
  ].includes(match?.status);
}

function statusLabel(match) {
  if (!match) return "";

  if (match.status === "IN_PLAY") {
    if (
      match.minute &&
      match.injuryTime
    ) {
      return `${match.minute}+${match.injuryTime}'`;
    }

    if (match.minute) {
      return `${match.minute}'`;
    }

    return "EN DIRECTO";
  }

  const labels = {
    SCHEDULED: "Programado",
    TIMED: "Programado",
    PAUSED: "Descanso",
    FINISHED: "Final",
    POSTPONED: "Aplazado",
    SUSPENDED: "Suspendido",
    CANCELLED: "Cancelado",
  };

  return (
    labels[match.status] ||
    match.status ||
    ""
  );
}

function scrollTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function TeamBadge({
  team,
  size = "normal",
}) {
  const [error, setError] =
    useState(false);

  useEffect(() => {
    setError(false);
  }, [team?.id]);

  const container =
    size === "large"
      ? "h-16 w-16"
      : "h-10 w-10";

  const image =
    size === "large"
      ? "h-13 w-13"
      : "h-8 w-8";

  return (
    <div
      className={`grid ${container} flex-shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm`}
    >
      {team?.crest && !error ? (
        <img
          src={team.crest}
          alt={
            team.shortName ||
            team.name
          }
          className={`${image} object-contain`}
          onError={() =>
            setError(true)
          }
        />
      ) : (
        <Shield
          size={
            size === "large"
              ? 30
              : 20
          }
          className="text-emerald-700"
        />
      )}
    </div>
  );
}

function TeamLine({
  team,
  goals,
  winner,
}) {
  return (
    <div className="flex items-center gap-3">
      <TeamBadge team={team} />

      <div
        className={`min-w-0 flex-1 truncate ${
          winner
            ? "font-black"
            : "font-semibold text-slate-700"
        }`}
      >
        {team?.shortName ||
          team?.name}
      </div>

      <div
        className={`text-2xl ${
          winner
            ? "font-black"
            : "font-bold text-slate-500"
        }`}
      >
        {goals ?? "-"}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  onOpen,
}) {
  const homeGoals =
    match.score?.fullTime?.home;

  const awayGoals =
    match.score?.fullTime?.away;

  const finished =
    match.status === "FINISHED";

  const live =
    isLive(match);

  const upcoming = [
    "TIMED",
    "SCHEDULED",
  ].includes(match.status);

  return (
    <button
      onClick={() =>
        onOpen(match)
      }
      className={`w-full rounded-3xl border bg-white p-4 text-left shadow-sm transition active:bg-emerald-50 ${
        live
          ? "border-red-300 ring-2 ring-red-100"
          : "border-slate-200"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div
            className={`text-xs font-black uppercase ${
              live
                ? "text-red-600"
                : finished
                ? "text-emerald-700"
                : "text-slate-600"
            }`}
          >
            {live && "● "}
            {statusLabel(match)}
          </div>

          <div className="mt-1 text-[11px] text-slate-400">
            {formatDate(
              match.utcDate
            )}

            {upcoming &&
              ` · ${formatTime(
                match.utcDate
              )}`}
          </div>
        </div>

        <div className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
          J{match.matchday || "-"}
        </div>
      </div>

      <div className="space-y-3">
        <TeamLine
          team={match.homeTeam}
          goals={homeGoals}
          winner={
            finished &&
            homeGoals > awayGoals
          }
        />

        <TeamLine
          team={match.awayTeam}
          goals={awayGoals}
          winner={
            finished &&
            awayGoals > homeGoals
          }
        />
      </div>

      {match.venue && (
        <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
          <MapPin size={12} />

          <span className="truncate">
            {match.venue}
          </span>
        </div>
      )}

      <div className="mt-3 text-right text-xs font-black text-emerald-700">
        Ver detalle →
      </div>
    </button>
  );
}

function MatchGroup({
  title,
  subtitle,
  matches,
  onOpen,
  live = false,
}) {
  if (!matches?.length) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          {live && (
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          )}

          <h3 className="text-lg font-black">
            {title}
          </h3>
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

function MatchesView({
  lastMatches,
  liveMatches,
  nextMatches,
  lastMatchday,
  nextMatchday,
  onOpen,
}) {
  return (
    <div>
      <MatchGroup
        title="En directo"
        subtitle="Partidos que se están disputando ahora"
        matches={liveMatches}
        onOpen={onOpen}
        live
      />

      <MatchGroup
        title="Última jornada"
        subtitle={
          lastMatchday
            ? `Jornada ${lastMatchday}`
            : ""
        }
        matches={lastMatches}
        onOpen={onOpen}
      />

      <MatchGroup
        title="Próxima jornada"
        subtitle={
          nextMatchday
            ? `Jornada ${nextMatchday}`
            : ""
        }
        matches={nextMatches}
        onOpen={onOpen}
      />

      {!lastMatches?.length &&
        !liveMatches?.length &&
        !nextMatches?.length && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">
            No hay partidos disponibles.
          </div>
        )}
    </div>
  );
}

function StandingsView({
  standings,
}) {
  const table =
    standings?.find(
      (item) =>
        item.type === "TOTAL"
    )?.table ||
    standings?.[0]?.table ||
    [];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[28px_minmax(0,1fr)_28px_27px_27px_34px_40px] bg-slate-100 px-2 py-3 text-[8px] font-black uppercase text-slate-500">
        <div>#</div>
        <div>Equipo</div>
        <div className="text-center">
          PJ
        </div>
        <div className="text-center">
          V
        </div>
        <div className="text-center">
          E
        </div>
        <div className="text-center">
          DG
        </div>
        <div className="text-right">
          PTS
        </div>
      </div>

      {table.map((row) => (
        <div
          key={row.team.id}
          className="grid grid-cols-[28px_minmax(0,1fr)_28px_27px_27px_34px_40px] items-center border-t border-slate-200 px-2 py-3"
        >
          <div className="text-xs font-black text-slate-400">
            {row.position}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <TeamBadge
              team={row.team}
            />

            <div className="min-w-0 truncate text-xs font-bold">
              {row.team.shortName ||
                row.team.name}
            </div>
          </div>

          <div className="text-center text-xs">
            {row.playedGames}
          </div>

          <div className="text-center text-xs">
            {row.won}
          </div>

          <div className="text-center text-xs">
            {row.draw}
          </div>

          <div className="text-center text-xs">
            {row.goalDifference > 0
              ? `+${row.goalDifference}`
              : row.goalDifference}
          </div>

          <div className="text-right text-sm font-black text-emerald-700">
            {row.points}
          </div>
        </div>
      ))}
    </section>
  );
}

function StatisticsView({
  scorers,
}) {
  const [mode, setMode] =
    useState("goals");

  const ordered =
    useMemo(() => {
      return [...scorers].sort(
        (a, b) => {
          if (
            mode === "assists"
          ) {
            return (
              Number(
                b.assists || 0
              ) -
              Number(
                a.assists || 0
              )
            );
          }

          return (
            Number(
              b.goals || 0
            ) -
            Number(
              a.goals || 0
            )
          );
        }
      );
    }, [scorers, mode]);

  return (
    <section>
      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-200 p-1">
        <button
          onClick={() =>
            setMode("goals")
          }
          className={`rounded-xl py-2 text-sm font-black ${
            mode === "goals"
              ? "bg-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          Goleadores
        </button>

        <button
          onClick={() =>
            setMode(
              "assists"
            )
          }
          className={`rounded-xl py-2 text-sm font-black ${
            mode === "assists"
              ? "bg-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          Asistencias
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[30px_minmax(0,1fr)_48px] bg-slate-100 px-3 py-3 text-[9px] font-black uppercase text-slate-500">
          <div>#</div>

          <div>
            Jugador
          </div>

          <div className="text-right">
            {mode === "goals"
              ? "Goles"
              : "Asist."}
          </div>
        </div>

        {ordered.map(
          (item, index) => (
            <div
              key={`${item.player.id}-${item.team.id}`}
              className="grid grid-cols-[30px_minmax(0,1fr)_48px] items-center border-t border-slate-200 px-3 py-3"
            >
              <div className="text-xs font-black text-slate-400">
                {index + 1}
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <TeamBadge
                  team={
                    item.team
                  }
                />

                <div className="min-w-0">
                  <div className="truncate text-xs font-bold">
                    {
                      item.player
                        .name
                    }
                  </div>

                  <div className="truncate text-[9px] text-slate-400">
                    {item.team
                      .shortName ||
                      item.team.name}
                    {" · "}
                    {item.playedMatches ??
                      0}{" "}
                    PJ
                  </div>
                </div>
              </div>

              <div className="text-right text-lg font-black text-emerald-700">
                {mode === "goals"
                  ? item.goals ??
                    0
                  : item.assists ??
                    0}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function normalizePitchEventType(
  event
) {
  return String(
    event?.event_type ||
      event?.type ||
      ""
  )
    .toLowerCase()
    .replace(/[_\s-]/g, "");
}

function eventMinute(event) {
  const minute =
    event?.minute;

  const added =
    event?.minute_added ??
    event?.injury_time ??
    event?.extra_minute;

  if (
    minute === null ||
    minute === undefined
  ) {
    return "";
  }

  if (added) {
    return `${minute}+${added}'`;
  }

  return `${minute}'`;
}

function eventPlayerName(
  event
) {
  return (
    event?.player?.name ||
    event?.player_name ||
    event?.scorer?.name ||
    event?.name ||
    ""
  );
}

function eventAssistName(
  event
) {
  return (
    event?.assist?.name ||
    event?.assist_player
      ?.name ||
    event?.assist_player_name ||
    ""
  );
}

function eventTeamName(
  event
) {
  return (
    event?.team?.name ||
    event?.team_name ||
    ""
  );
}

function eventScore(event) {
  const home =
    event?.score_home ??
    event?.score?.home;

  const away =
    event?.score_away ??
    event?.score?.away;

  if (
    home === undefined ||
    home === null ||
    away === undefined ||
    away === null
  ) {
    return null;
  }

  return `${home}-${away}`;
}

function isGoalEvent(event) {
  const type =
    normalizePitchEventType(
      event
    );

  return [
    "goal",
    "owngoal",
    "penaltygoal",
  ].includes(type);
}

function isYellowCardEvent(
  event
) {
  const type =
    normalizePitchEventType(
      event
    );

  return [
    "yellowcard",
    "yellow",
  ].includes(type);
}

function isRedCardEvent(
  event
) {
  const type =
    normalizePitchEventType(
      event
    );

  return [
    "redcard",
    "red",
    "secondyellowcard",
    "secondyellow",
  ].includes(type);
}

function isSubstitutionEvent(
  event
) {
  return (
    normalizePitchEventType(
      event
    ) === "substitution"
  );
}

function GoalsSection({
  events,
}) {
  const goals =
    events.filter(
      isGoalEvent
    );

  if (!goals.length) {
    return null;
  }

  return (
    <section className="border-t border-slate-200 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Goal
          size={19}
          className="text-emerald-700"
        />

        <h3 className="text-lg font-black">
          Goles
        </h3>
      </div>

      <div className="space-y-3">
        {goals.map(
          (goal, index) => {
            const player =
              eventPlayerName(
                goal
              );

            const assist =
              eventAssistName(
                goal
              );

            const score =
              eventScore(goal);

            return (
              <div
                key={`${goal.id || index}`}
                className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3"
              >
                <div className="w-12 flex-shrink-0 text-sm font-black text-emerald-700">
                  {eventMinute(
                    goal
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-black">
                    ⚽{" "}
                    {player ||
                      "Gol"}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {eventTeamName(
                      goal
                    )}

                    {assist &&
                      ` · Asistencia: ${assist}`}
                  </div>
                </div>

                {score && (
                  <div className="rounded-lg bg-white px-2 py-1 text-sm font-black">
                    {score}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

function CardsSection({
  events,
}) {
  const cards =
    events.filter(
      (event) =>
        isYellowCardEvent(
          event
        ) ||
        isRedCardEvent(
          event
        )
    );

  if (!cards.length) {
    return null;
  }

  return (
    <section className="border-t border-slate-200 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Square
          size={18}
          className="fill-yellow-400 text-yellow-400"
        />

        <h3 className="text-lg font-black">
          Tarjetas
        </h3>
      </div>

      <div className="space-y-3">
        {cards.map(
          (card, index) => {
            const red =
              isRedCardEvent(
                card
              );

            return (
              <div
                key={`${card.id || index}`}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <div className="w-12 flex-shrink-0 text-sm font-black text-slate-500">
                  {eventMinute(
                    card
                  )}
                </div>

                <div
                  className={`h-5 w-3 flex-shrink-0 rounded-sm ${
                    red
                      ? "bg-red-600"
                      : "bg-yellow-400"
                  }`}
                />

                <div className="min-w-0">
                  <div className="font-bold">
                    {eventPlayerName(
                      card
                    ) ||
                      "Jugador"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {eventTeamName(
                      card
                    )}

                    {" · "}

                    {red
                      ? "Roja"
                      : "Amarilla"}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

function SubstitutionsSection({
  events,
}) {
  const substitutions =
    events.filter(
      isSubstitutionEvent
    );

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  if (
    !substitutions.length
  ) {
    return null;
  }

  return (
    <section className="border-t border-slate-200 p-5">
      <button
        onClick={() =>
          setExpanded(
            !expanded
          )
        }
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Repeat2
            size={19}
            className="text-blue-600"
          />

          <h3 className="text-lg font-black">
            Cambios
          </h3>
        </div>

        <span className="text-xs font-bold text-emerald-700">
          {expanded
            ? "Ocultar"
            : `Ver ${substitutions.length}`}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {substitutions.map(
            (
              event,
              index
            ) => {
              const playerOut =
                event?.player_out
                  ?.name ||
                event
                  ?.player_out_name ||
                event?.player
                  ?.name ||
                "";

              const playerIn =
                event?.player_in
                  ?.name ||
                event
                  ?.player_in_name ||
                event?.related_player
                  ?.name ||
                "";

              return (
                <div
                  key={`${event.id || index}`}
                  className="rounded-2xl bg-slate-50 p-3"
                >
                  <div className="flex gap-3">
                    <div className="w-12 text-sm font-black text-slate-500">
                      {eventMinute(
                        event
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-400">
                        {eventTeamName(
                          event
                        )}
                      </div>

                      {playerIn && (
                        <div className="mt-1 text-sm font-bold text-emerald-700">
                          ↑{" "}
                          {playerIn}
                        </div>
                      )}

                      {playerOut && (
                        <div className="text-sm text-red-600">
                          ↓{" "}
                          {playerOut}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}

function MatchTimeline({
  events,
}) {
  if (!events.length) {
    return (
      <div className="border-t border-slate-200 p-5 text-center text-sm text-slate-500">
        Los eventos detallados de este partido todavía no están disponibles.
      </div>
    );
  }

  return (
    <>
      <GoalsSection
        events={events}
      />

      <CardsSection
        events={events}
      />

      <SubstitutionsSection
        events={events}
      />
    </>
  );
}

function MatchDetail({
  match,
  detail,
  pitchData,
  onBack,
}) {
  const fullMatch =
    detail || match;

  const pitchMatch =
    pitchData?.pitchMatch;

  const pitchEvents =
    Array.isArray(
      pitchData?.events
    )
      ? pitchData.events
      : [];

  const homeGoals =
    fullMatch.score?.fullTime
      ?.home ??
    pitchMatch?.score_home;

  const awayGoals =
    fullMatch.score?.fullTime
      ?.away ??
    pitchMatch?.score_away;

  const halfHome =
    fullMatch.score?.halfTime
      ?.home;

  const halfAway =
    fullMatch.score?.halfTime
      ?.away;

  const referee =
    fullMatch.referees?.[0];

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold"
      >
        <ChevronLeft
          size={18}
        />
        Partidos
      </button>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div
          className={`p-5 text-center text-white ${
            isLive(fullMatch)
              ? "bg-gradient-to-br from-red-500 to-red-800"
              : "bg-gradient-to-br from-emerald-700 to-green-950"
          }`}
        >
          <div className="text-xs font-black uppercase tracking-widest">
            {isLive(fullMatch) &&
              "● "}
            {statusLabel(
              fullMatch
            )}
          </div>

          <div className="mt-1 text-xs text-emerald-100">
            {formatFullDate(
              fullMatch.utcDate
            )}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-5">
          <div className="flex min-w-0 flex-col items-center text-center">
            <TeamBadge
              team={
                fullMatch
                  .homeTeam
              }
              size="large"
            />

            <div className="mt-2 text-sm font-black">
              {fullMatch
                .homeTeam
                ?.shortName ||
                fullMatch
                  .homeTeam
                  ?.name}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-4xl font-black">
              {homeGoals ??
                "-"}
            </span>

            <span className="text-slate-300">
              -
            </span>

            <span className="text-4xl font-black">
              {awayGoals ??
                "-"}
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-center text-center">
            <TeamBadge
              team={
                fullMatch
                  .awayTeam
              }
              size="large"
            />

            <div className="mt-2 text-sm font-black">
              {fullMatch
                .awayTeam
                ?.shortName ||
                fullMatch
                  .awayTeam
                  ?.name}
            </div>
          </div>
        </div>

        <section className="border-t border-slate-200 p-5">
          <h3 className="mb-4 text-lg font-black">
            Información
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays
                size={18}
                className="mt-0.5 text-emerald-700"
              />

              <div>
                <div className="text-sm font-bold">
                  Jornada{" "}
                  {fullMatch.matchday ||
                    "-"}
                </div>

                <div className="text-xs text-slate-500">
                  {formatFullDate(
                    fullMatch
                      .utcDate
                  )}
                </div>
              </div>
            </div>

            {fullMatch.venue && (
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 text-emerald-700"
                />

                <div>
                  <div className="text-sm font-bold">
                    Estadio
                  </div>

                  <div className="text-xs text-slate-500">
                    {
                      fullMatch.venue
                    }
                  </div>
                </div>
              </div>
            )}

            {referee && (
              <div className="flex items-start gap-3">
                <Shield
                  size={18}
                  className="mt-0.5 text-emerald-700"
                />

                <div>
                  <div className="text-sm font-bold">
                    Árbitro
                  </div>

                  <div className="text-xs text-slate-500">
                    {referee.name}

                    {referee
                      .nationality
                      ? ` · ${referee.nationality}`
                      : ""}
                  </div>
                </div>
              </div>
            )}

            {halfHome !==
              null &&
              halfHome !==
                undefined &&
              halfAway !==
                null &&
              halfAway !==
                undefined && (
                <div className="flex items-start gap-3">
                  <Clock3
                    size={18}
                    className="mt-0.5 text-emerald-700"
                  />

                  <div>
                    <div className="text-sm font-bold">
                      Descanso
                    </div>

                    <div className="text-xs text-slate-500">
                      {halfHome}
                      -
                      {halfAway}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </section>

        <MatchTimeline
          events={pitchEvents}
        />
      </article>
    </section>
  );
}

export default function App() {
  const [data, setData] =
    useState({
      competitions: {},
      matchDetails: {},
      pitchEvents: {},
    });

  const [
    leagueCode,
    setLeagueCode,
  ] = useState("PD");

  const [tab, setTab] =
    useState("matches");

  const [
    selectedMatch,
    setSelectedMatch,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `${DATA_URL}?t=${Date.now()}`,
          {
            cache:
              "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      setData(
        await response.json()
      );
    } catch (loadError) {
      console.error(
        loadError
      );

      setError(
        "No ha sido posible cargar los datos de fútbol."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      scrollTop();
    }
  }, [selectedMatch]);

  const league =
    LEAGUES.find(
      (item) =>
        item.code ===
        leagueCode
    );

  const leagueData =
    data.competitions?.[
      leagueCode
    ] || {};

  const matches =
    leagueData.matches
      ?.matches || [];

  const lastMatches =
    leagueData.lastMatches ||
    matches.filter(
      (match) =>
        match.status ===
          "FINISHED" &&
        match.matchday ===
          leagueData.lastMatchday
    );

  const liveMatches =
    leagueData.liveMatches ||
    matches.filter(
      isLive
    );

  const nextMatches =
    leagueData.nextMatches ||
    matches.filter(
      (match) =>
        [
          "TIMED",
          "SCHEDULED",
        ].includes(
          match.status
        ) &&
        match.matchday ===
          leagueData.nextMatchday
    );

  const standings =
    leagueData.standings
      ?.standings || [];

  const scorers =
    leagueData.scorers
      ?.scorers || [];

  const selectedDetail =
    selectedMatch
      ? data.matchDetails?.[
          String(
            selectedMatch.id
          )
        ] || null
      : null;

  const selectedPitchData =
    selectedMatch
      ? data.pitchEvents?.[
          String(
            selectedMatch.id
          )
        ] || null
      : null;

  function changeLeague(
    code
  ) {
    setLeagueCode(code);
    setSelectedMatch(null);
    scrollTop();
  }

  function changeTab(key) {
    setTab(key);
    setSelectedMatch(null);
    scrollTop();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              setSelectedMatch(
                null
              );

              setTab(
                "matches"
              );
            }}
            className="flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-xl">
              ⚽
            </div>

            <div className="text-left">
              <div className="text-lg font-black">
                Fútbol
              </div>

              <div className="text-[10px] text-slate-500">
                Resultados y estadísticas
              </div>
            </div>
          </button>

          <button
            onClick={
              loadData
            }
            className="rounded-xl border border-slate-200 p-2 text-slate-600"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 pb-28">
        {selectedMatch ? (
          <MatchDetail
            match={
              selectedMatch
            }
            detail={
              selectedDetail
            }
            pitchData={
              selectedPitchData
            }
            onBack={() => {
              setSelectedMatch(
                null
              );

              scrollTop();
            }}
          />
        ) : (
          <>
            <section className="mb-5 rounded-3xl bg-gradient-to-br from-emerald-700 to-green-950 p-5 text-white shadow-lg">
              <div className="text-xs font-black uppercase tracking-widest text-emerald-200">
                Europa
              </div>

              <h1 className="mt-1 text-3xl font-black">
                El fútbol, al día.
              </h1>

              <p className="mt-2 text-sm text-emerald-100">
                España, Inglaterra, Italia y Francia.
              </p>
            </section>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {LEAGUES.map(
                (item) => (
                  <button
                    key={
                      item.code
                    }
                    onClick={() =>
                      changeLeague(
                        item.code
                      )
                    }
                    className={`flex-shrink-0 rounded-2xl px-4 py-3 text-left ${
                      leagueCode ===
                      item.code
                        ? "bg-emerald-700 text-white"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    <div className="text-lg">
                      {
                        item.flag
                      }
                    </div>

                    <div className="text-xs font-black">
                      {
                        item.name
                      }
                    </div>

                    <div
                      className={`text-[9px] ${
                        leagueCode ===
                        item.code
                          ? "text-emerald-100"
                          : "text-slate-400"
                      }`}
                    >
                      {
                        item.country
                      }
                    </div>
                  </button>
                )
              )}
            </div>

            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase text-emerald-700">
                  {league?.country}
                </p>

                <h2 className="text-2xl font-black">
                  {league?.name}
                </h2>
              </div>

              {data.updatedAt && (
                <div className="text-right text-[9px] text-slate-400">
                  Actualizado
                  <br />

                  {new Date(
                    data.updatedAt
                  ).toLocaleString(
                    "es-ES"
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">
                Cargando datos...
              </div>
            ) : error ? (
              <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
                {error}
              </div>
            ) : tab ===
              "matches" ? (
              <MatchesView
                lastMatches={
                  lastMatches
                }
                liveMatches={
                  liveMatches
                }
                nextMatches={
                  nextMatches
                }
                lastMatchday={
                  leagueData
                    .lastMatchday
                }
                nextMatchday={
                  leagueData
                    .nextMatchday
                }
                onOpen={
                  setSelectedMatch
                }
              />
            ) : tab ===
              "standings" ? (
              <StandingsView
                standings={
                  standings
                }
              />
            ) : (
              <StatisticsView
                scorers={
                  scorers
                }
              />
            )}
          </>
        )}
      </main>

      {!selectedMatch && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-2 pt-2 backdrop-blur"
          style={{
            paddingBottom:
              "calc(0.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {TABS.map(
            ({
              key,
              label,
              icon: Icon,
            }) => (
              <button
                key={key}
                onClick={() =>
                  changeTab(
                    key
                  )
                }
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${
                  tab === key
                    ? "bg-slate-950 text-white"
                    : "text-slate-500"
                }`}
              >
                <Icon
                  size={18}
                />

                {label}
              </button>
            )
          )}
        </nav>
      )}
    </div>
  );
}
