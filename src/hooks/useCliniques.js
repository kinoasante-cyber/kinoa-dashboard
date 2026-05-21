import { useState, useEffect, useCallback } from 'react';

const GAS_BASE = import.meta.env.VITE_GAS_URL;

const params = new URLSearchParams({
  token: import.meta.env.VITE_API_TOKEN,
  type: 'cliniques',
});

const API_URL = import.meta.env.DEV
  ? `/api/gas?${params}`
  : `${GAS_BASE}?${params}`;

export function useCliniques() {
  const [cliniques, setCliniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCliniques = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status} — ${res.statusText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const list = Array.isArray(data)
        ? data
        : (data.cliniques ?? data.data ?? []);
      if (!Array.isArray(list)) throw new Error('Format de réponse inattendu.');
      // Normalize: accept array of strings or array of objects with nom/nom_clinique/name
      const names = list.map(c =>
        typeof c === 'string' ? c : (c.nom ?? c.nom_clinique ?? c.name ?? String(c))
      ).filter(Boolean);
      setCliniques(names);
    } catch (err) {
      setError(err.message || 'Impossible de charger les cliniques.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCliniques(); }, [fetchCliniques]);

  return { cliniques, loading, error, refetch: fetchCliniques };
}
