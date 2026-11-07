# Resend setup for Devma / Configurazione Resend

The website forms send enquiries directly to `faheem@devma.it` using a server-side Vercel Function. After Resend accepts the business notification, the server sends a branded acknowledgement to the visitor in their selected language. The visitor does not need an email app. Portfolio requests now open the contact form with a suggested message; ordinary email and phone links remain available. Brief downloads do not send anything.

## 1. Verify a sending domain

1. Open https://resend.com/domains and add **devma.it** as a sending domain.
2. At IONOS, open Domains & SSL → devma.it → DNS.
3. Add the exact sending-verification records Resend displays. Use the host names and values shown for this domain; do not guess them.
4. Wait until Resend shows the sending domain as verified.

The current setup uses the verified devma.it domain. Keep the working Vercel variables unchanged when updating this website. Preserve the existing root-domain MX records and existing email authentication records. You do **not** need to move incoming email to Resend or enable Resend inbound receiving. A Resend verification MX record, if requested, belongs at the precise return-path host Resend specifies, not at `@` unless you intentionally move incoming mail.

Once `devma.it` is verified for sending, use `Devma <website@devma.it>` as the sender. This is a sending identity; the website sends to the existing `faheem@devma.it` mailbox. Customer email addresses are used as Reply-To, never as the sender.

If you verify a different domain instead, set RESEND_FROM to an address on that verified domain.

## 2. Create a sending API key

Open https://resend.com/api-keys and create a key with sending access, restricted to your verified domain where available. Copy it into Vercel, not into the frontend or GitHub. Do not send the secret key in chat.

## 3. Set Vercel environment variables

Project → Settings → Environment Variables:

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | Your real Resend API key |
| `RESEND_FROM` | `Devma <website@devma.it>` |
| `CONTACT_TO` | `faheem@devma.it` |

Use Production for the live site. Add Preview too if you want to test preview deployments. Set the sender value without shell quote marks in the Vercel UI. Never prefix these variables with `VITE_`: they must stay server-only.

Optional: `CONTACT_ALLOWED_ORIGINS` is a comma-separated list of additional exact site origins, such as `https://your-custom-preview.example`. `https://devma.it` and `https://www.devma.it` are allowed by default; Vercel deployment and branch URLs are recognised when system environment variables are exposed.

## 4. Deploy the complete project

Upload all files, including the **api/** and **server/** folders, `.env.example`, `vercel.json`, `src/`, `it/`, `en/` and `public/`. Keep your existing `.git` folder.

```sh
npm ci
npm test
npm run build
git add .
git commit -m "Send Devma form enquiries through Resend"
git push
```

Redeploy after saving environment variables, even if the source has not changed. Build output remains `dist`; Vercel deploys `api/contact.js` separately as a server function. No new website-domain DNS changes are needed beyond the sending-domain verification records requested by Resend.

## 5. Check a real enquiry

1. Open the deployed Italian or English page.
2. Submit a short enquiry with an email address you control.
3. The button should show Sending / Invio in corso, then a success message after Resend accepts the email.
4. Check `faheem@devma.it`, including Spam, and check the message status in Resend.
5. Reply to confirm the reply is addressed to the visitor.
6. Test the website estimate form too: it should include the package, pages, options and server-calculated total.
7. Check the customer mailbox for the Italian or English acknowledgement. It should thank the customer, contain the same DVM reference and explain that Faheem will reply. Replying to it should address faheem@devma.it.
8. Open `email-previews/confirmation-en.html` and `email-previews/confirmation-it.html` from the ZIP to review the branded templates without sending mail.

Success means the email provider accepted the business notification; it is not an inbox-delivery guarantee. The acknowledgement has its own idempotency key. If the acknowledgement fails, the original enquiry still succeeds and the UI does not claim a confirmation was sent. There is no background queue for failed acknowledgements; check Resend delivery status when testing. Until credentials and sender verification are configured, forms show an unavailable message and keep the visitor’s inputs. They do not falsely report success.

## Abuse protection and data handling

The endpoint uses server validation, input limits, exact-origin checks, a honeypot and Resend idempotency keys to avoid duplicate retries. Origin checks are not bot authentication. Before promoting a public endpoint, configure a Vercel Firewall rate-limit rule for `/api/contact` and `/api/contact/` appropriate to your traffic and plan, and monitor Resend usage. There is no pretend in-memory global rate limit.

The recipient is server-configured and cannot be chosen by a visitor. Estimated prices are recalculated by the server. Requests use plain text email; provider errors and API credentials are not returned to the browser. No enquiry database is added. Each accepted enquiry attempts two emails: one business notification and one customer acknowledgement. Both count towards your Resend usage.

Update your final privacy information to identify your business and explain processing by Vercel and Resend, purpose, retention and contact rights. The form wording states that supplied details are used to respond to the enquiry.

## Local development and tests

`npm run dev` runs the frontend only. Use `vercel dev` with server environment variables for a complete local test; allow its exact origin with CONTACT_ALLOWED_ORIGINS. The frontend-only preview does not send email. `npm test` mocks the provider: no real messages are sent and no real API key is needed.

Official references:
- https://resend.com/docs/dashboard/domains/introduction
- https://resend.com/docs/api-reference/emails/send-email
- https://vercel.com/docs/functions/runtimes/node-js

## Version 1.5 experience update

- A branded HTML acknowledgement with a plain-text alternative in Italian and English. No unapproved response-time promise. Customer replies go to your configured CONTACT_TO address.
- An escaped HTML business notification and a shared request reference for tracing the conversation.
- Separate stable idempotency keys for the two emails, so retrying the same request does not duplicate them within Resend’s supported window.
- Customer acknowledgement is attempted only after the business notification is accepted. No submitted free-text message is reflected in the customer acknowledgement.
- The main project form now has three guided stages; customer inputs are retained when moving back or after an error.
- The website estimator has page stepper controls, live price breakdown, optional extras and copy/download tools. Server-side price calculation remains authoritative.
- Portfolio requests open the direct form, with normal contact links still available.
- A visible receipt shows the request reference and next steps.

No new environment variables are required beyond the previous Resend setup. Re-upload the full project, including the new server/emailTemplates.js and shared src components, and redeploy. Real delivery to both inboxes must be verified on your configured deployment.

## If Send appears to do nothing (version 1.5.1)

The form should show Sending / Invio in corso, then either a receipt or a visible error above the button. It does not navigate to another website page. On success the dialog changes into a receipt; on failure the inputs stay available for correction or retry.

| Visible code | What to check in the deployed project |
| --- | --- |
| FORM_CONFIG | RESEND_API_KEY and RESEND_FROM are set for Production and a new deployment was created; also verify the API key is valid. |
| FORM_SENDER | RESEND_FROM uses the exact sending domain verified in Resend. |
| FORM_ENDPOINT | The api/ and server/ folders were pushed, the Vercel Root Directory is correct, and the function deployed. |
| FORM_ORIGIN | Open devma.it or www.devma.it; if using another legitimate hostname, add its exact origin to CONTACT_ALLOWED_ORIGINS and redeploy. |
| FORM_NETWORK | Check the connection or any content blocker, then retry. |
| FORM_BUSY | Wait briefly and retry; check Resend request limits. |
| FORM_SEND | Inspect Vercel function logs and Resend email status. The backend logs a reference, provider status and error name without the API key or customer message. |

A screenshot of the visible code is sufficient for initial troubleshooting; never share API keys. Automated interaction tests cannot prove live DNS, environment-variable configuration or delivery to an inbox.
