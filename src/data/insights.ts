export type SeasonSnapshot = {
  activeMatches: number
  squads: number
  venues: number
  liveCoverage: string
}

export type Spotlight = {
  label: string
  value: string
  note: string
}

export type PulseMetric = {
  label: string
  value: string
  change: string
}

export const fetchSeasonSnapshot = async (): Promise<SeasonSnapshot> => ({
  activeMatches: 8,
  squads: 24,
  venues: 12,
  liveCoverage: '99.2% uptime',
})

export const fetchSpotlights = async (): Promise<Spotlight[]> => [
  {
    label: 'Pitch readiness',
    value: '92%',
    note: 'Moisture tracking synced across venues.',
  },
  {
    label: 'Logistics load',
    value: '14 moves',
    note: 'Next 72 hours are fully staffed.',
  },
  {
    label: 'Broadcast windows',
    value: '18 slots',
    note: 'Prime-time placement in 6 regions.',
  },
]

export const fetchPulseMetrics = async (): Promise<PulseMetric[]> => [
  {
    label: 'Recovery index',
    value: '87',
    change: '+4.2 this week',
  },
  {
    label: 'Training load',
    value: '63',
    change: '-6.1 vs target',
  },
  {
    label: 'Availability',
    value: '28 players',
    change: 'No new injuries',
  },
]
