import { useState, useEffect, useCallback } from 'react';

const GAS_URL = import.meta.env.VITE_GAS_URL;
const TOKEN = import.meta.env.VITE_API_TOKEN;

export function usePatients(clinique) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ token: TOKEN, type: 'patients' });
      if (clinique) params.append('clinique', clinique);
      const res = await fetch(`${GAS_URL}?${params}`);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const list = Array.isArray(data) ? data : (data.patients ?? data.data ?? []);
      setPatients(list.map(p => ({ ...p, statut: p.statut ?? p.statut_suivi, date_intake: p.date_intake ?? p.created_at })));
    } catch (err) {
      setError(err.message || 'Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  }, [clinique]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);
  return { patients, loading, error, refetch: fetchPatients };
}
