const $ = s => document.querySelector(s);

$('.skip').onclick = e => { e.preventDefault(); $('#content').focus(); $('#content').scrollIntoView(); };

$('#menu').onclick = () => {
  const open = $('#nav').classList.toggle('open');
  $('#menu').setAttribute('aria-expanded', String(open));
};

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stateParam = new URLSearchParams(location.search).get('state');

const form = $('#inquiry');
if (form) {
  const roles = { attorney: 'Attorney / Law Firm', individual: 'Individual / Family' };
  const guidance = {
    attorney: 'Include the general matter type and timing. Do not include confidential case details, account numbers, medical records or evidence.',
    individual: 'A few sentences is plenty, for example: “My home aide took money from my savings, and my lawyer asked me to gather my records.” Please don’t send account numbers or documents here.',
  };
  // The subject line tells VAA who is writing and from where, before the email is opened
  const setSubject = () => {
    const parts = [$('#inquiry-type').value, $('#state').value].filter(Boolean);
    form.elements.subject.value = 'New inquiry from victimadvocacy.com' + (parts.length ? ': ' + parts.join(', ') : '');
  };
  document.querySelectorAll('[data-role]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-role]').forEach(x => {
      x.classList.toggle('selected', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    $('#firm-field').classList.toggle('hidden', b.dataset.role !== 'attorney');
    $('#safety-field').classList.toggle('hidden', b.dataset.role !== 'individual');
    $('#guidance').textContent = guidance[b.dataset.role];
    $('#inquiry-type').value = roles[b.dataset.role];
    setSubject();
  });
  $('#state').onchange = setSubject;

  // Links arrive as contact.html#individual or #attorney, and from the
  // state finder as contact.html?state=TX#individual
  if (stateParam && $('#state').querySelector('option[value="' + CSS.escape(stateParam) + '"]')) {
    $('#state').value = stateParam;
    $('#need').value = 'Getting Organized for My Lawyer';
  }
  if (location.hash === '#individual') $('[data-role="individual"]').click();
  if (location.hash === '#attorney') $('[data-role="attorney"]').click();
  setSubject();

  form.onsubmit = async e => {
    e.preventDefault();
    const status = $('#form-status');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Send failed');
      form.reset();
      status.textContent = 'Thank you. Your inquiry was sent, and we will reply within one business day.';
    } catch (err) {
      status.textContent = 'Sorry, your inquiry did not go through. Please email arpey@victimadvocacy.com instead.';
    } finally {
      button.disabled = false;
    }
  };
}

// Resources: the chosen state's official programs, led by a call with VAA
const pick = $('#state-pick');
if (pick && window.VAA_STATES) {
  const host = u => new URL(u).hostname.replace(/^www\./, '');
  const out = $('#state-result');
  const show = () => {
    const s = VAA_STATES.find(x => x.abbr === pick.value);
    out.hidden = !s;
    if (!s) return;
    const comp = s.comp_url || 'https://nacvcb.org/state-information/';
    const ag = s.ag_url || 'https://www.naag.org/find-my-ag/';
    out.innerHTML =
      `<article class="case ours"><span class="tag">Private Service · First Call Free</span><h3>Get Organized for Your Lawyer</h3>` +
      `<p>If you live in ${esc(s.state)} and have a lawyer, or plan to hire one, we can help you gather your records and put them in order for them, by phone and video. VAA is a private, paid service, not a government program or a law firm. The first 15-minute call is free.</p>` +
      `<p>Send a short note with the best way to reach you, and we’ll reply within one business day. Please save the details for the call.</p>` +
      `<a class="btn" href="contact.html?state=${esc(s.abbr)}#individual">Ask for a Free Call</a></article>` +
      `<article class="case"><span class="tag">Crime Victim Compensation in ${esc(s.state)}</span><h3>${esc(s.comp_name || 'Your State’s Compensation Program')}</h3>` +
      `<p>May help with costs such as counseling, lost wages and relocation after a crime.</p>` +
      `<a class="textlink" href="${esc(comp)}" target="_blank" rel="noopener">${esc(host(comp))} ↗</a></article>` +
      `<article class="case"><span class="tag">Report a Scam in ${esc(s.state)}</span><h3>${esc(s.ag_name || 'Your State Attorney General')}</h3>` +
      `<p>File a consumer complaint or report a scam with your state’s attorney general.</p>` +
      `<a class="textlink" href="${esc(ag)}" target="_blank" rel="noopener">${esc(host(ag))} ↗</a></article>`;
  };
  pick.onchange = () => {
    show();
    history.replaceState(null, '', pick.value ? '?state=' + pick.value + '#every-state' : location.pathname + '#every-state');
  };
  if (stateParam) { pick.value = stateParam; show(); }
}
