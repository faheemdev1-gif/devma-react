# Devma — React website

A complete React + Vite frontend for devma.it. No Sites hosting dependency, API keys or environment variables are required to build it.

## Run locally

Use Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Production check:

```sh
npm run build
npm run preview
```

## Deploy on Vercel

1. Unzip this project.
2. Upload the contents of the `devma-react` folder to a GitHub repository. `package.json`, `index.html` and `src/` must be at the repository root. Include `.gitignore`.
3. Import that repository into Vercel.
4. Select **Vite**. Build command: `npm run build`. Output directory: `dist`. Select Node.js 22.x or newer.
5. Deploy. No environment variables are needed.
6. Add `devma.it` in the Vercel project's Domains settings and apply the exact DNS records Vercel supplies at your domain provider.

If you upload the enclosing folder instead, set the Vercel Root Directory to `devma-react`.

## Included services

- Websites, online shops and booking journeys.
- Web apps and mobile apps.
- AI chatbots and customer support assistants.
- RAG systems: search and answers grounded in company documents, with references.
- AI automation: enquiry classification, draft responses and connected workflows, with human checks.
- Business workflow automation.
- IoT automation: devices, sensors and alerts.
- Blockchain systems: verifiable records, digital ownership and smart contracts.

These are descriptions of services Devma offers. The frontend does not itself run an AI model, RAG engine, chatbot backend, device platform or blockchain network.

## Interactions

Animated canvas artwork, interactive service explanations, portfolio dialogs, responsive mobile navigation, package selection, live pricing, page count and add-ons, copy/download brief, email-draft enquiry flow, brief downloads and FAQ disclosures.

## Before accepting real enquiries

Contact details: **faheem@devma.it** and **+39 348 845 4242**. Clickable email and phone links are included. The enquiry form opens the visitor’s email app with a prefilled draft to faheem@devma.it; they must review and press Send. A download option is also available. There is no server-side email sending or lead database. A configured email app is required for the draft flow. Never put secret email/API credentials into client-side code.

Pricing is proposed, non-binding project pricing: Launch €490 / Business €990 / Shop €1,790. Additional pages €90, writing support €180, second language €220 and booking integration €150. Confirm your actual prices, scope and tax wording before launch.

The final business identity and full privacy notice need completing; the supplied contact details are included. Fonts load from Google Fonts. No analytics or advertising scripts are included.

Portfolio visuals are presentation mock-ups. The hospitality item is explicitly labelled as a design concept. Review project descriptions and permissions before using them publicly.

## Editing

- `src/App.jsx`: website markup and copy.
- `src/styles.css`: responsive visual design.
- `src/interactions.js`: interactive service copy, project details, estimator logic, brief generation and canvas animation.
- `index.html`: page title, description and favicon.

`npm run build` creates the production `dist/` folder. Do not commit `node_modules/`.


## Version 1.1 — scrolling and project information update

- Removed the continuous canvas renderer (6,240 polygons built and sorted per animation frame).
- Replaced it with a pre-rendered local SVG image and lightweight CSS transform motion.
- Native scrolling: no smooth-scroll override, wheel listener or automatic scrolling when service choices change.
- Decorative animation pauses outside the viewport and when the document is hidden. Reduced-motion preferences disable it.
- Seven detailed service guides explain use cases, deliverables, customer inputs, scoping and a sensible first version.
- Added package inclusions, extra-cost explanations, delivery expectations and post-launch support information.
- Added a React project starter for every service, with a live summary, optional preferences, downloadable brief and prefilled email draft.
- Email and phone remain faheem@devma.it and +39 348 845 4242.

## Update your existing GitHub/Vercel project

Copy the contents of this `devma-react` folder into your existing local project directory, replacing matching files and adding the new files. Preserve your existing `.git` folder. Do not create a nested `devma-react/devma-react` directory.

The new `public/devma-loop.svg` asset and the new components in `src/` must be included.

```sh
npm ci
npm run build
git add .
git commit -m "Improve scrolling performance and expand project information"
git push
```

If your Vercel project is connected to that production branch, this push uses the existing deployment setup. No DNS changes or environment variables are required by this update. The ZIP itself does not modify your live site.

## Validation notes

The production build and browser checks cover the service guide, service-to-planner handoff, reactive project summary, brief download, estimator and package detail disclosures. Browser inspection confirms native scrolling, no canvas and offscreen motion pausing. A 390px embedded viewport check covers mobile menu navigation, service selection, planner handoff and absence of horizontal page overflow. No numeric performance improvement or specific device frame rate is claimed; test the deployed update on your own phone and computer too.
