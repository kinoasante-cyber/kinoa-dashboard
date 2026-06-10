import { useState } from 'react';
import './IntakePage.css';

const INTAKE_URL = 'https://script.google.com/macros/s/AKfycbzNk_8hCbTpOqDTXTHSFMEsvyPvQKZxuHVO0BazoISllCtaNvqbjh40vTFMKXV41rDQ/exec';
const TOKEN = import.meta.env.VITE_API_TOKEN;

const CLINICIENS = ['Dr. Martin', 'Dr. Tremblay', 'Dr. Bouchard'];
const TYPES_ORTHESE = ['Genou Valgus', 'Genou Varus', 'Cheville', 'Autre'];
const COTES = ['Gauche', 'Droit', 'Bilatéral'];

const EMPTY_FORM = {
  prenom: '', nom: '', telephone: '', email: '',
  clinicien: '', typeOrthese: '', cote: '', dateLivraison: '', notes: '',
};

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function Footer() {
  return (
    <p className="intake-footer">
      🔒 Données sécurisées SSL · ✓ Conformité HIPAA / Santé · © 2024 Kinoa Santé. Formulaire confidentiel.
    </p>
  );
}

export default function IntakePage({ clinique }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(INTAKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ token: TOKEN, action: 'intake', clinique: clinique ?? '', ...form }),
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Impossible de joindre le serveur.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="intake-page">
        <div className="intake-card intake-card--success">
          <div className="intake-success-icon">✓</div>
          <h2 className="intake-success-title">Patient enregistré avec succès ✓</h2>
          <p className="intake-success-sub">Les informations ont été transmises à la clinique.</p>
          <button type="button" className="intake-submit-btn intake-submit-btn--auto" onClick={() => { setForm(EMPTY_FORM); setStatus('idle'); }}>
            Nouveau patient
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="intake-page">
      <div className="intake-card">
        <header className="intake-header">
          <h1 className="intake-logo">🏥 Kinoa Santé</h1>
          <p className="intake-partner">En partenariat avec <strong>{clinique ?? 'votre clinique'}</strong></p>
          <p className="intake-form-title">Formulaire d'admission clinique</p>
        </header>

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="intake-row">
            <div className="intake-field">
              <label htmlFor="prenom">Prénom *</label>
              <input id="prenom" required value={form.prenom} onChange={e => handleChange('prenom', e.target.value)} />
            </div>
            <div className="intake-field">
              <label htmlFor="nom">Nom *</label>
              <input id="nom" required value={form.nom} onChange={e => handleChange('nom', e.target.value)} />
            </div>
          </div>

          <div className="intake-row">
            <div className="intake-field">
              <label htmlFor="telephone">Téléphone *</label>
              <input
                id="telephone"
                required
                type="tel"
                placeholder="(555) 000-0000"
                pattern="\(\d{3}\) \d{3}-\d{4}"
                value={form.telephone}
                onChange={e => handleChange('telephone', formatPhone(e.target.value))}
              />
            </div>
            <div className="intake-field">
              <label htmlFor="email">Email *</label>
              <input id="email" required type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
          </div>

          <div className="intake-field">
            <label htmlFor="clinicien">Clinicien responsable *</label>
            <select id="clinicien" required value={form.clinicien} onChange={e => handleChange('clinicien', e.target.value)}>
              <option value="" disabled>Sélectionnez un clinicien</option>
              {CLINICIENS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="intake-row">
            <div className="intake-field">
              <label htmlFor="typeOrthese">Type d'orthèse *</label>
              <select id="typeOrthese" required value={form.typeOrthese} onChange={e => handleChange('typeOrthese', e.target.value)}>
                <option value="" disabled>Sélectionnez un type</option>
                {TYPES_ORTHESE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="intake-field">
              <label htmlFor="cote">Côté *</label>
              <select id="cote" required value={form.cote} onChange={e => handleChange('cote', e.target.value)}>
                <option value="" disabled>Sélectionnez un côté</option>
                {COTES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="intake-field">
            <label htmlFor="dateLivraison">Date de livraison *</label>
            <input id="dateLivraison" required type="date" value={form.dateLivraison} onChange={e => handleChange('dateLivraison', e.target.value)} />
          </div>

          <div className="intake-field">
            <label htmlFor="notes">Notes initiales</label>
            <textarea id="notes" rows="4" placeholder="Observations post-livraison..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
          </div>

          {status === 'error' && <p className="intake-error">{errorMsg}</p>}

          <button type="submit" className="intake-submit-btn" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Enregistrement...' : 'Enregistrer le patient'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
