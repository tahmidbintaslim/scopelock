'use strict';
$('#wl').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#wl-err').textContent = '';
  try {
    await api('waitlist', { email: $('#wl-email').value, plan: $('#wl-plan').value, note: $('#wl-note').value, company: $('#wl-hp').value });
    $('#wl-ok').classList.remove('hidden');
    e.target.querySelector('button').disabled = true;
  } catch (err) { $('#wl-err').textContent = err.message; }
});
const plan = new URLSearchParams(location.search).get('plan');
if (plan) $('#wl-plan').value = plan;
