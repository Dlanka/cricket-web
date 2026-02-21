import { Card } from "@/shared/components/card/Card";
import { Button } from "@/components/ui/button/Button";

export const ScoringControls = () => (
  <Card>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
      Controls
    </p>
    <p className="mt-2 text-sm text-neutral-40">Scoring controls coming next.</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <Button type="button" size="sm" disabled>
        +1 Run
      </Button>
      <Button type="button" size="sm" disabled>
        +4 Runs
      </Button>
      <Button type="button" size="sm" disabled>
        Wicket
      </Button>
    </div>
  </Card>
);
