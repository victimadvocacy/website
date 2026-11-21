const $ = s => document.querySelector(s);
const syncAttorneyName = form => {
  const nameSlot = form.querySelector('.attorney-name-slot');
  if (!nameSlot) return;
  const slot = form.querySelector('.attorney-slot, #has-attorney-field');
  const yes = form.querySelector('input[name="has_attorney"]:checked');
  nameSlot.hidden = (slot && slot.hidden) || !yes || yes.value !== 'Yes';
};

$('.skip').onclick = e => { e.preventDefault(); $('#content').focus(); $('#content').scrollIntoView(); };

$('#menu').onclick = () => {
  const open = $('#nav').classList.toggle('open');
  $('#menu').setAttribute('aria-expanded', String(open));
};

const spanishPage = document.body.dataset.page === 'es';

// Floating call button: jumps to this page's form when there is one, otherwise opens the contact page.
// It is left off the contact and thank-you pages, which already are the destination.
const pageForm = $('#inquiry, form.short-inquiry');
if (!['contact', 'thank-you'].includes(document.body.dataset.page)) {
  const sticky = document.createElement('a');
  sticky.className = 'sticky-cta';
  const formTitle = pageForm && pageForm.querySelector('h2[id]');
  sticky.href = formTitle ? '#' + formTitle.id : '/contact';
  sticky.textContent = spanishPage ? 'Solicite una llamada de 15 minutos' : 'Request a 15-Minute Call';
  document.body.appendChild(sticky);
  const clearSticky = () => {
    if (window.innerWidth > 480) {
      sticky.style.visibility = 'visible';
      return;
    }
    const sb = sticky.getBoundingClientRect();
    const covered = [...document.querySelectorAll('a.btn, button.btn, a[href*="sample-file"]')].some(el => {
      if (el === sticky) return false;
      const b = el.getBoundingClientRect();
      if (b.width < 8 || b.height < 8) return false;
      return b.bottom > sb.top + 2 && b.top < sb.bottom - 2 && b.right > sb.left && b.left < sb.right;
    });
    sticky.style.visibility = covered ? 'hidden' : 'visible';
  };
  addEventListener('scroll', clearSticky, { passive: true });
  addEventListener('resize', clearSticky);
  clearSticky();
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const params = new URLSearchParams(location.search);
const stateParam = params.get('state');

// Spam protection, part 1 of 2 (part 2 is the Web3Forms account settings).
// A real person can't fill in this form within a few seconds, and never ticks the hidden "botcheck" box.
// Either sign means a bot: it is sent to the thank-you page as if it worked, and nothing is submitted.
const loadedAt = Date.now();
const looksLikeBot = form => (form.elements.botcheck && form.elements.botcheck.checked) || Date.now() - loadedAt < 3000;
const thanksUrl = spanish => '/thank-you' + (spanish ? '?lang=es' : '');

const form = $('#inquiry');
if (form) {
  const roles = { attorney: 'Attorney / Law Firm', individual: 'Individual / Family' };
  const stateLabels = { attorney: 'Where Is Your Firm Located?', individual: 'State Where This Happened' };
  const stateBlank = { attorney: 'Choose a state', individual: 'Choose a state' };
  // Individuals see an example written for whoever the inquiry is about
  const guidance = {
    attorney: 'Include the general matter type and timing. Do not include confidential case details, account numbers, medical records or evidence.',
    self: 'A few sentences is plenty, for example: “Someone I met online talked me into sending most of my savings, and I don’t know what to do next.” Please don’t send account numbers or documents here.',
    family: 'A few sentences is plenty, for example: “My mother’s savings have dropped since my brother started handling her bills, and I don’t know where to start.” Please don’t send account numbers or documents here.',
  };
  const field = id => form.querySelector('#' + id);
  let role = '';
  const setGuidance = () => {
    const about = field('about');
    if (role) field('guidance').textContent = role === 'attorney' ? guidance.attorney : guidance[!about || about.value === 'Me' ? 'self' : 'family'];
  };
  // The subject line tells VAA who is writing and from where, before the email is opened
  const setSubject = () => {
    const parts = [field('inquiry-type').value, field('state').value].filter(Boolean);
    form.elements.subject.value = 'New inquiry from victimadvocacy.com' + (parts.length ? ': ' + parts.join(', ') : '');
  };
  // Hidden fields are also disabled, so they aren't sent with the inquiry
  const show = (id, on) => {
    const el = field(id);
    if (!el) return;
    el.classList.toggle('hidden', !on);
    el.querySelectorAll('input, select, textarea').forEach(i => { i.disabled = !on; });
  };
  form.querySelectorAll('[data-role]').forEach(b => b.onclick = () => {
    role = b.dataset.role;
    form.querySelectorAll('[data-role]').forEach(x => {
      x.classList.toggle('selected', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    const firm = role === 'attorney';
    show('firm-field', firm);
    show('about-field', !firm);
    show('safety-field', !firm);
    field('state-label').textContent = stateLabels[role];
    const blank = field('state').querySelector('option[value=""]');
    if (blank) blank.textContent = stateBlank[role];
    field('inquiry-type').value = roles[role];
    const requester = field('requester-type');
    if (requester) requester.value = firm ? "I'm with a law firm" : "I'm a client or family member";
    const note = field('client-note');
    if (note) note.hidden = firm;
    const hasAt = field('has-attorney-field');
    if (hasAt) { hasAt.hidden = firm; hasAt.disabled = firm; }
    const atName = field('attorney-name');
    if (atName) atName.disabled = firm;
    syncAttorneyName(form);
    const msg = field('message');
    if (msg) msg.placeholder = firm
      ? 'A short description of the matter type and what support you need.'
      : "A short description of what you're looking for.";
    setGuidance();
    setSubject();
  });
  form.querySelectorAll('input[name="has_attorney"]').forEach(r => r.addEventListener('change', () => syncAttorneyName(form)));
  if (field('about')) field('about').onchange = setGuidance;
  field('state').onchange = setSubject;

  // The state finder hands over the chosen state without putting it in the address bar
  let chosen = stateParam;
  try { chosen = chosen || sessionStorage.getItem('vaa-state'); sessionStorage.removeItem('vaa-state'); } catch (err) {}
  if (chosen && field('state').querySelector('option[value="' + CSS.escape(chosen) + '"]')) field('state').value = chosen;
  // Links arrive as /contact?who=individual (no jump down the page), or the older /contact#individual
  const wantsIndividual = location.hash === '#individual' || params.get('who') === 'individual';
  form.querySelector(wantsIndividual ? '[data-role="individual"]' : '[data-role="attorney"]').click();
  setSubject();

  form.onsubmit = async e => {
    e.preventDefault();
    const status = field('form-status');
    const button = form.querySelector('button[type="submit"]');
    // Email and phone are both required, for clients and firms alike
    if (!form.elements.email.value.trim()) {
      status.textContent = 'Please give us an email address so we can reach you.';
      form.elements.email.focus();
      return;
    }
    if (!form.elements.phone.value.trim()) {
      status.textContent = 'Please give us a phone number so we can reach you.';
      form.elements.phone.focus();
      return;
    }
    if (looksLikeBot(form)) { location.href = thanksUrl(false); return; }
    const body = new FormData(form);
    body.delete('redirect');
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body, headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok || data.success !== true) throw new Error(data.message || 'Send failed');
      location.href = thanksUrl(false);
    } catch (err) {
      status.textContent = 'Sorry, your inquiry did not go through. Please call or text 817-805-2467, or email arpey@victimadvocacy.com.';
      button.disabled = false;
    }
  };
}

document.querySelectorAll('form.short-inquiry').forEach(form => {
  const sync = kind => {
    form.querySelectorAll('[data-requester]').forEach(b => {
      const on = b.dataset.requester === kind;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (form.elements.requester_type) form.elements.requester_type.value = kind === 'client' ? "I'm a client or family member" : "I'm with a law firm";
    const note = form.querySelector('.client-note');
    if (note) note.hidden = kind !== 'client';
    const firm = form.querySelector('.firm-slot');
    if (firm) firm.hidden = kind === 'client';
    const slot = form.querySelector('.attorney-slot');
    if (slot) slot.hidden = kind !== 'client';
    syncAttorneyName(form);
    const ta = form.querySelector('textarea');
    if (ta) ta.placeholder = kind === 'client' ? "A short description of what you're looking for." : 'A short description of the matter type and what support you need.';
  };
  form.querySelectorAll('[data-requester]').forEach(b => b.addEventListener('click', () => sync(b.dataset.requester)));
  form.querySelectorAll('input[name="has_attorney"]').forEach(r => r.addEventListener('change', () => syncAttorneyName(form)));
  if (form.querySelector('[data-requester]')) sync('law firm');
  syncAttorneyName(form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    const email = form.elements.email.value.trim();
    if (!email) {
      status.textContent = 'Please give us an email address so we can reach you.';
      form.elements.email.focus();
      return;
    }
    if (form.elements.phone && !form.elements.phone.value.trim()) {
      status.textContent = 'Please give us a phone number so we can reach you.';
      form.elements.phone.focus();
      return;
    }
    if (looksLikeBot(form)) { location.href = thanksUrl(spanishPage); return; }
    const body = new FormData(form);
    body.delete('redirect');
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body, headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok || data.success !== true) throw new Error(data.message || 'Send failed');
      location.href = thanksUrl(spanishPage);
    } catch (err) {
      status.textContent = 'Sorry, your inquiry did not go through. Please call or text 817-805-2467, or email arpey@victimadvocacy.com.';
      button.disabled = false;
    }
  });
});

// Thank-you page: Spanish wording when the visitor came from the Spanish page
if (document.body.dataset.page === 'thank-you' && params.get('lang') === 'es') {
  document.documentElement.lang = 'es';
  document.querySelectorAll('[data-es]').forEach(el => { el.textContent = el.dataset.es; });
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
      `<article class="case ours"><span class="tag">Private Service · First Call Free</span><h3>Help Putting Your Records in Order</h3>` +
      `<p>Official programs in ${esc(s.state)} are listed below. VAA works mainly through attorneys. The first call is free.</p>` +
      `<p>Call or text <a class="textlink" href="tel:+18178052467">817-805-2467</a>.</p>` +
      `<a class="btn" href="/contact?who=individual" data-state="${esc(s.abbr)}">Talk With VAA</a></article>` +
      (s.abbr === 'TX'
        ? `<article class="case"><span class="tag">Adults 65+ or with a Disability in Texas</span><h3>Texas Abuse Hotline</h3>` +
          `<p>Report abuse, neglect or financial exploitation of an adult 65 or older or an adult with a disability. 800-252-5400.</p>` +
          `<a class="textlink" href="https://www.txabusehotline.org" target="_blank" rel="noopener">txabusehotline.org ↗</a></article>`
        : `<article class="case"><span class="tag">Older Adults and Adults with Disabilities</span><h3>Adult Protective Services in ${esc(s.state)}</h3>` +
          `<p>Report abuse, neglect or financial exploitation to the Adult Protective Services office in the person’s state.</p>` +
          `<a class="textlink" href="https://www.napsa-now.org/help-in-your-area/" target="_blank" rel="noopener">napsa-now.org ↗</a></article>`) +
      `<article class="case"><span class="tag">Crime Victim Compensation in ${esc(s.state)}</span><h3>${esc(s.comp_name || 'Your State’s Compensation Program')}</h3>` +
      `<p>May help with costs such as counseling, lost wages and relocation after a crime. It usually doesn’t repay money that was stolen.</p>` +
      `<a class="textlink" href="${esc(comp)}" target="_blank" rel="noopener">${esc(host(comp))} ↗</a></article>` +
      `<article class="case"><span class="tag">Report a Scam in ${esc(s.state)}</span><h3>${esc(s.ag_name || 'Your State Attorney General')}</h3>` +
      `<p>File a consumer complaint or report a scam with your state’s attorney general.</p>` +
      `<a class="textlink" href="${esc(ag)}" target="_blank" rel="noopener">${esc(host(ag))} ↗</a></article>`;
  };
  pick.onchange = show;
  out.addEventListener('click', e => {
    const a = e.target.closest('[data-state]');
    if (a) try { sessionStorage.setItem('vaa-state', a.dataset.state); } catch (err) {}
  });
  if (stateParam) { pick.value = stateParam; show(); }
}
