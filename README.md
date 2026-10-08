# Safar

**A collaborative travel and booking platform with client, partner and admin interfaces.**

[Public website](https://safar-safar4.vercel.app) · [Rayan Terki's portfolio](https://rayantr06.github.io/Portfolio-/#safar)

![Safar public interface](https://rayantr06.github.io/Portfolio-/project-images/safar-interface.png)

## My contributions

Rayan Terki contributes software development, including authentication routes and fixes to partner booking rendering. This is a collaborative project.

## Technologies

Next.js, React, TypeScript and Tailwind CSS. The application includes Supabase client integration; database migrations are stored separately in this repository.

## Repository structure

| Path | Purpose |
| --- | --- |
| `web/` | Next.js application, routes and tests. |
| `safar-design-system/` | Design tokens, components and visual assets. |
| `desktop/` and `mobile/` | Interface mockups. |
| `supabase/migrations/` | Database migrations. |

## Local development

Use a Node.js version compatible with the Next.js version recorded in `web/package.json`.

```sh
git clone https://github.com/rayantr06/safar.git
cd safar/web
npm ci
npm run dev
```

Open the local address reported by Next.js. Features connected to backend services require an authorized development configuration. Keep local credentials and real user data outside Git.

## Checks

From `web/`:

```sh
npm run lint
npm test
npm run build
```

These scripts are defined in `web/package.json`. This documentation update does not claim that they have been executed or that all workflows are production-ready.
