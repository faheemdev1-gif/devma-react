# Devma — Sito React bilingue / Bilingual React website

Versione 1.5.0. Sito completo in italiano e inglese, con scelta automatica della lingua su Vercel in base al Paese della connessione.

## Avvio locale

Usa Node.js 22.12 o successivo.

```sh
npm ci
npm run dev
```

Verifica di produzione:

```sh
npm run build
npm run preview
```

## Aggiornare il progetto esistente

Copia il contenuto della cartella `devma-react` nella cartella del tuo progetto, sostituendo i file corrispondenti e aggiungendo quelli nuovi. Mantieni la cartella `.git` esistente. Non creare una seconda cartella `devma-react` al suo interno.

Includi anche `public/devma-loop.svg`.

```sh
npm ci
npm run build
git add .
git commit -m "Add Italian and English with country-based language routing"
git push
```

Il sito in produzione cambia dopo la distribuzione del nuovo commit. Non occorre modificare il DNS per questo aggiornamento.

## Prima distribuzione su Vercel

1. Inserisci i file nel repository GitHub. `package.json`, `index.html`, `src/`, `public/`, `it/`, `en/` e `vercel.json` devono trovarsi nella cartella principale del progetto.
2. Importa il repository in Vercel.
3. Seleziona Vite. Comando di compilazione: `npm run build`. Cartella di output: `dist`. Node.js: 22.x o successivo.
4. Se il repository contiene una cartella esterna `devma-react`, selezionala come Root Directory.
5. Per i moduli diretti configura le variabili server indicate in `RESEND_SETUP.md`.
6. Per il dominio, aggiungi `devma.it` e `www.devma.it` nelle impostazioni del progetto Vercel e usa i record DNS indicati da Vercel. Mantieni i record email esistenti presso IONOS.

## Contenuti e funzionalità

- Siti web e negozi online.
- Applicazioni web e mobile.
- Chatbot con intelligenza artificiale.
- Sistemi RAG e ricerca nei documenti con riferimenti alle fonti.
- Automazione IA e dei processi aziendali.
- IoT e dispositivi connessi.
- Sistemi blockchain.

Ogni servizio ha una guida con esempi, possibili consegne, informazioni richieste al cliente, criteri di costo e un primo passo consigliato.

Sono inclusi calcolatore dei pacchetti, dettagli espandibili, richiesta di portfolio tramite modulo, guida al progetto, riepilogo interattivo, download dei riepiloghi e invio diretto tramite Resend. Tutti i testi visibili, i messaggi, le descrizioni accessibili, i metadati e i riepiloghi generati sono disponibili in entrambe le lingue. I prezzi numerici sono invariati; gli importi usano il formato della lingua selezionata.

## Contatti e richieste

Email: **faheem@devma.it**. Telefono: **+39 348 845 4242**.

I due moduli inviano le richieste direttamente dal sito tramite una funzione Vercel e Resend, senza aprire la posta del visitatore. Il server usa un mittente verificato e imposta l’email del cliente come Reply-To. La stima del sito viene ricalcolata dal server.

Per attivare l’invio, verifica un dominio mittente in Resend e configura `RESEND_API_KEY`, `RESEND_FROM` e `CONTACT_TO` su Vercel, poi esegui una nuova distribuzione. Consulta **RESEND_SETUP.md** per tutti i passaggi. Non inserire chiavi nella chat, nel codice client o in GitHub. Il file `.env.example` contiene solo esempi.

L’invio riesce solo quando Resend accetta la richiesta. In caso di errore i dati restano nel modulo e viene mostrato un messaggio nella lingua scelta. Le opzioni di download non inviano nulla. Non viene aggiunto un database delle richieste. Dopo l’accettazione della notifica viene tentato l’invio di una conferma automatica al cliente nella lingua scelta. I collegamenti diretti email e telefono restano disponibili.

## Prezzi

Stime orientative: Essenziale 490 €, Professionale 990 €, Negozio 1.790 €. Pagina aggiuntiva 90 €, supporto ai testi 180 €, seconda lingua 220 €, integrazione prenotazioni 150 €. Attività definitive, trattamento fiscale, tempi, revisioni e condizioni vanno concordati nel preventivo.

Dominio, hosting, servizi esterni, commissioni e assistenza continuativa sono separati salvo accordi espliciti. L’identità aziendale e l’informativa privacy definitiva devono essere completate prima della pubblicazione commerciale.

## Prestazioni

Scorrimento nativo, senza gestione personalizzata della rotella o animazioni di scorrimento. La precedente animazione canvas continua è sostituita da un’immagine SVG locale con movimento CSS leggero. Le animazioni decorative si fermano fuori dalla parte visibile o quando la scheda è nascosta; viene rispettata la preferenza per movimento ridotto.

## Lingua automatica / Automatic language selection

Quando un visitatore apre `https://devma.it/`:

| Paese rilevato da Vercel | Destinazione | Lingua |
| --- | --- | --- |
| Italia (`IT`) | `/it/` | Italiano |
| Qualsiasi altro Paese | `/en/` | Inglese |
| Paese non disponibile | `/en/` | Inglese |

La scelta usa l’intestazione geografica `x-vercel-ip-country` aggiunta da Vercel, non la lingua del browser. Non richiede permessi di localizzazione, servizi geografici esterni, chiavi API o cookie. Il Paese stimato dipende dalla connessione: una VPN o un proxy può cambiare il Paese rilevato.

Le regole si trovano in `vercel.json` e si applicano solo all’ingresso `/`. I reindirizzamenti sono temporanei; il percorso iniziale è configurato per non essere memorizzato nella cache. I percorsi espliciti `/it/` e `/en/` restano accessibili da qualsiasi Paese. I pulsanti IT/EN permettono di cambiare lingua e mantengono la sezione corrente. Tornando all’indirizzo principale, la lingua viene nuovamente scelta dal Paese.

**Importante:** inserisci anche le cartelle `it/` e `en/` e il file `vercel.json` nel repository. Senza questi file la selezione automatica non è completa.

Le regole geografiche funzionano dopo la pubblicazione su Vercel. `npm run dev` e `npm run preview` non simulano il Paese: in locale apri `/it/` o `/en/` per controllare le lingue; la pagina `/` usa l’inglese come alternativa.

## English deployment notes

Opening the root URL on Vercel redirects visitors detected in Italy to Italian and all other or unknown countries to English. Detection uses Vercel’s country header, not browser language. VPNs and proxies can affect the detected country. Direct `/it/` and `/en/` links and the IT/EN switch remain available worldwide.

Push the **entire project**, including `vercel.json`, `it/`, `en/`, `src/` and `public/`. Use the existing Vite configuration, build command `npm run build` and output `dist`. Direct form delivery requires the server-only Resend variables documented in RESEND_SETUP.md. Website DNS stays unchanged; verify the Resend sending subdomain using its requested records. Real country detection must be checked on the deployed Vercel site; local Vite previews do not emulate Vercel’s geographic headers.

## Modifiche / Source map

- `src/App.jsx`: caricamento della lingua della pagina / language entry.
- `src/LanguageSwitch.jsx`: selettore IT/EN.
- `src/locales/it/`: contenuti e interazioni in italiano.
- `src/locales/en/`: contenuti e interazioni in inglese.
- `src/styles.css`: grafica condivisa e adattamento agli schermi.
- `it/index.html`, `en/index.html`: lingua, metadati e collegamenti alle versioni alternative.
- `index.html`: pagina inglese di riserva per l’anteprima locale.
- `vite.config.js`: compilazione delle tre pagine di ingresso.
- `vercel.json`: reindirizzamenti in base al Paese e impostazioni di pubblicazione.

Build di produzione verificata. Verifiche locali sui contenuti React di entrambe le lingue, sette servizi, contatti, selettore di lingua e regole geografiche per Italia, altri Paesi e Paese sconosciuto. Il comportamento geografico effettivo richiede la nuova pubblicazione su Vercel.

Riferimento ufficiale: https://vercel.com/docs/project-configuration/vercel-json#redirects-examples

Il portfolio pubblico con nomi, immagini e descrizioni dei progetti è stato sostituito da un invito a richiedere esempi tramite modulo. I servizi IA sono presentati come offerta professionale: il sito non contiene di per sé un motore IA, RAG, piattaforma IoT o rete blockchain.

## Versione 1.3.1

Portfolio disponibile su richiesta. Rimossi i progetti pubblici, le rappresentazioni grafiche e le descrizioni di Al-Burhaniya, eSibha e del concept per la ristorazione. La sezione e i collegamenti di navigazione invitano a scrivere a faheem@devma.it per esempi pertinenti, in entrambe le lingue.

## Versione 1.4.0 — Resend

Nuovi file: `api/contact.js`, `server/enquiry.js`, `src/enquiryClient.js`, `.env.example`, `RESEND_SETUP.md` e `tests/`. Includili tutti nel repository. `npm test` verifica invio simulato, validazione, Reply-To, prezzi ricalcolati, errori e idempotenza senza inviare email reali. La verifica di recapito reale richiede le tue credenziali Resend e una nuova pubblicazione su Vercel.

## Versione 1.5.0 — Un percorso più curato

Conferma email personalizzata, in italiano e inglese, con riferimento DVM e possibilità di rispondere direttamente a Faheem. L’email ringrazia il cliente e conferma che riceverà una risposta, senza promettere tempi non concordati. Le anteprime sono in `email-previews/`.

Il sito include ora un modulo guidato in tre passaggi, una ricevuta con prossimi passi, un calcolatore React con controlli sulle pagine e riepilogo dei prezzi, navigazione fissa con sezione attiva e una presentazione del contatto diretto Faheem. I progetti del portfolio restano rimossi; la richiesta di esempi apre il modulo. Prezzi, sette servizi e selezione della lingua per Paese restano invariati.

L’email al cliente viene tentata soltanto dopo l’accettazione della notifica a Devma. Se la conferma non parte, la richiesta principale resta ricevuta e l’interfaccia lo spiega correttamente. Non viene aggiunta una coda persistente per ritentare le conferme. Le dieci verifiche automatiche coprono entrambi gli invii, la gestione degli errori, la sicurezza dei template e la corrispondenza dei prezzi tra client e server.

Nuovi componenti condivisi: `src/EstimateBuilder.jsx`, `src/pricing.js`, `src/EnquiryReceipt.jsx`, `src/ProjectPartner.jsx`. Per applicare l’aggiornamento copia l’intero progetto, mantieni `.git`, esegui `npm test` e `npm run build`, poi pubblica il commit. Le variabili Resend restano le stesse. Il recapito reale deve essere verificato dopo la configurazione e la pubblicazione.
