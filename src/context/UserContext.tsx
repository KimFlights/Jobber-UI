import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Auth is deferred in the backend (Cognito is an AWS-deployment decision). Until it exists, the
// gateway is a pass-through and every request must carry an `X-User-Sub` identifying the caller.
// We let the user type that value here and persist it, standing in for a logged-in Cognito `sub`.

const STORAGE_KEY = "jobber.userSub";
const DEFAULT_SUB = "demo-user";

interface UserContextValue {
  sub: string;
  setSub: (sub: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [sub, setSubState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_SUB,
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, sub);
  }, [sub]);

  const value = useMemo<UserContextValue>(
    () => ({ sub, setSub: (next) => setSubState(next.trim() || DEFAULT_SUB) }),
    [sub],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
