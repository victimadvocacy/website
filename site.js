const $ = s => document.querySelector(s);

$('.skip').onclick = e => { e.preventDefault(); $('#content').focus(); $('#content').scrollIntoView(); };

$('#menu').onclick = () => {
  const open = $('#nav').classList.toggle('open');
  $('#menu').setAttribute('aria-expanded', String(open));
};

const toTop = document.createElement('button');
toTop.type = 'button';
toTop.className = 'to-top';
toTop.setAttribute('aria-label', 'Back to top');
toTop.textContent = 'Top';
document.body.appendChild(toTop);
const syncTop = () => toTop.classList.toggle('show', window.scrollY > 480);
window.addEventListener('scroll', syncTop, { passive: true });
syncTop();
toTop.onclick = () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

const sticky = document.createElement('a');
sticky.className = 'sticky-cta';
sticky.href = '/#home-inquiry-title';
sticky.textContent = document.body.dataset.page === 'es' ? 'Solicite una llamada de 15 minutos' : 'Request a 15-Minute Call';
document.body.appendChild(sticky);

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
    setGuidance();
    setSubject();
  });
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

