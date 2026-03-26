/* CareConnect (Mobile) - shared UI logic
   - Request Support / Volunteer / Contact form submission (localStorage demo)
   - Chatbot (rule-based demo)
   - Dashboard KPI + recent requests rendering from localStorage
*/

const STORAGE_KEYS = {
  requests: 'cc_requests',
  volunteers: 'cc_volunteers',
  contacts: 'cc_contacts',
};

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function readList(key) {
  return safeParse(localStorage.getItem(key), []);
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '??';
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + last).toUpperCase();
}

function formatShortDate(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
}

function formatTime(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function showToast(title, body) {
  const existing = document.getElementById('ccToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ccToast';
  toast.className = 'cc-toast';

  const t = document.createElement('div');
  t.className = 'cc-toast-title';
  t.textContent = title;

  const b = document.createElement('p');
  b.className = 'cc-toast-body';
  b.textContent = body;

  toast.appendChild(t);
  toast.appendChild(b);
  document.body.appendChild(toast);

  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.remove(), 3200);
}

function mapSupportType(value) {
  const v = String(value || '').toLowerCase();
  const map = {
    'medical': 'Medical Support',
    'mental-health': 'Mental Health Support',
    'daily-care': 'Home Care',
    'transportation': 'Medicine Delivery',
    'medical consultation': 'Medical Consultation',
    'mental health support': 'Mental Health Support',
    'home care assistance': 'Home Care',
  };
  return map[v] ?? String(value || '—');
}

function generateBotReply(message) {
  const m = String(message || '').trim().toLowerCase().replace(/[?]$/, '');
  if (!m) return "I can help. What do you need today?";

  if (m === 'is it free') {
    return 'Yes! CareConnect services are completely free for patients in need.';
  }

  if (m === 'how to volunteer') {
    return 'To volunteer, please visit our volunteer registration page and fill out the application form. We\'d love to have you join our community!';
  }

  if (m === 'get support') {
    return 'You can request support by filling out our patient support form on the home screen. Our team will review your request and get back to you as soon as possible.';
  }

  return 'I can implement the API key here, but for demo purposes, I am not implementing it now, so chatting other than the below 👇 placeholder will not work.';
}

function createChatBubble({ from, text }) {
  const wrapper = document.createElement('div');
  const msg = document.createElement('div');

  if (from === 'user') {
    wrapper.className = 'flex justify-end items-end gap-2 group';
    msg.className = 'max-w-[80%] bg-primary text-on-primary p-4 rounded-2xl rounded-br-none shadow-md';
    msg.textContent = text;
    wrapper.appendChild(msg);
  } else {
    wrapper.className = 'flex justify-start items-end gap-2 group';
    const icon = document.createElement('div');
    icon.className = 'w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0';
    icon.innerHTML = '<span class="material-symbols-outlined text-xs text-on-surface-variant">smart_toy</span>';
    msg.className = 'max-w-[80%] bg-surface-container-low text-on-surface p-4 rounded-2xl rounded-bl-none shadow-sm border border-outline-variant/10';
    msg.textContent = text;
    wrapper.appendChild(icon);
    wrapper.appendChild(msg);
  }
  return wrapper;
}

function initMobileSupportForms() {
  // Patient support form (ids already exist in the prototype).
  const fullnameInput = document.getElementById('fullname');
  if (fullnameInput) {
    const form = fullnameInput.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname')?.value?.trim();
        const age = document.getElementById('age')?.value?.trim();
        const gender = document.getElementById('gender')?.value;
        const phone = document.getElementById('phone')?.value?.trim();
        const city = document.getElementById('city')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const supportType = document.getElementById('support-type')?.value;
        const description = document.getElementById('description')?.value?.trim();
        const urgency = document.querySelector('input[name="urgency"]:checked')?.value;

        if (!fullname || !age || !gender || !phone || !city || !email || !supportType || !description || !urgency) {
          showToast('Missing info', 'Please complete the form.');
          return;
        }

        const requests = readList(STORAGE_KEYS.requests);
        requests.unshift({
          id: crypto?.randomUUID?.() ?? String(Date.now()),
          fullname,
          age,
          gender,
          phone,
          email,
          city,
          supportType,
          urgency,
          description,
          createdAt: Date.now(),
        });
        writeList(STORAGE_KEYS.requests, requests.slice(0, 50));

        showToast('Request sent', 'Thanks. We will contact you shortly.');
        window.location.href = document.body.dataset.dashboardUrl || 'code_impact.html';
      });
    }
  }

  // Volunteer form (we will add IDs to the HTML in the next edits).
  const volunteerForm = document.getElementById('volunteerForm');
  if (volunteerForm) {
    volunteerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullname = document.getElementById('volunteerFullname')?.value?.trim();
      const email = document.getElementById('volunteerEmail')?.value?.trim();
      const phone = document.getElementById('volunteerPhone')?.value?.trim();
      const city = document.getElementById('volunteerCity')?.value?.trim();
      const profession = document.getElementById('volunteerProfession')?.value;
      const availability = Array.from(document.querySelectorAll('input[name="availability"]:checked')).map((i) => i.value);
      const bio = document.getElementById('volunteerBio')?.value?.trim();

      if (!fullname || !email || !phone || !city || !profession || availability.length === 0 || !bio) {
        showToast('Missing info', 'Please complete the volunteer form.');
        return;
      }

      const volunteers = readList(STORAGE_KEYS.volunteers);
      volunteers.unshift({
        id: crypto?.randomUUID?.() ?? String(Date.now()),
        fullname,
        email,
        phone,
        city,
        profession,
        availability,
        bio,
        createdAt: Date.now(),
      });
      writeList(STORAGE_KEYS.volunteers, volunteers.slice(0, 50));

      showToast('Registered', 'Thanks for joining CareConnect.');
      window.location.href = document.body.dataset.dashboardUrl || 'code_impact.html';
    });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName')?.value?.trim();
      const email = document.getElementById('contactEmail')?.value?.trim();
      const subject = document.getElementById('contactSubject')?.value;
      const message = document.getElementById('contactMessage')?.value?.trim();

      if (!name || !email || !subject || !message) {
        showToast('Missing info', 'Please complete the contact form.');
        return;
      }

      const contacts = readList(STORAGE_KEYS.contacts);
      contacts.unshift({
        id: crypto?.randomUUID?.() ?? String(Date.now()),
        name,
        email,
        subject,
        message,
        createdAt: Date.now(),
      });
      writeList(STORAGE_KEYS.contacts, contacts.slice(0, 50));

      showToast('Sent', 'Thanks. A support representative will reach out.');
      window.location.href = document.body.dataset.homeUrl || 'code_home.html';
    });
  }
}

function initMobileChatbot() {
  const chatHistory = document.getElementById('mobileChatHistory');
  const chatInput = document.getElementById('mobileChatInput');
  const chatSend = document.getElementById('mobileChatSend');
  if (!chatHistory || !chatInput || !chatSend) return;

  const quickReplies = document.getElementById('mobileChatQuickReplies');

  function appendMessage({ from, text }) {
    const el = createChatBubble({ from, text });
    chatHistory.appendChild(el);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function send(text) {
    const t = String(text || '').trim();
    if (!t) return;

    appendMessage({ from: 'user', text: t });
    chatInput.value = '';

    const typing = document.createElement('div');
    typing.className = 'flex justify-start items-end gap-2 group';
    typing.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-xs text-on-surface-variant">smart_toy</span>
      </div>
      <div class="max-w-[80%] bg-surface-container-low text-on-surface p-4 rounded-2xl rounded-bl-none flex gap-1 shadow-sm">
        <span class="w-1.5 h-1.5 bg-outline rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    `;
    chatHistory.appendChild(typing);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    window.setTimeout(() => {
      typing.remove();
      appendMessage({ from: 'bot', text: generateBotReply(t) });
    }, 500);
  }

  chatSend.addEventListener('click', () => send(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send(chatInput.value);
  });

  if (quickReplies) {
    quickReplies.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => send(btn.textContent.trim()));
    });
  }
}

function initMobileDashboard() {
  const kpiTotal = document.getElementById('kpiTotalRequests');
  const kpiVolunteers = document.getElementById('kpiActiveVolunteers');
  const kpiPending = document.getElementById('kpiPendingCases');
  const kpiCities = document.getElementById('kpiCitiesReached');
  const recentList = document.getElementById('recentRequestsList');
  if (!kpiTotal && !recentList) return;

  const requests = readList(STORAGE_KEYS.requests);
  const volunteers = readList(STORAGE_KEYS.volunteers);

  const totalRequests = requests.length || 0;
  const activeVolunteers = volunteers.length || 0;
  const pendingCases = requests.filter((r) => String(r.urgency).toLowerCase() === 'high').length || 0;
  const cities = Array.from(new Set(requests.map((r) => String(r.city || '').trim()).filter(Boolean))).length || 0;

  if (kpiTotal) kpiTotal.textContent = String(2842 + totalRequests);
  if (kpiVolunteers) kpiVolunteers.textContent = String(856 + activeVolunteers);
  if (kpiPending) kpiPending.textContent = String(124 + pendingCases);
  if (kpiCities) kpiCities.textContent = String(18 + cities);

  if (!recentList) return;
  if (requests.length === 0) return;

  const toShow = requests.slice(0, 4);
  recentList.innerHTML = toShow
    .map((r) => {
      const urgency = String(r.urgency || 'low').toLowerCase();
      const urgencyLabel = urgency.toUpperCase();
      const urgencyPill =
        urgency === 'high'
          ? 'bg-error-container text-on-error-container'
          : urgency === 'medium'
            ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
            : 'bg-secondary-fixed text-on-secondary-fixed-variant';

      const secondaryLabel = mapSupportType(r.supportType);

      return `
        <div class="flex items-center justify-between group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface-variant">
              ${initials(r.fullname)}
            </div>
            <div>
              <p class="font-headline font-bold text-sm">${String(r.fullname || '')}</p>
              <p class="font-label text-xs text-on-surface-variant">${secondaryLabel}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${urgencyPill} bg-surface-container-lowest">
            ${urgencyLabel}
          </span>
        </div>
      `;
    })
    .join('');
}

function initMobile() {
  // Base dataset defaults for redirects.
  document.body.dataset.dashboardUrl ||= 'code_impact.html';
  document.body.dataset.homeUrl ||= 'code_home.html';

  initMobileSupportForms();
  initMobileChatbot();
  initMobileDashboard();
}

window.addEventListener('DOMContentLoaded', initMobile);

