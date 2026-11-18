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

const sticky = document.createElement('a');
sticky.className = 'sticky-cta';
sticky.href = '/#home-inquiry-title';
sticky.textContent = document.body.dataset.page === 'es' ? 'Solicite una llamada de 15 minutos' : 'Request a 15-Minute Call';
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

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stateParam = new URLSearchParams(location.search).get('state');

const form = $('#inquiry');
if (form) {
  const roles = { attorney: 'Attorney / Law Firm', individual: 'Individual / Family' };
  const stateLabels = { attorney: 'State of the Matter', individual: 'State Where This Happened' };
  // Individuals see an example written for whoever the inquiry is about
  const guidance = {
    attorney: 'Include the general matter type and timing. Do not include confidential case details, account numbers, medical records or evidence.',
    self: 'A few sentences is plenty, for example: “Someone I met online talked me into sending most of my savings, and I don’t know what to do next.” Please don’t send account numbers or documents here.',
    family: 'A few sentences is plenty, for example: “My mother’s savings have dropped since my brother started handling her bills, and I don’t know where to start.” Please don’t send account numbers or documents here.',
  };
  let role = '';
  const setGuidance = () => {
    if (role) $('#guidance').textContent = role === 'attorney' ? guidance.attorney : guidance[$('#about').value === 'Me' ? 'self' : 'family'];
  };
  // The subject line tells VAA who is writing, from where and in what language, before the email is opened
  const setSubject = () => {
    const lang = $('#language').value === 'Español' ? 'Español' : '';
    const parts = [$('#inquiry-type').value, $('#state').value, lang].filter(Boolean);
    form.elements.subject.value = 'New inquiry from victimadvocacy.com' + (parts.length ? ': ' + parts.join(', ') : '');
  };
  document.querySelectorAll('[data-role]').forEach(b => b.onclick = () => {
    role = b.dataset.role;
    document.querySelectorAll('[data-role]').forEach(x => {
      x.classList.toggle('selected', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    $('#firm-field').classList.toggle('hidden', role !== 'attorney');
    const arrangementField = $('#arrangement-field');
    const arrangement = $('#arrangement');
    if (arrangementField && arrangement) {
      const forAttorney = role === 'attorney';
      arrangementField.classList.toggle('hidden', !forAttorney);
      arrangement.required = forAttorney;
      if (!forAttorney) arrangement.value = '';
      else if (!arrangement.value) arrangement.value = 'Ongoing advocacy arrangement';
    }
    $('#about-field').classList.toggle('hidden', role !== 'individual');
    $('#safety-field').classList.toggle('hidden', role !== 'individual');
    $('#attorney-field').classList.toggle('hidden', role !== 'individual');
    $('#state-label').textContent = stateLabels[role];
    $('#inquiry-type').value = roles[role];
    const requester = $('#requester-type');
    if (requester) requester.value = role === 'attorney' ? "I'm with a law firm" : "I'm a client or family member";
    const note = $('#client-note');
    if (note) note.hidden = role !== 'individual';
    const hasAt = $('#has-attorney-field');
    if (hasAt) hasAt.hidden = role !== 'individual';
    syncAttorneyName(form);
    const msg = $('#message');
    if (msg) msg.placeholder = role === 'attorney'
      ? 'A short description of the matter type and what support you need.'
      : "A short description of what you're looking for.";
    setGuidance();
    setSubject();
  });
  form.querySelectorAll('input[name="has_attorney"]').forEach(r => r.addEventListener('change', () => syncAttorneyName(form)));
  const noLawyerNote = $('#no-lawyer-note');
  const syncNoLawyer = () => {
    if (!noLawyerNote) return;
    noLawyerNote.hidden = $('#need').value !== "I don't have a lawyer yet";
  };
  $('#need').addEventListener('change', syncNoLawyer);
  syncNoLawyer();
  $('#about').onchange = setGuidance;
  $('#state').onchange = setSubject;
  $('#language').onchange = setSubject;

  // Links arrive as /contact#individual or #attorney, and from the
  // state finder as /contact?state=TX#individual
  // The state finder hands over the chosen state without putting it in the address bar
  let chosen = stateParam;
  try { chosen = chosen || sessionStorage.getItem('vaa-state'); sessionStorage.removeItem('vaa-state'); } catch (err) {}
  if (chosen && $('#state').querySelector('option[value="' + CSS.escape(chosen) + '"]')) $('#state').value = chosen;
  if (new URLSearchParams(location.search).get('lang') === 'es') $('#language').value = 'Español';
  // The empty #individual and #attorney anchors at the top of the form scroll it into view
  if (location.hash === '#individual') $('[data-role="individual"]').click();
  else $('[data-role="attorney"]').click();
  setSubject();

  form.onsubmit = async e => {
    e.preventDefault();
    const status = $('#form-status');
    const button = form.querySelector('button[type="submit"]');
    const spanish = $('#language').value === 'Español';
    // Email is optional so someone whose inbox isn't private can leave only a phone number
    const email = form.elements.email.value.trim();
    if (!email && !form.elements.phone.value.trim()) {
      status.textContent = spanish
        ? 'Denos un correo electrónico o un número de teléfono para comunicarnos con usted.'
        : 'Please give us an email address or a phone number so we can reach you.';
      form.elements.email.focus();
      return;
    }
    const body = new FormData(form);
    if (!email) body.delete('email');
    button.disabled = true;
    status.textContent = spanish ? 'Enviando…' : 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body, headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Send failed');
      form.reset();
      syncNoLawyer();
      if (role) $('[data-role="' + role + '"]').click();
      status.textContent = spanish
        ? 'Gracias. Recibimos su mensaje y le responderemos dentro de un día hábil.'
        : 'Thank you. Your inquiry was sent, and we will reply within one business day.';
    } catch (err) {
      status.textContent = spanish
        ? 'Lo sentimos, su mensaje no se envió. Llame o envíe un mensaje de texto al 817-805-2467, o escriba a arpey@victimadvocacy.com.'
        : 'Sorry, your inquiry did not go through. Please call or text 817-805-2467, or email arpey@victimadvocacy.com.';
    } finally {
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
    const body = new FormData(form);
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body, headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Send failed');
      form.reset();
      if (form.querySelector('[data-requester]')) sync('law firm');
      status.textContent = 'Thank you. Your inquiry was sent, and we will reply within one business day.';
    } catch (err) {
      status.textContent = 'Sorry, your inquiry did not go through. Please call or text 817-805-2467, or email arpey@victimadvocacy.com.';
    } finally {
      button.disabled = false;
    }
  });
});

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
      `<a class="btn" href="/contact#attorney" data-state="${esc(s.abbr)}">Partner With VAA</a></article>` +
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

