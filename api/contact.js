import { processEnquiry } from '../server/enquiry.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') res.setHeader('Allow', 'POST');
  const result = await processEnquiry({ method: req.method, headers: req.headers, body: req.body });
  return res.status(result.status).json(result.body);
}
