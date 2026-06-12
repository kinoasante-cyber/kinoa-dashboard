import { useState, useEffect, useCallback } from 'react';

const GAS_BASE = import.meta.env.VITE_GAS_URL;
const TOKEN = import.meta.env.VITE_API_TOKEN;

const params = new URLSearchParams({ token: TOKEN });

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
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status} — ${res.statusText}`);
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : (data.patients ?? data.users ?? data.data ?? []);
      if (!Array.isArray(list)) throw new Error('Format de réponse inattendu.');
      if (data.error) throw new Error(data.error);
      setPatients(list.map(p => ({
        ...p,
        statut:          p.statut         ?? p.statut_suivi,
        date_intake:     p.date_intake    ?? p.created_at,
        statut_pipeline: p.statut_pipeline ?? '',
        rowNumber:       p.rowNumber       ?? p._rowNumber,
      })));
    } catch (err) {
      setError(err.message || 'Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  async function updateStatutPipeline(patient, newStatut) {
    const rowNumber = Number(patient.rowNumber);

    try {
      const res = await fetch('/api/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: TOKEN,
          action: 'set_statut_pipeline',
          rowNumber,
          newStatut,
        }),
      });

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status} — ${res.statusText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Mise à jour locale optimiste, une fois la persistance confirmée
      setPatients(prev =>
        prev.map(p => p.id_patient === patient.id_patient
          ? { ...p, statut_pipeline: newStatut }
          : p
        )
      );
    } catch (err) {
      console.error(`Erreur set_statut_pipeline (rowNumber=${rowNumber}, newStatut=${newStatut}):`, err);
    }
  }

  return { patients, loading, error, refetch: fetchPatients, updateStatutPipeline };
}