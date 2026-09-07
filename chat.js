(function () {
  var ENABLED = false;
  if (!ENABLED) return;

  var WEBHOOK = 'https://api.majarrah.io/v1/docs-ai';
  var SESSION_ID = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);

  var SPINNER_CHARS = ['·', '✻', '✽', '✶', '✳', '✢'];
  var LOAD_PHRASES  = ['Processing...', 'Working on it...', 'Running...', 'One moment...', 'Almost there...', 'Thinking...'];

  /* ── styles ── */
  var style = document.createElement('style');
  style.textContent = `
    #mj-root {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: min(720px, calc(100% - 48px));
      z-index: 99999;
      display: flex;
      flex-direction: column;
      font-family: 'SansBody', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --mj-bg:          #ffffff;
      --mj-border:      #e5e7eb;
      --mj-text:        #111111;
      --mj-placeholder: #6b7280;
      --mj-bubble:      #f3f4f6;
      --mj-accent:      #111111;
    }
    #mj-root[data-dark] {
      --mj-bg:          #0b0b0b;
      --mj-border:      rgba(255,255,255,0.1);
      --mj-text:        #eeeeee;
      --mj-placeholder: #888888;
      --mj-bubble:      rgba(255,255,255,0.06);
      --mj-accent:      #eeeeee;
    }
    #mj-history {
      position: relative;
      display: none; flex-direction: column; gap: 10px;
      background: var(--mj-bg);
      border: 1px solid var(--mj-border);
      border-bottom: none;
      border-radius: 16px 16px 0 0;
      max-height: 360px; overflow-y: auto;
      padding: 16px;
      padding-top: 36px;
    }
    #mj-history { scrollbar-width: thin; scrollbar-color: rgba(127,127,127,.2) transparent; }
    #mj-history::-webkit-scrollbar { width: 4px; }
    #mj-history::-webkit-scrollbar-track { background: transparent; }
    #mj-history::-webkit-scrollbar-thumb { background: rgba(127,127,127,.2); border-radius: 4px; }
    #mj-cls {
      position: absolute; top: 10px; right: 12px;
      background: none; border: none; cursor: pointer;
      color: var(--mj-placeholder); display: flex;
      align-items: center; justify-content: center;
      padding: 2px; opacity: .6; transition: opacity .15s;
    }
    #mj-cls:hover { opacity: 1; }
    #mj-history.mj-show                { display: flex; border-color: var(--mj-accent); }
    #mj-bar {
      display: flex; align-items: center; gap: 10px;
      background: var(--mj-bg);
      border: 1px solid var(--mj-border);
      border-radius: 16px;
      padding: 10px 14px;
      transition: border-color .2s, border-radius .15s;
    }
    #mj-bar:focus-within               { border-color: var(--mj-accent); }
    #mj-history.mj-show + #mj-bar      { border-radius: 0 0 16px 16px; border-top: none; border-color: var(--mj-accent); }
    #mj-input {
      flex: 1; background: none; border: none; outline: none;
      font-size: 14px; color: var(--mj-text); font-family: inherit;
      caret-color: var(--mj-accent);
    }
    #mj-input::placeholder { color: var(--mj-placeholder); }
    #mj-send {
      background: var(--mj-accent); border: none; border-radius: 50%;
      width: 32px; height: 32px; flex-shrink: 0; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      opacity: .4; transition: opacity .2s;
    }
    #mj-send.mj-ready        { opacity: 1; }
    #mj-send.mj-ready:hover  { opacity: .8; }
    #mj-send:disabled        { opacity: .3; cursor: default; }
    .mj-m {
      max-width: 84%; padding: 10px 14px; border-radius: 12px;
      font-size: 13.5px; line-height: 1.6;
      word-wrap: break-word; white-space: pre-wrap;
    }
    .mj-user {
      background: var(--mj-accent); color: var(--mj-bg);
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .mj-bot {
      background: transparent; color: var(--mj-text);
      align-self: flex-start; border-bottom-left-radius: 4px;
    }
    .mj-bot h1,.mj-bot h2,.mj-bot h3 { margin:6px 0 3px; font-weight:700; line-height:1.3; font-family:'PPAgrandir',sans-serif; }
    .mj-bot h1 { font-size:1.1em; }
    .mj-bot h2 { font-size:1.05em; }
    .mj-bot h3 { font-size:1em; }
    .mj-bot ul,.mj-bot ol { margin:4px 0; padding-left:18px; }
    .mj-bot li { margin:2px 0; }
    .mj-bot code { background:rgba(127,127,127,.12); border-radius:4px; padding:1px 5px; font-size:.88em; font-family:Consolas,'Courier New',monospace; }
    .mj-bot pre { background:rgba(127,127,127,.08); border-radius:8px; padding:10px 14px; overflow-x:auto; margin:6px 0; }
    .mj-bot pre code { background:none; padding:0; }
    .mj-bot a { color:var(--mj-accent); text-decoration:underline; }
    .mj-bot strong { font-weight:700; }
    .mj-bot em { font-style:italic; }
    .mj-sc { display:inline-block; width:1.4em; text-align:center; flex-shrink:0; }
    a[href*="utm_campaign=poweredBy"] { display:none !important; }
    .mj-bot.mj-cursor::after {
      content: "▋"; display: inline-block;
      animation: mj-blink .65s steps(1) infinite;
    }
    @keyframes mj-blink { 0%,100%{opacity:1} 50%{opacity:0} }
  `;
  document.head.appendChild(style);

  /* ── DOM ── */
  var root = document.createElement('div');
  root.id = 'mj-root';
  root.innerHTML =
    '<div id="mj-history">' +
      '<button id="mj-cls" aria-label="Close">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
          '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
        '</svg>' +
      '</button>' +
    '</div>' +
    '<div id="mj-bar">' +
      '<input id="mj-input" type="text" placeholder="Ask anything about Majarrah…" autocomplete="off" />' +
      '<button id="mj-send" aria-label="Send">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M12 19V5M5 12l7-7 7 7"/>' +
        '</svg>' +
      '</button>' +
    '</div>';
  document.body.appendChild(root);

  var historyEl = document.getElementById('mj-history');
  var inputEl   = document.getElementById('mj-input');
  var sendBtn   = document.getElementById('mj-send');

  document.getElementById('mj-cls').addEventListener('click', function () {
    historyEl.querySelectorAll('.mj-m').forEach(function (el) { el.remove(); });
    historyEl.classList.remove('mj-show');
  });

  /* ── theme sync ── */
  function syncTheme() {
    if (document.documentElement.classList.contains('dark')) root.setAttribute('data-dark', '');
    else root.removeAttribute('data-dark');
  }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  /* ── visibility (hide on home) ── */
  function syncVisibility() {
    root.style.display = window.location.pathname === '/' ? 'none' : '';
  }
  syncVisibility();
  var _push = history.pushState.bind(history);
  history.pushState = function () { _push.apply(history, arguments); syncVisibility(); };
  window.addEventListener('popstate', syncVisibility);

  /* ── spinner ── */
  var _spinActive = false, _spinInterval = null;

  function startSpinner(el) {
    _spinActive = true;
    var si = 0, pi = 0, pc = 0;
    el.innerHTML = '<span class="mj-sc"></span><span class="mj-sp"></span>';
    var sc = el.querySelector('.mj-sc');
    var sp = el.querySelector('.mj-sp');
    function render() { sc.textContent = SPINNER_CHARS[si]; sp.textContent = '  ' + LOAD_PHRASES[pi].slice(0, pc); }
    _spinInterval = setInterval(function () { if (!_spinActive) return; si = (si + 1) % SPINNER_CHARS.length; render(); }, 133);
    function typeNext() {
      if (!_spinActive) return;
      var phrase = LOAD_PHRASES[pi];
      if (pc < phrase.length) { pc++; render(); setTimeout(typeNext, 48); }
      else { setTimeout(function () { if (!_spinActive) return; pi = (pi + 1) % LOAD_PHRASES.length; pc = 0; typeNext(); }, 2000); }
    }
    render(); typeNext();
  }

  function stopSpinner() { _spinActive = false; clearInterval(_spinInterval); _spinInterval = null; }

  /* ── markdown renderer ── */
  function renderMarkdown(md) {
    var s = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var blocks = [];
    s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, function(_, c) { blocks.push('<pre><code>' + c.trim() + '</code></pre>'); return '\x00B' + (blocks.length - 1) + '\x00'; });
    var inlines = [];
    s = s.replace(/`([^`]+)`/g, function(_, c) { inlines.push('<code>' + c + '</code>'); return '\x00I' + (inlines.length - 1) + '\x00'; });
    var lines = s.split('\n'), out = [], ul = false, ol = false;
    lines.forEach(function(line) {
      var h3=line.match(/^### (.+)/), h2=line.match(/^## (.+)/), h1=line.match(/^# (.+)/);
      var li=line.match(/^[*-] (.+)/), oli=line.match(/^\d+\. (.+)/);
      if (h3||h2||h1) { if(ul){out.push('</ul>');ul=false;} if(ol){out.push('</ol>');ol=false;} out.push(h3?'<h3>'+h3[1]+'</h3>':h2?'<h2>'+h2[1]+'</h2>':'<h1>'+h1[1]+'</h1>'); }
      else if (li) { if(ol){out.push('</ol>');ol=false;} if(!ul){out.push('<ul>');ul=true;} out.push('<li>'+li[1]+'</li>'); }
      else if (oli) { if(ul){out.push('</ul>');ul=false;} if(!ol){out.push('<ol>');ol=true;} out.push('<li>'+oli[1]+'</li>'); }
      else { if(ul){out.push('</ul>');ul=false;} if(ol){out.push('</ol>');ol=false;} out.push(line.trim()===''?'<br>':line+'<br>'); }
    });
    if(ul) out.push('</ul>'); if(ol) out.push('</ol>');
    s = out.join('').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/__(.+?)__/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/_(.+?)_/g,'<em>$1</em>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    inlines.forEach(function(v,i){ s=s.replace('\x00I'+i+'\x00',v); });
    blocks.forEach(function(v,i){ s=s.replace('\x00B'+i+'\x00',v); });
    return s;
  }

  function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

  async function wordByWord(el, text) {
    var words = text.split(' ');
    el.textContent = '';
    el.classList.add('mj-cursor');
    for (var i = 0; i < words.length; i++) {
      el.textContent += (i > 0 ? ' ' : '') + words[i];
      historyEl.scrollTop = historyEl.scrollHeight;
      await sleep(28);
    }
    el.classList.remove('mj-cursor');
    el.innerHTML = renderMarkdown(text);
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  /* ── send ── */
  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', function(e){ if(e.key==='Enter'&&!e.shiftKey) handleSend(); });
  inputEl.addEventListener('input', function(){ sendBtn.classList.toggle('mj-ready', inputEl.value.trim().length > 0); });

  async function handleSend() {
    var text = inputEl.value.trim();
    if (!text || sendBtn.disabled) return;
    inputEl.value = '';
    sendBtn.classList.remove('mj-ready');
    historyEl.classList.add('mj-show');
    addMsg(text, 'user');
    var botMsg = addMsg('', 'bot');
    startSpinner(botMsg);
    sendBtn.disabled = true;
    var fullText = '';
    try {
      var res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream, application/json' },
        body: JSON.stringify({ message: text, source: 'majarrah-docs', path: window.location.pathname, session_id: SESSION_ID })
      });
      var ct = res.headers.get('content-type') || '';
      if (ct.includes('text/event-stream') || ct.includes('octet-stream') || ct.includes('text/plain')) {
        fullText = await collectSSE(res.body);
      } else {
        var d = await res.json();
        fullText = d.response || d.text || d.answer || d.output || d.message || 'Got it!';
      }
    } catch (_) { fullText = 'Something went wrong. Please try again.'; }
    stopSpinner();
    botMsg.textContent = '';
    await wordByWord(botMsg, fullText);
    sendBtn.disabled = false;
    historyEl.scrollTop = historyEl.scrollHeight;
    inputEl.focus();
  }

  /* ── SSE collector ── */
  async function collectSSE(body) {
    var reader = body.getReader(), decoder = new TextDecoder(), buf = '', result = '';
    while (true) {
      var chunk = await reader.read();
      if (chunk.done) break;
      buf += decoder.decode(chunk.value, { stream: true });
      var lines = buf.split('\n');
      buf = lines.pop();
      for (var line of lines) {
        line = line.trim();
        if (!line || line === ':') continue;
        if (line.startsWith('data: ')) {
          var raw = line.slice(6);
          if (raw === '[DONE]') { reader.cancel(); return result; }
          try {
            var p = JSON.parse(raw);
            var token = (p.choices&&p.choices[0].delta&&p.choices[0].delta.content) || p.text || p.delta || p.token || p.response || p.output || p.content || '';
            result += token;
          } catch(_) { result += raw; }
        } else { result += line + '\n'; }
      }
    }
    if (buf.trim()) result += buf;
    return result;
  }

  function addMsg(text, role) {
    var div = document.createElement('div');
    div.className = 'mj-m mj-' + role;
    div.textContent = text;
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
    return div;
  }
})();
