interface MatchBadgeProps {
  percent: number;
}

/** Colour-graded match score. Reused by JobCard and the Saved list (rating == last match). */
export function MatchBadge({ percent }: MatchBadgeProps) {
  const tone = percent >= 70 ? "high" : percent >= 40 ? "mid" : "low";
  return (
    <span className={`match match--${tone}`} title="Cosine match against your résumé">
      {percent}
      <small>% match</small>
    </span>
  );
}
