import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

// ─── PRICING ENGINE ──────────────────────────────────────────────────────────
function estimatePrice(service, job, urgency) {
  const j = (job || '').toLowerCase();
  const isEmergency = urgency === 'Emergency — Right Now';
  const isAH = urgency === 'Within a Few Hours';
  const truck = 35, eFee = isEmergency ? 50 : 0, ahFee = isAH ? 60 : 0;
  let lo, hi, label;

  if (service === 'Residential') {
    if (j.includes('lockout')) { lo=95; hi=175; label='Residential Lockout'; }
    else if (j.includes('rekey')) { lo=95; hi=125; label='Lock Rekey'; }
    else if (j.includes('deadbolt')) { lo=95; hi=150; label='Deadbolt Install'; }
    else if (j.includes('install')||j.includes('replac')) { lo=95; hi=200; label='Lock Installation'; }
    else { lo=95; hi=150; label='Residential Lock Service'; }
  } else if (service === 'Commercial') {
    if (j.includes('lockout')) { lo=150; hi=300; label='Commercial Lockout'; }
    else if (j.includes('access')) { lo=250; hi=600; label='Access Control Install'; }
    else if (j.includes('master')) { lo=200; hi=500; label='Master Key System'; }
    else if (j.includes('panic')||j.includes('exit')) { lo=300; hi=600; label='Panic Bar/Exit Device'; }
    else { lo=200; hi=400; label='Commercial Lock Service'; }
  } else if (service === 'Automotive') {
    if (j.includes('lockout')||j.includes('locked')) { lo=95; hi=150; label='Car Lockout'; }
    else if (j.includes('fob')) { lo=125; hi=200; label='Key Fob Programming'; }
    else if (j.includes('ignition')) { lo=250; hi=600; label='Ignition Repair'; }
    else if (j.includes('transponder')) { lo=150; hi=300; label='Transponder Key'; }
    else if (j.includes('duplic')||j.includes('copy')) { lo=95; hi=125; label='Key Duplication'; }
    else { lo=150; hi=300; label='Automotive Key Service'; }
  } else { lo=250; hi=600; label='Access Control Service'; }

  return { lo: lo+truck+eFee+ahFee, hi: hi+truck+eFee+ahFee, label };
}

// ─── INTAKE LOGIC ─────────────────────────────────────────────────────────────
const CHIPS = {
  service: ['Residential', 'Commercial', 'Automotive', 'Access Control'],
  borough: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
  urgency: ['Emergency — Right Now', 'Within a Few Hours', 'Schedule for Later'],
  confirm: ['Confirm Job', 'Need to Think'],
};

function getJobPrompt(s) {
  return ({
    Residential: "What's the issue? (lockout, rekey, new lock, deadbolt, repair...)",
    Commercial: "What do you need? (lockout, access control, master key, panic bar...)",
    Automotive: "What's the problem? (car lockout, key copy, fob programming, ignition...)",
    'Access Control': "Describe the job. (new install, existing issue, intercom, camera...)",
  })[s] || "Describe the job briefly.";
}

function getNextState(step, input, data) {
  switch (step) {
    case 'service':
      return { text: getJobPrompt(input), chips: [], next: 'job' };
    case 'job':
      return { text: "What's your location? (NYC borough or neighborhood)", chips: CHIPS.borough, next: 'location' };
    case 'location':
      return { text: "Is this an emergency or can it wait?", chips: CHIPS.urgency, next: 'urgency' };
    case 'urgency': {
      const est = estimatePrice(data.service, data.job, input);
      const b2b = data.service === 'Commercial' || data.service === 'Access Control';
      return {
        text: `Here's your estimate.${b2b ? '\n\n**Note:** Commercial job — a Brabcore specialist will follow up.' : ''}`,
        quote: { ...est, service: data.service, location: data.location, urgency: input },
        chips: CHIPS.confirm,
        next: 'contact',
      };
    }
    case 'contact':
      if (input === 'Need to Think') {
        return {
          text: "No problem. Reach us anytime:\n\n📞 **[YOUR NUMBER]**\n📧 brabcorenyc@gmail.com\n\n**Hours:** Weekdays 3:30–10PM · Weekends 8AM–8PM\nEmergency: 24/7 at premium rate.",
          chips: ['Start Over'],
          next: 'done',
        };
      }
      return { text: "What's the best number to reach you? (Dispatch only — no spam.)", chips: [], next: 'confirm' };
    case 'confirm':
      return {
        text: `**You're all set.**\n\nA Brabcore technician will contact you at **${input}** within **30 minutes** during business hours.\n\nThank you for choosing Brabcore Lock & Cyber.`,
        chips: ['Start Over'],
        next: 'done',
        submitLead: true,
        contact: input,
      };
    default:
      return { text: "Welcome back. What service do you need?", chips: CHIPS.service, next: 'service' };
  }
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function QuoteCard({ q }) {
  const rows = [
    ['SERVICE', q.label],
    ['LOCATION', q.location || '—'],
    ['URGENCY', q.urgency],
    ['BASE + TRUCK ROLL', `$${q.lo - (q.urgency === 'Emergency — Right Now' ? 50 : q.urgency === 'Within a Few Hours' ? 60 : 0)}`],
    q.urgency === 'Emergency — Right Now' ? ['EMERGENCY FEE', '+$50'] : null,
    q.urgency === 'Within a Few Hours' ? ['AFTER-HOURS FEE', '+$60'] : null,
  ].filter(Boolean);

  return (
    <div style={{ background: '#07090c', border: '1px solid #e8b800', borderRadius: 6, padding: '14px 16px', marginTop: 10, fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: '#e8b800', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #1e2128' }}>
        ⬡ BRABCORE ESTIMATE
      </div>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#5a6070', borderBottom: '1px dashed #1a1d24' }}>
          <span>{k}</span><span style={{ color: '#c0c4cc' }}>{v}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 2px', marginTop: 4, borderTop: '1px solid #1e2128', color: '#e8b800', fontWeight: 'bold', fontSize: 13 }}>
        <span>ESTIMATED TOTAL</span><span>${q.lo}–${q.hi}</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: '#3d4149', lineHeight: 1.5 }}>
        * Final price confirmed on-site. $95 minimum. Licensed NYC Locksmith.
      </div>
    </div>
  );
}

function Bubble({ msg }) {
  const isAgent = msg.role === 'agent';
  const fmt = t => ({ __html: t.replace(/\*\*(.*?)\*\*/g, "<strong style='color:#e8b800'>$1</strong>").replace(/\n/g, '<br/>') });
  return (
    <div style={{ display: 'flex', gap: 8, alignSelf: isAgent ? 'flex-start' : 'flex-end', flexDirection: isAgent ? 'row' : 'row-reverse', maxWidth: '90%', animation: 'fadeUp .2s ease forwards', opacity: 0 }}>
      <div style={{ width: 26, height: 26, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isAgent ? '#e8b800' : '#252830', color: isAgent ? '#0a0a0a' : '#666', fontWeight: 900, fontSize: 9, marginTop: 2, fontFamily: 'sans-serif' }}>
        {isAgent ? 'B1' : 'YOU'}
      </div>
      <div style={{ padding: '10px 13px', borderRadius: 5, fontSize: 14, lineHeight: 1.65, background: isAgent ? '#111318' : '#1a1d26', border: '1px solid #1e2128', borderLeft: isAgent ? '2px solid #e8b800' : '1px solid #1e2128', color: '#d0d4dc', maxWidth: 520 }}>
        <div dangerouslySetInnerHTML={fmt(msg.text)} />
        {msg.quote && <QuoteCard q={msg.quote} />}
      </div>
    </div>
  );
}

function Dots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '11px 13px', background: '#111318', border: '1px solid #1e2128', borderLeft: '2px solid #e8b800', borderRadius: 5 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#a07f00', animation: 'blink 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [msgs, setMsgs] = useState([]);
  const [chips, setChips] = useState(CHIPS.service);
  const [step, setStep] = useState('service');
  const [data, setData] = useState({});
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef(null);
  const booted = useRef(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, thinking]);

  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      setTimeout(() => {
        setMsgs([{ role: 'agent', text: 'Welcome to **Brabcore Lock & Cyber**.\n\nI\'m BRAB-1, your intake agent. I\'ll get your info and generate a quote in under 2 minutes.\n\nWhat type of service do you need today?' }]);
        setChips(CHIPS.service);
      }, 300);
    }
  }, []);

  async function saveLead(leadData) {
    setSaving(true);
    try {
      const est = estimatePrice(leadData.service, leadData.job, leadData.urgency);
      await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: leadData.service,
          job: leadData.job,
          location: leadData.location,
          urgency: leadData.urgency,
          contact: leadData.contact,
          estLow: est.lo,
          estHigh: est.hi,
        }),
      });
    } catch (e) {
      console.error('Lead save failed:', e);
    }
    setSaving(false);
  }

  function respond(userText) {
    if (!userText.trim() || thinking) return;
    setInput('');
    const nd = { ...data };
    if (step === 'service') nd.service = userText;
    else if (step === 'job') nd.job = userText;
    else if (step === 'location') nd.location = userText;
    else if (step === 'urgency') nd.urgency = userText;

    setMsgs(p => [...p, { role: 'user', text: userText }]);
    setChips([]);
    setThinking(true);

    setTimeout(async () => {
      if (step === 'done') {
        setMsgs([{ role: 'agent', text: 'Welcome to **Brabcore Lock & Cyber**.\n\nI\'m BRAB-1, your intake agent. I\'ll get your info and generate a quote in under 2 minutes.\n\nWhat type of service do you need today?' }]);
        setChips(CHIPS.service);
        setStep('service');
        setData({});
        setThinking(false);
        return;
      }

      const result = getNextState(step, userText, nd);
      const agentMsg = { role: 'agent', text: result.text };
      if (result.quote) agentMsg.quote = result.quote;

      if (result.submitLead) {
        nd.contact = result.contact;
        await saveLead(nd);
      }

      setMsgs(p => [...p, agentMsg]);
      setChips(result.chips || []);
      setStep(result.next);
      setData(nd);
      setThinking(false);
    }, 600 + Math.random() * 300);
  }

  return (
    <>
      <Head>
        <title>Brabcore Lock & Cyber — Get a Quote</title>
        <meta name="description" content="Licensed NYC Locksmith — Lock, Key & Access Control. Get an instant quote." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@300;400&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ background: '#09090b', color: '#d0d4dc', fontFamily: "'Barlow',sans-serif", fontWeight: 300, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes blink { 0%,80%,100%{opacity:.2;transform:scale(.85)} 40%{opacity:1;transform:scale(1.15)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
          ::-webkit-scrollbar{width:2px} ::-webkit-scrollbar-thumb{background:#1e2128}
          input:focus,textarea:focus{outline:none;border-color:#6b5500!important}
          .chip:hover{background:#e8b800!important;color:#09090b!important}
          body{margin:0;padding:0;}
        `}</style>

        {/* Header */}
        <div style={{ background: '#0d0e12', borderBottom: '1px solid #1a1d24', padding: '11px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: '0.12em', color: '#e8b800' }}>BRABCORE</span>
              <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#3a3f4a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Lock & Cyber · NYC</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'monospace', fontSize: 8, color: '#4a5060', letterSpacing: '0.1em' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c87a', boxShadow: '0 0 5px #00c87a', animation: 'blink 2s infinite' }} />
              ONLINE · LICENSED NYC LOCKSMITH
            </div>
          </div>
          <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 9, color: '#3a3f4a', letterSpacing: '0.08em' }}>
            📞 [YOUR NUMBER] · Weekdays 3:30–10PM · Weekends 8AM–8PM · Emergency 24/7
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 10px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {msgs.map((m, i) => <Bubble key={i} msg={m} />)}
          {(thinking || saving) && (
            <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: 4, background: '#e8b800', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontWeight: 900, fontSize: 9, marginTop: 2 }}>B1</div>
              <Dots />
            </div>
          )}
          {chips.length > 0 && !thinking && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 34 }}>
              {chips.map(c => (
                <button key={c} className="chip" onClick={() => respond(c)}
                  style={{ padding: '6px 13px', border: '1px solid #e8b800', borderRadius: 3, background: 'transparent', color: '#e8b800', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.07em', cursor: 'pointer', textTransform: 'uppercase', transition: 'all .15s' }}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #1a1d24', background: '#0d0e12', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); respond(input); } }}
              placeholder="Type your response or tap a button above..."
              rows={1}
              style={{ flex: 1, background: '#111318', border: '1px solid #1e2128', borderRadius: 4, color: '#d0d4dc', fontFamily: "'Barlow',sans-serif", fontWeight: 300, fontSize: 13, padding: '9px 11px', resize: 'none', minHeight: 38 }}
            />
            <button onClick={() => respond(input)} disabled={thinking || !input.trim()}
              style={{ background: thinking || !input.trim() ? '#1a1d24' : '#e8b800', border: 'none', borderRadius: 4, color: thinking || !input.trim() ? '#3a3f4a' : '#09090b', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '9px 16px', cursor: thinking || !input.trim() ? 'not-allowed' : 'pointer', height: 38, flexShrink: 0 }}>
              SEND
            </button>
          </div>
          <div style={{ marginTop: 5, fontFamily: 'monospace', fontSize: 8, color: '#252830', letterSpacing: '0.07em', textAlign: 'center' }}>
            Licensed NYC Locksmith · Brabcore Lock & Cyber · Insured & Bonded
          </div>
        </div>
      </div>
    </>
  );
}
