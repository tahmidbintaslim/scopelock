'use strict';
$('#f').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#err').textContent = ''; $('#ok').classList.add('hidden');
  const v = $('#u').value.trim();
  const t = decodeURIComponent(v.includes('#') ? v.slice(v.indexOf('#') + 1) : v).replace(/^cr=/, '');
  try {
    const { data, hash } = await api('verify', { token: t });
    $('#ok').textContent = data.type === 'receipt'
      ? `Valid receipt. "${data.doc.title}" was signed by ${data.signer.name} on ${fmt(data.signedAt)} (${data.outcome.replace('_', ' ')}). Hash ${hash}.`
      : `Valid sign-off link: "${data.title}", revision ${data.revision || 1}, created ${fmt(data.createdAt)}. Hash ${hash}.`;
    $('#ok').classList.remove('hidden');
  } catch (err) { $('#err').textContent = 'Not valid: ' + err.message; }
});
