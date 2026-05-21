# Kinoa Dashboard — Documentation projet

## Identité du projet

- **Repo GitHub** : `kinoasante-cyber/kinoa-dashboard`
- **Hébergement** : Vercel
- **Compte** : kinoa.sante@gmail.com

## URLs

| Environnement | URL |
|---|---|
| Production (vue globale) | https://kinoa-dashboard.vercel.app |
| Dashboard admin (mère) | https://kinoa-dashboard.vercel.app/admin |
| Dashboard par clinique | https://kinoa-dashboard.vercel.app/?clinique=NomClinique |
| Vue cliniques (home) | https://kinoa-dashboard.vercel.app/?view=cliniques |
| Google Apps Script (API) | https://script.google.com/macros/s/AKfycbzUIUfcbiXw6NRtNkUiVG58Xge9Vt2gwwn4vqur0juE3J1RTSjBOMi7c-Bel5Uyjuk/exec |

## Cliniques actives

| Nom | URL dédiée |
|---|---|
| OrthèseGo | `/?clinique=OrthèseGo` |
| MonOrthesiste | `/?clinique=MonOrthesiste` |

## Variables d'environnement

Définies dans `.env` (local) **et** dans Vercel via `npx vercel env add`.

| Variable | Valeur |
|---|---|
| `VITE_GAS_URL` | URL complète du GAS (ou `/api/gas` en dev local pour passer par le proxy Vite) |
| `VITE_API_TOKEN` | `KNS_xK9m2pQ7vR4wL8` |
| `VITE_CLINIQUE` | `OrthèseGo` (clinique par défaut, non utilisée activement dans le code) |

```bash
# Lister les variables Vercel
npx vercel env ls

# Ajouter / modifier une variable
npx vercel env add NOM_VARIABLE
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
| React Router DOM | 7 |
| CSS | Plain CSS, variables CSS, pas de UI library |
| Police | Google Fonts — Sora |
| Langage | JavaScript (JSX) — pas TypeScript |
| Hébergement | Vercel |

**Tokens de marque :**
- Orange : `#E8470A`
- Navy : `#1A2340`
- Fond : `#EEF0F8`

**Statuts patients :** `ROUGE` (critique) · `JAUNE` (surveillance) · `VERT` (ok)

## API Google Apps Script

Tous les hooks appellent `VITE_GAS_URL` avec `?token=VITE_API_TOKEN` en paramètre obligatoire.

| Paramètre | Effet |
|---|---|
| `?token=...&type=patients` | Authentification + fetch patients |
| `?clinique=NomClinique` | Filtre les patients par clinique |
| _(aucun clinique)_ | Retourne tous les patients (toutes cliniques) |
| `?type=cliniques` | Retourne la liste des cliniques actives depuis l'onglet Cliniques |

En développement local, Vite peut proxier les requêtes via `/api/gas` (défini dans `vite.config.js`) pour contourner le CORS des redirections Google. Pour activer : mettre `VITE_GAS_URL=/api/gas` dans `.env.local`.

### Champs retournés par l'API (objet patient)

```js
{
  id_patient, prenom, nom,
  telephone, email,
  statut,           // ROUGE | JAUNE | VERT (alias: statut_suivi)
  nom_clinique,     // alias: clinique, clinic
  date_intake,      // alias: created_at
  date_livraison,
  flag_risque,
  prochaine_action,
  score_j7, score_j15, score_j30, score_moyen,
  notes,
  adherence,        // 0–100
  diagnostic,
  orthotiste,
  derniereVisite,
  prochaineVisite,
  ddn,              // date de naissance
}
```

## État actuel des fonctionnalités

### Implémenté et déployé

| Feature | Fichier | Description |
|---|---|---|
| Vue Patients | `App.jsx` → `DashboardView` | Tableau tri/filtre/recherche, stats, skeleton loader |
| Vue Cliniques | `App.jsx` → `CliniquesView` | Grille de cards par clinique avec URL copiable |
| Sidebar navigation | Dans `App.jsx` et `AdminPage.jsx` | Patients / Cliniques / Agenda (stub) / Rapports (stub) |
| Fiche patient (modal) | `components/PatientModal.jsx` | Panel latéral : contact, suivi, scores J7/J15/J30, notes |
| Dashboard admin | `pages/AdminPage.jsx` | Vue mère : stats globales + cards par clinique + détail |
| Authentification admin | `pages/AdminPage.jsx` | Mot de passe localStorage |
| URLs partageables | `App.jsx` `ClinicStatCard` | Copie du lien `/?clinique=...` en un clic |

### Stubs (liens présents, pages non implémentées)

- Agenda (`/agenda`)
- Rapports (`/rapports`)
- Alertes (`/alertes`)

## Structure des fichiers clés

```
src/
├── App.jsx                      # Route / : DashboardView + CliniquesView
├── App.css                      # Styles globaux (toutes les classes)
├── main.jsx                     # Entry point — BrowserRouter + Routes
├── data/
│   └── patients.js              # Constante STATUTS (ROUGE/JAUNE/VERT) avec couleurs
├── hooks/
│   ├── usePatients.js           # Fetch patients filtrés par clinique (?clinique=)
│   ├── useAllPatients.js        # Fetch tous les patients (sans filtre clinique)
│   └── useCliniques.js          # Fetch liste des cliniques (?type=cliniques)
├── components/
│   ├── StatCard.jsx             # Carte de statistique (label, value, sub, icon, accent)
│   ├── StatusBadge.jsx          # Badge coloré ROUGE/JAUNE/VERT
│   ├── AdherenceBar.jsx         # Barre de progression adhérence
│   ├── PatientRow.jsx           # Ligne du tableau patients
│   └── PatientModal.jsx         # Panel latéral détail patient
└── pages/
    ├── AdminPage.jsx            # Dashboard mère Kinoa (route /admin)
    └── AdminPage.css            # Styles page admin

vite.config.js                   # Plugin gasProxy pour dev local (CORS)
```

## Routes

| Route | Composant | Description |
|---|---|---|
| `/` | `App.jsx` → `DashboardView` | Tous les patients (sans filtre) |
| `/?clinique=NomClinique` | `App.jsx` → `DashboardView` | Patients d'une clinique |
| `/?view=cliniques` | `App.jsx` → `CliniquesView` | Grille des cliniques |
| `/admin` | `AdminPage.jsx` | Dashboard mère (protégé mot de passe) |

## Prochaines étapes

| Priorité | Feature | Notes |
|---|---|---|
| 1 | Connexion données réelles | Brancher sur la vraie feuille Google Sheets (remplacer données mock si présentes) |
| 2 | Fiche patient enrichie | Ajouter historique des visites, graphique adhérence dans `PatientModal` |
| 3 | DNS clinique | Configurer `clinique.kinoa.ca` → Vercel (domaine personnalisé par clinique) |
| 4 | Pages Agenda / Rapports / Alertes | Implémenter les stubs de navigation |

## Commandes de déploiement

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Déployer en preview Vercel
npx vercel

# Déployer en production Vercel
npx vercel --prod --yes

# Vérifier les variables d'env Vercel
npx vercel env ls
```
