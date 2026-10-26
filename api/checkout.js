'use strict';
// Redirects to the Stripe Payment Link for a plan; falls back to the waitlist.
module.exports = (req, res) => {
  const plan = String((req.query && req.query.plan) || '');
  const url = { pro: process.env.STRIPE_LINK_PRO, agency: process.env.STRIPE_LINK_AGENCY }[plan];
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 302;
  res.setHeader('Location', url && /^https:\/\/(buy|checkout)\.stripe\.com\//.test(url) ? url : `/?plan=${encodeURIComponent(plan)}#waitlist`);
  res.end();
};
