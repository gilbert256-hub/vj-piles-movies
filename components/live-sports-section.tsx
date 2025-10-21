import { ChevronRight, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const liveMatches = [
  {
    id: 1,
    sport: "Football",
    league: "UEFA Champions League",
    team1: "Real Madrid",
    team2: "Manchester City",
    team1Logo: "/real-madrid-crest.png",
    team2Logo: "/generic-football-club-badge.png",
    status: "Live",
    time: "45:00",
  },
  {
    id: 2,
    sport: "Football",
    league: "UEFA Champions League",
    team1: "Bayern Munich",
    team2: "Paris Saint-Germain",
    team1Logo: "/football-club-badge.png",
    team2Logo: "/psg-logo-stylized.png",
    status: "Upcoming",
    time: "2h 30m",
  },
  {
    id: 3,
    sport: "Football",
    league: "UEFA Champions League",
    team1: "Barcelona",
    team2: "Liverpool",
    team1Logo: "/barcelona-crest.png",
    team2Logo: "/liverpool-crest.png",
    status: "Upcoming",
    time: "4h 15m",
  },
  {
    id: 4,
    sport: "Football",
    league: "UEFA Champions League",
    team1: "Juventus",
    team2: "Arsenal",
    team1Logo: "/juventus-logo.png",
    team2Logo: "/arsenal-football-club-emblem.png",
    status: "Upcoming",
    time: "6h 00m",
  },
]

export default function LiveSportsSection() {
  return (
    <section className="relative">
      {/* Background Glow Effect */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-secondary/20 rounded-full blur-3xl -z-10" />

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl lg:text-2xl font-bold">⚽ Live Sports</h2>
        <Link
          href="/sports"
          className="flex items-center gap-1 text-muted hover:text-foreground transition-colors group"
        >
          <span className="text-sm lg:text-base font-medium">All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveMatches.map((match) => (
          <Link
            key={match.id}
            href={`/sports/${match.id}`}
            className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #cc3129 25%, #f08028 25%, #f08028 50%, #cc3129 50%, #cc3129 75%, #f08028 75%, #f08028)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative p-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted">{match.league}</span>
                {match.status === "Live" ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/20 rounded-full">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-accent">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{match.time}</span>
                  </div>
                )}
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 relative">
                    <Image
                      src={match.team1Logo || "/placeholder.svg"}
                      alt={match.team1}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs text-center line-clamp-1">{match.team1}</span>
                </div>

                <div className="px-3 text-muted font-semibold">VS</div>

                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 relative">
                    <Image
                      src={match.team2Logo || "/placeholder.svg"}
                      alt={match.team2}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs text-center line-clamp-1">{match.team2}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
