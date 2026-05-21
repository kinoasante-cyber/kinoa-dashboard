# Kinoa Dashboard — Documentation projet

## URLs

| Environnement | URL |
|---|---|
| Production (dashboard clinique) | https://kinoa-dashboard.netlify.app |
| Dashboard admin (mère) | https://kinoa-dashboard.netlify.app/admin |
| Dashboard par clinique | https://kinoa-dashboard.netlify.app/?clinique=NomClinique |
| Google Apps Script (API) | https://script.google.com/macros/s/AKfycbzUIUfcbiXw6NRtNkUiVG58Xge9Vt2gwwn4vqur0juE3J1RTSjBOMi7c-Bel5Uyjuk/exec |

## Variables d'environnement

Définies dans `.env` (local) **et** dans Netlify via `netlify env:set`.

| Variable | Valeur |
|---|---|
| `VITE_GAS_URL` | https://script.google.com/macros/s/AKfycbzUIUfcbiXw6NRtNkUiVG58Xge9Vt2gwwn4vqur0juE3J1RTSjBOMi7c-Bel5Uyjuk/exec |
| `VITE_API_TOKEN` | `KNS_xK9m2pQ7vR4wL8` |
| `VITE_CLINIQUE` | `OrthèseGo` |

Pour mettre à jour une variable dans Netlify :
```
netlify env:set NOM_VARIABLE "valeur"
```

## Authentification admin

- **URL** : `/admin`
- **Mot de passe** : `KINOA_ADMIN_2026`
- **Stockage** : `localStorage` — clé `kinoa_admin_auth`, valeur `"1"`

## Stack technique

| Outil | Version |
|---|---|
| React | 19 |
| Vite | 8 |
| React Router DOM | 6 |
| CSS | Plain CSS, variables CSS, pas de UI library |
| Police | Google Fonts — Sora |
| Hébergement | Netlify |

**Tokens de marque :**
- Orange : `#E8470A`
- Navy : `#1A2340`
- Fond : `#EEF0F8`

**Statuts patients :** `ROUGE` (critique) · `JAUNE` (surveillance) · `VERT` (ok)

## API Google Apps Script

Tous les hooks appellent `VITE_GAS_URL` avec `?token=VITE_API_TOKEN` en paramètre obligatoire.

| Paramètre | Effet |
|---|---|
| `?token=...` | Authentification (obligatoire) |
| `?clinique=NomClinique` | Filtre les patients par clinique |
| _(aucun clinique)_ | Retourne tous les patients (toutes cliniques) |
| `?type=cliniques` | Retourne la liste des cliniques actives depuis l'onglet Cliniques |

En développement local, Vite proxie les requêtes via `/api/gas` pour contourner le problème CORS des redirections Google.

## Structure des fichiers clés

```
src/
├── App.jsx                      # Dashboard clinique (route /)
├── App.css                      # Styles globaux
├── main.jsx                     # Entry point — BrowserRouter + Routes
├── data/
│   └── patients.js              # Constante STATUTS (ROUGE/JAUNE/VERT)
├── hooks/
│   ├── usePatients.js           # Fetch patients filtrés par clinique (?clinique=)
│   ├── useAllPatients.js        # Fetch tous les patients (sans filtre clinique)
│   └── useCliniques.js          # Fetch liste des cliniques (?type=cliniques)
├── components/
│   ├── StatCard.jsx             # Carte de statistique
│   ├── StatusBadge.jsx          # Badge coloré ROUGE/JAUNE/VERT
│   ├── AdherenceBar.jsx         # Barre de progression adhérence
│   ├── PatientRow.jsx           # Ligne du tableau patients
│   └── PatientModal.jsx         # Modal détail patient
└── pages/
    ├── AdminPage.jsx            # Dashboard mère Kinoa (route /admin)
    └── AdminPage.css            # Styles page admin

public/
└── _redirects                   # Règle Netlify : /* → /index.html 200
```

## Routes

| Route | Composant | Description |
|---|---|---|
| `/` | `App.jsx` | Dashboard clinique OrthèseGo |
| `/admin` | `AdminPage.jsx` | Dashboard mère Kinoa (protégé par mot de passe) |

## Commandes de déploiement

```bash
# Développement local
npm run dev

# Build de production (utilise le .env local)
npm run build

# Déployer le dist local sur Netlify
netlify deploy --prod --dir=dist

# Build + deploy en utilisant les variables Netlify (recommandé)
netlify deploy --prod

# Vérifier les variables d'env Netlify
netlify env:list
```

> `--build` est le comportement par défaut de `netlify deploy` — il est inutile de le préciser.
