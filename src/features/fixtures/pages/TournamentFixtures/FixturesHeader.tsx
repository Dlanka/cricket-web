import { Button } from "@/components/ui/button/Button";
import { PageHeader } from "@/shared/components/page/PageHeader";

type Props = {
  canGenerate: boolean;
  isGenerateDisabled?: boolean;
  isGenerating: boolean;
  errorMessage?: string | null;
  onGenerate: () => void;
};

export const FixturesHeader = ({
  canGenerate,
  isGenerateDisabled,
  isGenerating,
  errorMessage,
  onGenerate,
}: Props) => (
  <div className="space-y-3">
    <PageHeader
      eyebrow="Fixtures"
      title="Tournament fixtures"
      description="Track scheduled matches by stage."
      actions={
        canGenerate && !isGenerateDisabled ? (
          <Button
            type="button"
            appearance="filled"
            color="primary"
            size="md"
            disabled={isGenerating || isGenerateDisabled}
            onClick={onGenerate}
          >
            {isGenerating ? "Generating..." : "Generate fixtures"}
          </Button>
        ) : null
      }
    />
    {errorMessage ? (
      <div className="rounded-2xl border border-error-80 bg-error-95 px-4 py-3 text-sm text-error-40">
        {errorMessage}
      </div>
    ) : null}
  </div>
);
