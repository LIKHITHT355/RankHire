import { useCallback, useEffect, useState } from "react";
import { isApiConfigured } from "../services/api.js";

// This small helper runs one backend request for a screen.
// It keeps track of whether we are waiting, what came back,
// and what went wrong, so every screen can show loading,
// empty, error and retry without repeating the same code.
export function useApiData(loader, deps = [], options = {}) {
  const { enabled = true } = options;
  const configured = isApiConfigured();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(configured && enabled);

  // This function actually performs the request.
  // It clears any previous error, waits for the answer,
  // and stores either the data or the failure message.
  const run = useCallback(async () => {
    if (!configured || !enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, enabled, ...deps]);

  // This runs the request once when the screen opens, and again
  // whenever the things it depends on change, such as a filter.
  useEffect(() => {
    run();
  }, [run]);

  return { data, error, loading, configured, reload: run, setData };
}
