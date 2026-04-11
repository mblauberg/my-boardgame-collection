import { ExpandingSearchInput, type ExpandingSearchInputProps } from "./ExpandingSearchInput";

type ExpandableSearchSectionProps = ExpandingSearchInputProps & {
  sectionClassName?: string;
};

export function ExpandableSearchSection({
  sectionClassName = "mb-8",
  ...inputProps
}: ExpandableSearchSectionProps) {
  return (
    <div className={sectionClassName}>
      <ExpandingSearchInput {...inputProps} />
    </div>
  );
}
