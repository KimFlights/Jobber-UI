import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

/**
 * Edits the `X-User-Sub` sent with every request. Stands in for a logged-in identity until the
 * backend's deferred Cognito auth exists. Persisted via UserContext (localStorage).
 */
export function IdentityWidget() {
  const { sub, setSub } = useUser();
  const [draft, setDraft] = useState(sub);

  // Keep the field in sync if the sub changes elsewhere.
  useEffect(() => setDraft(sub), [sub]);

  const dirty = draft.trim() !== sub;

  return (
    <form
      className="identity"
      onSubmit={(e) => {
        e.preventDefault();
        setSub(draft);
      }}
      title="Sent as the X-User-Sub header on every request"
    >
      <span className="identity__label">User</span>
      <input
        className="identity__input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        aria-label="X-User-Sub identity"
      />
      <button className="identity__apply" type="submit" disabled={!dirty}>
        {dirty ? "Set" : "✓"}
      </button>
    </form>
  );
}
