'use strict';
$('#wl').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#wl-err').textContent = '';
  try {
    await api('waitlist', { email: $('#wl-email').value, plan: $('#wl-plan').value, note: $('#wl-note').value, company: $('#wl-hp').value });
    const plan = $('#wl-plan').value;
    $('#wl-ok').textContent = plan === 'free'
      ? 'You are on the list. I will email you about ScopeLock updates.'
      : `You are on the list. I will email you when ${plan === 'pro' ? 'Pro' : 'Agency'} opens.`;
    $('#wl-ok').classList.remove('hidden');
    e.target.querySelector('button').disabled = true;
  } catch (err) { $('#wl-err').textContent = err.message; }
});
const plan = new URLSearchParams(location.search).get('plan');
if (plan) $('#wl-plan').value = plan;
