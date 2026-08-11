interface TagListProps {
  items: string[];
  /** Optional click handler — makes each tag a button (e.g. skills/queries → run a search). */
  onSelect?: (value: string) => void;
  emptyText?: string;
}

/** A row of chips. Interactive when `onSelect` is provided. */
export function TagList({ items, onSelect, emptyText }: TagListProps) {
  if (items.length === 0) {
    return emptyText ? <p className="muted">{emptyText}</p> : null;
  }
  return (
    <ul className="tags">
      {items.map((item, i) => (
        <li key={`${item}-${i}`}>
          {onSelect ? (
            <button type="button" className="tag tag--action" onClick={() => onSelect(item)}>
              {item}
            </button>
          ) : (
            <span className="tag">{item}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
