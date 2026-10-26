'use strict';
let parentToken = null;
const box = $('#items');
function addItem(kind = 'scope', text = '', id = '') {
  const sel = el('select', { 'aria-label': 'Type' }, ...Object.entries(KIND).map(([k, v]) => el('option', { value: k, text: v, selected: k === kind })));
  const inp = el('input', { value: text, maxlength: 600, placeholder: 'Describe the item', 'aria-label': 'Item text' });
  const row = el('div', { class: 'item', 'data-id': id }, sel, inp, el('button', { type: 'button', 'aria-label': 'Remove', text: '×', onclick: () => row.remove() }));
  inp.addEventListener('paste', (e) => {
    const t = (e.clipboardData || window.clipboardData).getData('text');
    const lines = t.split(/\r?\n/).map((l) => l.replace(/^\s*([-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
    if (lines.length > 1) { e.preventDefault(); inp.value = lines[0]; lines.slice(1).forEach((l) => addItem(sel.value, l)); }
  });
  box.append(row);
  return inp;
}
['scope', 'uat', 'out'].forEach((k) => $('#add-' + k).addEventListener('click', () => addItem(k).focus()));

async function init() {
  const h = tokenFromHash();
  if (h.startsWith('cr=')) {
    parentToken = h.slice(3);
    try {
      const { data } = await api('verify', { token: parentToken });
      if (data.type !== 'receipt') throw new Error('Not a receipt');
      const d = data.doc;
      $('#h').textContent = `Change request (revision ${(d.revision || 1) + 1})`;
      const b = $('#cr-banner');
      b.textContent = `Baseline: "${d.title}", signed by ${data.signer.name} on ${fmt(data.signedAt)}. Edit the items below. Your client will see a diff against this baseline.`;
      b.classList.remove('hidden');
      ['title', 'client', 'agency', 'agencyEmail', 'notes'].forEach((k) => { $('#' + k).value = d[k] || ''; });
      $('#notes').value = '';
      d.items.forEach((it) => addItem(it.kind, it.text, it.id));
      return;
    } catch (e) { $('#err').textContent = 'Could not load the baseline receipt: ' + e.message; parentToken = null; }
  }
  addItem('scope'); addItem('uat'); addItem('out');
}
init();

$('#f').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#err').textContent = '';
  const items = [...box.children].map((r) => ({ id: r.dataset.id || undefined, kind: r.querySelector('select').value, text: r.querySelector('input').value.trim() })).filter((i) => i.text);
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const body = { title: $('#title').value, client: $('#client').value, agency: $('#agency').value, agencyEmail: $('#agencyEmail').value, notes: $('#notes').value, items };
    if (parentToken) body.parent = parentToken;
    const { token } = await api('seal', body);
    const url = `${location.origin}/sign#${token}`;
    const link = $('#link');
    link.value = url;
    link.parentElement.append(copyBtn(link));
    $('#preview').href = url;
    $('#f').classList.add('hidden');
    $('#done').classList.remove('hidden');
  } catch (err) { $('#err').textContent = err.message; btn.disabled = false; }
});
