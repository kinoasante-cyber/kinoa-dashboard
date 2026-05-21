import { useState, useEffect, useCallback } from 'react';

const GAS_BASE = import.meta.env.VITE_GAS_URL;

const params = new URLSearchParams({ token: import.meta.env.VITE_API_TOKEN });

const API_URL = import.meta.env.DEV
  ? `/api/gas?${params}`
  : `${GAS_BASE}?${params}`;

export function useAllPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status} — ${res.statusText}`);
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : (data.patients ?? data.users ?? data.data ?? []);
      if (!Array.isArray(list)) throw new Error('Format de réponse inattendu.');
      if (data.error) throw new Error(data.error);
      setPatients(list.map(p => ({
        ...p,
        statut:      p.statut      ?? p.statut_suivi,
        date_intake: p.date_intake ?? p.created_at,
      })));
    } catch (err) {
      setError(err.message || 'Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  return { patients, loading, error, refetch: fetchPatients };
}
