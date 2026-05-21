import { useState, useEffect, useCallback } from 'react';

const GAS_URL = import.meta.env.VITE_GAS_URL;
const TOKEN = import.meta.env.VITE_API_TOKEN;

export function useCliniques() {
  const [cliniques, setCliniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCliniques = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ token: TOKEN, type: 'cliniques' });
      const res = await fetch(`${GAS_URL}?${params}`);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const list = Array.isArray(data) ? data : (data.cliniques ?? data.data ?? []);
      const names = list.map(c => typeof c === 'string' ? c : (c.nom ?? c.nom_clinique ?? c.name ?? String(c))).filter(Boolean);
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
