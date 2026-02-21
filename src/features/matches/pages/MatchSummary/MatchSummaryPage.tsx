import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { MatchSummarySection } from "./components/MatchSummarySection";

type MatchSummaryPageProps = {
  matchId: string;
  tournamentId: string;
};

export const MatchSummaryPage = ({
  matchId,
  tournamentId,
}: MatchSummaryPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6">
      <PageHeader
        eyebrow="Match"
        title="Summary"
        description="Full innings, batting, bowling, and result details."
        backButton={{
          onClick: () =>
            navigate({
              to: "/tournaments/$tournamentId/fixtures",
              params: { tournamentId },
            }),
          ariaLabel: "Back to fixtures",
        }}
      />

      <MatchSummarySection matchId={matchId} />
    </div>
  );
};
