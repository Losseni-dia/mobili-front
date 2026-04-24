# Mobili — Frontend (Angular)

SPA du projet **Mobili**. La vision produit, le backlog, le **suivi des fonctionnalités** et le [CHANGELOG daté](../CHANGELOG.md) sont dans le [**README à la racine**](../README.md) du dépôt — **à tenir à jour** avec chaque livraison.

**Recherche trajets (étape 4)** : comportement API, paramètres `departure`/`arrival`, pages d’accueil et résultats, et liste des fichiers modifiés — voir [**docs/recherche-segments.md**](../docs/recherche-segments.md) à la racine du dépôt.

### Points notables (état récent)

- **Routing** : espaces **Voyageur**, **Partenaire** et **Admin** utilisent des *shells* (`user-shell`, `partner-shell`, `admin-shell`) — voir [`src/app/app.routes.ts`](src/app/app.routes.ts). La page **chauffeur** est à part : `/chauffeur` (`driver-console`).
- **Styles** : design system en Sass — `src/app/styles/_variables.scss`, `_mixins.scss`, `_data-panel.scss` ; entrée globale `src/styles.scss`.
- **Locale** : affichage **français** (`LOCALE_ID`, `registerLocaleData` dans `app.config.ts`).
- **Navigation principale** : le header public pointe en **lien direct** vers les tableaux de bord (pas de sous-menus déroulants pour Admin / Partenaire / profil).

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
