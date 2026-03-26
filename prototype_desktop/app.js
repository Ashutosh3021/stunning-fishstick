/* CareConnect (Desktop) - shared UI logic
   - Patient/volunteer/contact form submission (localStorage demo)
   - FAQ accordion on the FAQ page
   - Chat widget (rule-based demo)
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

function formatShortDate(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function formatTime(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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
    'medical': 'Medical Consultation',
    'mental-health': 'Mental Health Support',
    'daily-care': 'Daily Living Assistance',
    'transportation': 'Transportation Services',
    'medical consultation': 'Medical Consultation',
    'mental health support': 'Mental Health Support',
    'home care assistance': 'Home Care Assistant',
    'home care': 'Home Care Assistance',
    'medical supplies': 'Medical Supplies',
    'counseling': 'Counseling',
    'financial aid': 'Financial Aid',
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

  return null; // Signal to use Gemini API
}

async function getGeminiResponse(message) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    if (data.error) {
      return `Error: ${data.error}`;
    }
    return data.reply;
  } catch (error) {
    console.error('Chat Error:', error);
    return "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again later.";
  }
}

function createChatBubble({ from, text }) {
  const wrapper = document.createElement('div');
  const msg = document.createElement('div');

  if (from === 'user') {
    wrapper.className = 'flex items-start gap-3 justify-end';
    msg.className = 'bg-primary text-on-primary px-4 py-3 rounded-2xl rounded-tr-none max-w-[80%] text-sm leading-relaxed shadow-md';
    msg.textContent = text;
  } else {
    wrapper.className = 'flex items-start gap-3';
    const icon = document.createElement('div');
    icon.className = 'w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0';
    icon.innerHTML = '<span class="material-symbols-outlined text-secondary text-lg">smart_toy</span>';
    msg.className = 'bg-surface-container-high text-on-surface px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm leading-relaxed shadow-sm';
    msg.textContent = text;
    wrapper.appendChild(icon);
  }

  wrapper.appendChild(msg);
  return wrapper;
}

function initDesktopForms() {
  const supportForm = document.getElementById('supportRequestForm');
  if (supportForm) {
    const banner = document.getElementById('supportSuccessBanner');
    const urgencyHidden = document.getElementById('urgencyHidden');
    const urgencyButtons = Array.from(document.querySelectorAll('[data-urgency-option]'));

    // Ensure a default urgency exists if buttons exist.
    if (urgencyHidden && urgencyButtons.length > 0 && !urgencyHidden.value) {
      const initial = urgencyButtons.find((b) => b.getAttribute('data-urgency-option') === 'low');
      if (initial) urgencyHidden.value = 'low';
    }

    // Toggle urgency buttons UI + hidden value.
    urgencyButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-urgency-option');
        if (!urgencyHidden) return;
        urgencyHidden.value = value;

        // Style: first button style equals the original "selected" style.
        urgencyButtons.forEach((b) => {
          const isSelected = b === btn;
          if (isSelected) {
            b.classList.add('bg-surface-container-lowest', 'shadow-sm', 'text-primary');
            b.classList.remove('text-secondary');
          } else {
            b.classList.remove('bg-surface-container-lowest', 'shadow-sm', 'text-primary');
            b.classList.add('text-secondary');
          }
        });
      });
    });

    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullname = document.getElementById('fullname')?.value?.trim();
      const age = document.getElementById('age')?.value?.trim();
      const gender = document.getElementById('gender')?.value;
      const phone = document.getElementById('phone')?.value?.trim();
      const email = document.getElementById('email')?.value?.trim();
      const city = document.getElementById('city')?.value?.trim();
      const supportType = document.getElementById('supportType')?.value;
      const description = document.getElementById('description')?.value?.trim();
      const urgency = urgencyHidden?.value;

      if (!fullname || !age || !gender || !phone || !email || !city || !supportType || !urgency || !description) {
        showToast('Missing info', 'Please fill out all required fields.');
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

      // If this page is the "form" page, redirect to the submitted page.
      const submittedUrl = document.body.dataset.submittedUrl || 'code_form2.html';
      if (banner) banner.classList.add('cc-hidden');
      window.location.href = submittedUrl;
    });
  }

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
        showToast('Missing info', 'Please fill out all required volunteer fields.');
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

      showToast('Submitted', 'Thanks for volunteering. We will be in touch soon.');
      // Redirect to dashboard so the demo "updates".
      window.location.href = document.body.dataset.dashboardUrl || 'code_dashbord.html';
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName')?.value?.trim();
      const email = document.getElementById('contactEmail')?.value?.trim();
      const subject = document.getElementById('contactSubject')?.value;
      const message = document.getElementById('contactMessage')?.value?.trim();

      if (!name || !email || !subject || !message) {
        showToast('Missing info', 'Please fill out all contact fields.');
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

      showToast('Message sent', 'Thanks. Our team will reach out shortly.');
      window.location.href = document.body.dataset.dashboardUrl || 'code_dashbord.html';
    });
  }
}

function initDesktopFaq() {
  const accordion = document.getElementById('faqAccordion');
  if (!accordion) return;

  // FAQ questions are inside repeated blocks; keep scope narrow to avoid toggling
  // the "Contact a Human" button.
  const items = Array.from(accordion.querySelectorAll('div.bg-surface-container-lowest > button'));
  if (items.length === 0) return;

  let firstPanelInitialized = false;

  items.forEach((btn) => {
    const item = btn.closest('div.bg-surface-container-lowest');
    const panel = item ? item.querySelector(':scope > div') : null; // answer is first direct div child
    if (!panel) return; // some FAQ items in the prototype omit an answer block

    // Initialize: open the first FAQ that actually has an answer.
    const shouldOpen = !firstPanelInitialized;
    btn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    if (!shouldOpen) panel.classList.add('hidden');
    firstPanelInitialized = true;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) panel.classList.add('hidden');
      else panel.classList.remove('hidden');
    });
  });
}

function initDesktopChat() {
  const chatHistory = document.getElementById('chatHistory');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  if (!chatHistory || !chatInput || !chatSend) return;

  const quickReplies = document.getElementById('chatQuickReplies');

  function appendMessage({ from, text }) {
    const el = createChatBubble({ from, text });
    chatHistory.appendChild(el);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  async function send(text) {
    const t = String(text || '').trim();
    if (!t) return;

    appendMessage({ from: 'user', text: t });
    chatInput.value = '';

    // Simulate thinking.
    const typing = document.createElement('div');
    typing.className = 'flex items-start gap-3';
    typing.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-secondary text-lg">smart_toy</span>
      </div>
      <div class="bg-surface-container-high px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
        <span class="w-1.5 h-1.5 bg-outline rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    `;
    chatHistory.appendChild(typing);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const botReply = generateBotReply(t);
    let finalReply = botReply;

    if (botReply === null) {
      finalReply = await getGeminiResponse(t);
    }

    typing.remove();
    appendMessage({ from: 'bot', text: finalReply });
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

function initDesktopDashboard() {
  const kpiTotal = document.getElementById('kpiTotalRequests');
  const kpiVolunteers = document.getElementById('kpiActiveVolunteers');
  const kpiPending = document.getElementById('kpiPendingCases');
  const kpiCities = document.getElementById('kpiCitiesReached');
  const tbody = document.getElementById('requestsTbody');
  if (!kpiTotal && !tbody) return;

  const requests = readList(STORAGE_KEYS.requests);
  const volunteers = readList(STORAGE_KEYS.volunteers);

  const totalRequests = requests.length || 0;
  const activeVolunteers = volunteers.length || 0;
  const pendingCases = requests.filter((r) => String(r.urgency).toLowerCase() === 'high').length || 0;
  const cities = Array.from(new Set(requests.map((r) => String(r.city || '').trim()).filter(Boolean))).length || 0;

  // Add stored data on top of the prototype baseline numbers.
  const parseIntText = (el) => {
    if (!el) return 0;
    const n = parseInt(String(el.textContent || '').replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  };

  const baselineTotal = parseIntText(kpiTotal);
  const baselineVolunteers = parseIntText(kpiVolunteers);
  const baselinePending = parseIntText(kpiPending);
  const baselineCities = parseIntText(kpiCities);

  if (kpiTotal) kpiTotal.textContent = String(baselineTotal + totalRequests);
  if (kpiVolunteers) kpiVolunteers.textContent = String(baselineVolunteers + activeVolunteers);
  if (kpiPending) kpiPending.textContent = String(baselinePending + pendingCases);
  if (kpiCities) kpiCities.textContent = String(baselineCities + cities);

  if (!tbody) return;

  const toShow = requests.slice(0, 3);
  if (toShow.length === 0) return; // keep prototype rows

  tbody.innerHTML = toShow
    .map((r) => {
      const urgency = String(r.urgency || 'low').toLowerCase();
      const urgencyLabel = urgency.toUpperCase();
      const urgencyClass =
        urgency === 'high'
          ? 'bg-error-container/20 text-error'
          : urgency === 'medium'
            ? 'bg-secondary-container/30 text-secondary'
            : 'bg-tertiary-container/10 text-tertiary';

      const status =
        urgency === 'high' ? 'In Progress' : urgency === 'medium' ? 'Open' : 'Resolved';
      const dotColorClass =
        urgency === 'high' ? 'bg-secondary' : urgency === 'medium' ? 'bg-primary' : 'bg-tertiary-container';

      const requester = String(r.fullname || '');
      const supportType = mapSupportType(r.supportType || '');

      return `
        <tr class="hover:bg-surface-container-low transition-colors group">
          <td class="px-8 py-5">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary font-bold text-[10px]">
                ${initials(requester)}
              </div>
              <span class="font-medium text-slate-900">${requester}</span>
            </div>
          </td>
          <td class="px-6 py-5 text-slate-600">${supportType}</td>
          <td class="px-6 py-5 text-slate-600">${String(r.city || '—')}</td>
          <td class="px-6 py-5">
            <span class="px-3 py-1 rounded-full text-[11px] font-bold ${urgencyClass}">${urgencyLabel}</span>
          </td>
          <td class="px-6 py-5">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full ${dotColorClass}"></span>
              <span class="text-slate-700">${status}</span>
            </div>
          </td>
          <td class="px-8 py-5 text-right text-slate-500">${formatShortDate(r.createdAt)} ${formatTime(r.createdAt)}</td>
        </tr>
      `;
    })
    .join('');
}

function initDesktop() {
  initDesktopForms();
  initDesktopFaq();
  initDesktopChat();
  initDesktopDashboard();

  // On the submitted page, if the success banner exists, hide the form.
  const banner = document.getElementById('supportSuccessBanner');
  const form = document.getElementById('supportRequestForm');
  if (banner && form) {
    const submitted = document.body.dataset.submittedPage === 'true';
    if (submitted) {
      form.classList.add('cc-hidden');
      const hasAnyData =
        readList(STORAGE_KEYS.requests).length > 0 || readList(STORAGE_KEYS.volunteers).length > 0;
      if (!hasAnyData) banner.classList.add('cc-hidden');
      else banner.classList.remove('cc-hidden');
    }
  }
}

window.addEventListener('DOMContentLoaded', initDesktop);

