import { Button } from "@/components/ui/button/Button";

type Props = {
  canRecompute: boolean;
  showGenerate: boolean;
  canGenerate: boolean;
  isRecomputing: boolean;
  isGenerating: boolean;
  onRecompute: () => void;
  onGenerate: () => void;
};

export const TournamentStandingsActions = ({
  canRecompute,
  showGenerate,
  canGenerate,
  isRecomputing,
  isGenerating,
  onRecompute,
  onGenerate,
}: Props) => (
  <>
    <Button
      type="button"
      appearance="outline"
      color="neutral"
      size="sm"
      disabled={!canRecompute || isRecomputing || isGenerating}
      onClick={onRecompute}
    >
      {isRecomputing ? "Recomputing..." : "Recompute Standings"}
    </Button>
    {showGenerate ? (
      <Button
        type="button"
        size="sm"
        disabled={!canGenerate || isGenerating || isRecomputing}
        onClick={onGenerate}
      >
        {isGenerating ? "Generating..." : "Generate Knockout"}
      </Button>
    ) : null}
  </>
);
