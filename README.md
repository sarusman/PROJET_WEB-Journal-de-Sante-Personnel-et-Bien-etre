# Projet : Journal de Santé Personnel et Bien-être

Un outil intuitif pour suivre vos habitudes de santé et de bien-être quotidiennes et visualiser vos progrès.

---
Projet 3 : Journal de Santé Personnel et Bien-être
Objectif
Aider les utilisateurs à suivre leurs habitudes santé et bien-être au quotidien (sommeil,
humeur, alimentation, activité).
Authentification
• Microsoft OAuth
• Affichage des infos dans l’en-tête
Fonctionnalités principales
• Journal quotidien :
- Sommeil (heures de coucher/lever, qualité)
- Humeur (score ou emojis)
- Activité physique (durée, type)
- Alimentation (libre ou photo)
• Graphiques de suivi :
- Qualité du sommeil / humeur sur la semaine
- Corrélation entre activité physique et humeur
• Historique complet et filtres temporels
• Ajout rapide via un widget (mobile-friendly)
Bonus
• Suggestions personnalisées: "Tu dors mieux quand tu fais du sport le soir"
• Export ou synchronisation avec Google Fit / Apple Health
• Possibilité de partager un rapport avec un médecin

---

## Installation

Pour lancer le projet en local :

```bash
npm install
````

## Lancer en Développement

```bash
npm run serve
```

## Build pour la Production

```bash
npm run build
```

## Lint

```bash
npm run lint
```

-----

## Backend

Le backend est développé avec **Flask (Python)** et hébergé sur **PythonAnywhere** (un service d'hébergement gratuit) à l'adresse suivante : [webprojetsaru.pythonanywhere.com](https://www.google.com/search?q=http://webprojetsaru.pythonanywhere.com).

Les données sont gérées sous forme de fichier JSON via cette API.

### Routes de l'API

  * **`GET /entries/<email>`**

      * Récupère toutes les entrées du journal pour un utilisateur spécifique.
      * `@app.route('/entries/<email>', methods=['GET'])`

  * **`POST /entries/<email>`**

      * Ajoute une nouvelle entrée au journal pour un utilisateur.
      * `@app.route('/entries/<email>', methods=['POST'])`

-----

## Captures d'écran

### Accueil (/)

  * Connexion utilisateur
  * Bouton "📝 Nouvelle entrée"
  * Résumé de la journée (sommeil, humeur, activité, nutrition)
  * Liste des 5 dernières entrées
<img width="1283" height="606" alt="Capture d’écran 2025-07-10 à 22 16 28" src="https://github.com/user-attachments/assets/ba06cbba-ce25-4d3a-8fba-63591ba8c6bf" />

-----
Page de Connexion (/)
    La page d'accueil avec l'option de connexion.
<img width="516" height="721" alt="Capture d’écran 2025-07-10 à 22 18 12" src="https://github.com/user-attachments/assets/bc147be0-b7a2-4e1e-b575-8f73f88c8f12" />


-----

### Statistiques (/health-charts)

  * Filtres par période : 7 jours, 30 jours, 90 jours, tout
  * Graphiques : Sommeil (barres), Activité (barres), Humeur (ligne)
  * Synthèse combinée des données
<img width="1287" height="617" alt="Capture d’écran 2025-07-10 à 22 16 43" src="https://github.com/user-attachments/assets/1aae5aeb-2849-4708-b519-a37a1df6547e" />

-----

### Historique (/history)

  * Liste complète des entrées journalières
  * Visualisation des données enregistrées
<img width="1236" height="643" alt="Capture d’écran 2025-07-10 à 22 17 12" src="https://github.com/user-attachments/assets/31a47664-34e7-42eb-be75-d40dbe1cfefc" />

```
```
