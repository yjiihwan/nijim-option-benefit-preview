'use strict';
// 금액·문구는 시안 v2(_src/build.py)와 같은 식으로 계산한다. 숫자 데이터는 시안용 예시(캡처 실제값/추론값은 README_SPEC 4번).
const MEM = { name: '헬스', period: '2026-10-22 ~ 2027-04-21', base: 445000, months: 6 };
const EVENT = { name: '연말 D-100 챌린지 이벤트', amount: 89000 };
const COUPON = { count: 2, max: 20000 };
const RATE = 0.012;
const PCT_MIN = 5; // 반올림한 할인율이 이 값 미만이면 «n%↓»를 숨긴다(금액은 항상 보임)

// 센터가 설정한 순서 그대로. 앱에서 다시 정렬하지 않는다.
const OPTIONS = [
  ['개인락카', { 1: 10000, 3: 27000, 6: 50000 }],
  ['운동복+수건', { 1: 12000, 3: 33000, 6: 60000 }],
  ['주차 정기등록', { 6: 90000 }],
  ['GX 그룹수업 무제한 (요가·스피닝·줌바·바디펌프)', { 1: 30000, 2: 55000, 3: 80000, 6: 150000 }],
  ['샤워용품', { 1: 5000, 6: 27000 }],
  ['PT 1:1 개인레슨 주 2회 (전담 트레이너 배정)', { 1: 440000, 2: 860000, 3: 1250000, 4: 1640000, 5: 2000000, 6: 2400000 }],
  ['인바디 정밀측정', { 3: 15000, 6: 27000 }],
  ['골프 연습타석 (하루 1시간)', { 1: 50000, 2: 98000, 3: 140000, 4: 180000, 6: 270000 }],
  ['단백질 쉐이크 매일 1잔', { 1: 39000, 3: 105000, 6: 198000 }],
  ['대형 보관함 (가방·신발 함께 보관)', { 1: 15000, 3: 42000, 6: 78000 }],
];
const PRESET = { // 옵션 순번(0부터): 개월
  2: { 1: 6 },
  5: { 1: 6, 3: 3 },
  10: { 1: 6, 3: 3, 9: 6 },
};
// 센터 설정 «멤버십 기간과 동일만 가능»을 켠 옵션(조작판 «기간 고정 있음»일 때). 기간은 멤버십 기간(MEM.months)으로 정해진다
const FIXED = [0, 1, 4, 9];
const PRESET_FIX = {
  2: { 0: 6, 1: 6 },
  5: { 0: 6, 1: 6, 3: 3 },
  10: { 0: 6, 1: 6, 3: 3, 9: 6 },
};

const won = (n) => n.toLocaleString('ko-KR');
const pct = (part, whole) => Math.floor((part * 100) / whole + 0.5); // 소수 첫째 자리 반올림(결제창 v1 동일)
const pctTag = (p) => (p >= PCT_MIN ? ` · ${p}%↓` : '');

function calc(n, sel) {
  const opts = OPTIONS.slice(0, n);
  const opt = Object.entries(sel).reduce((a, [i, m]) => a + opts[i][1][m], 0);
  const gross = MEM.base + opt;
  const event = EVENT.amount;
  const pay = gross - event;
  return {
    n, sel, opt, gross, event, pay,
    pctTotal: pct(event, gross),      // 하단 바: 할인 ÷ 합계
    pctMem: pct(event, MEM.base),     // 이벤트 줄: 할인 ÷ 멤버십 정가
    earn: Math.floor(pay * RATE),     // 1.2% 원 단위 버림
  };
}

const all6 = (n) => Object.fromEntries(OPTIONS.slice(0, n).map((_, i) => [i, 6]));

(function selfCheck() { // README_SPEC 4번 표
  const t2 = calc(2, PRESET[2]), t5 = calc(5, PRESET[5]), t10 = calc(10, PRESET[10]), ta = calc(10, all6(10));
  const ok = t2.opt === 60000 && t2.gross === 505000 && t2.pay === 416000 && t2.pctTotal === 18 && t2.earn === 4992
    && t5.opt === 140000 && t5.gross === 585000 && t5.pay === 496000 && t5.pctTotal === 15 && t5.earn === 5952
    && t10.opt === 218000 && t10.gross === 663000 && t10.pay === 574000 && t10.pctTotal === 13 && t10.earn === 6888
    && ta.opt === 3350000 && ta.gross === 3795000 && ta.pay === 3706000 && ta.pctTotal === 2 && ta.earn === 44472
    && pctTag(ta.pctTotal) === '' && pctTag(t2.pctTotal) === ' · 18%↓' && pctTag(5) === ' · 5%↓' && pctTag(4) === ''
    && calc(2, PRESET_FIX[2]).pay === 466000 && calc(2, PRESET_FIX[2]).pctTotal === 16 && calc(2, PRESET_FIX[2]).earn === 5592
    && calc(5, PRESET_FIX[5]).pay === 546000 && calc(5, PRESET_FIX[5]).pctTotal === 14 && calc(5, PRESET_FIX[5]).earn === 6552
    && calc(10, PRESET_FIX[10]).pay === 624000 && calc(10, PRESET_FIX[10]).pctTotal === 12 && calc(10, PRESET_FIX[10]).earn === 7488
    && FIXED.every((i) => OPTIONS[i][1][MEM.months] !== undefined)
    && calc(2, {}).pctMem === 20 && OPTIONS.slice(0, 2).every(([, p]) => Math.max(...Object.values(p)) < 100000);
  if (!ok) throw new Error('금액 검산 불일치');
  window.__selfCheck = 'ok';
})();

const IC = {
  event: '<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="10" fill="#FDECEC"/><path d="M5.5 5.5h4.6l4.4 4.4-4.6 4.6-4.4-4.4z" fill="none" stroke="#E5342B" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="8" r="1" fill="#E5342B"/></svg>',
  coupon: '<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="10" fill="#E8F1FC"/><path d="M5 7h10v2a1.2 1.2 0 0 0 0 2.4V13H5v-1.6a1.2 1.2 0 0 0 0-2.4z" fill="none" stroke="#1A73D9" stroke-width="1.4" stroke-linejoin="round"/><path d="M11 7.5v5" stroke="#1A73D9" stroke-width="1.2" stroke-dasharray="1.2 1.2"/></svg>',
  pearn: '<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="10" fill="#00A870"/><text x="9" y="13.6" text-anchor="middle" font-family="Pretendard" font-weight="800" font-size="10" fill="#fff">P</text><path d="M14.2 4.6v3.6M12.4 6.4H16" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.2 6.2l2.4 2.4L9.8 3.4" fill="none" stroke="#FE2167" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock: '<svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="5.2" width="8" height="5.6" rx="1.2" fill="#8A8A8A"/><path d="M3.9 5.2V3.9a2.1 2.1 0 0 1 4.2 0v1.3" fill="none" stroke="#8A8A8A" stroke-width="1.3"/></svg>',
  box: '<svg width="22" height="22" viewBox="0 0 22 22"><rect x="1" y="1" width="20" height="20" rx="5" fill="#fff" stroke="#C9C9CF" stroke-width="1.5"/></svg>',
  boxOn: '<svg width="22" height="22" viewBox="0 0 22 22"><rect x="0.5" y="0.5" width="21" height="21" rx="5.5" fill="#FE2167"/><path d="M6 11.2l3.3 3.3L16.2 7.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg width="14" height="22"><path d="M11 2 2 11l9 9" fill="none" stroke="#3B4256" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const STATUS = '<div class="sb"><span>4:35</span><span class="r"><svg width="22" height="14"><rect x="0" y="9" width="4" height="5" rx="1"/><rect x="6" y="6" width="4" height="8" rx="1"/><rect x="12" y="3" width="4" height="11" rx="1"/><rect x="18" y="0" width="4" height="14" rx="1"/></svg>LTE<svg width="28" height="14"><rect x="0.5" y="0.5" width="24" height="13" rx="4" fill="none" stroke="#999"/><rect x="2" y="2" width="12" height="10" rx="2.5"/><rect x="25.5" y="4.5" width="2" height="5" rx="1" fill="#999"/></svg></span></div>';

function secInner(s) {
  const k = Object.keys(s.sel).length;
  const cnt = k ? `<span class="n">${k}개 선택</span>` : '<span class="n z">선택 안 함</span>';
  const sum = k ? `<span class="s">옵션 <b>+${won(s.opt)}원</b></span>` : '';
  return `<span class="t">기타옵션 ${s.n}</span>${cnt}${sum}`;
}

function fixedHtml([name, prices], i, s) {
  const on = s.sel[i] === MEM.months, m = MEM.months, p = prices[m];
  const right = on ? `${m}개월 · <b>+${won(p)}원</b>` : '선택 안 함';
  return `<div class="ob fx${on ? ' in' : ''}"><div class="oh"><button class="ck" data-fix="${i}" role="checkbox" aria-checked="${on}" aria-label="${name} 넣기">${on ? IC.boxOn : IC.box}<span class="n">${name}</span></button><span class="r">${right}</span></div>`
    + `<div class="fxp"><span class="l">${m}개월 · 멤버십과 동일</span><span class="w">${won(p)}원</span></div>`
    + `<div class="fxn">${IC.lock}멤버십 기간과 같은 기간만 선택할 수 있어요</div></div>`;
}

function optionHtml(o, i, s) {
  if (s.fixed.includes(i)) return fixedHtml(o, i, s);
  const [name, prices] = o;
  const sel = s.sel[i];
  const right = sel ? `${sel}개월 · <b>+${won(prices[sel])}원</b>` : '선택 안 함';
  const two = Math.max(...Object.values(prices)) >= 100000 ? ' two' : '';
  const chips = Object.entries(prices).map(([m, p]) => {
    const on = Number(m) === sel;
    return `<button class="cb${on ? ' on' : ''}" data-i="${i}" data-m="${m}" aria-pressed="${on}">${on ? IC.check : ''}<span>${m}개월</span> <span class="w">${won(p)}원</span></button>`;
  }).join('');
  return `<div class="ob"><div class="oh"><span class="n">${name}</span><span class="r">${right}</span></div><div class="chips${two}">${chips}</div></div>`;
}

function view(s) {
  return `
  <div class="top">${STATUS}<div class="hd"><span class="bk" aria-label="뒤로">${IC.back}</span>옵션선택</div>
    <div class="stk" aria-hidden="true">${secInner(s)}</div></div>
  <div class="main"><div class="wrap">
    <div class="row"><span class="k">멤버십</span><span class="v">${MEM.name}</span><div class="pr"><span class="st">${won(MEM.base)}원</span> <span class="p">${won(MEM.base - s.event)}원</span></div></div>
    <div class="evrow">${IC.event}<div class="t"><span class="c">이벤트 할인</span><div class="s">${EVENT.name}</div></div><span class="chip">${won(s.event)}원 할인${pctTag(s.pctMem)}</span></div>
    <div class="row"><span class="k">이용기간</span><span class="v">${MEM.period}</span></div>
    <div class="cprow">${IC.coupon}<div class="t"><span class="c">쓸 수 있는 쿠폰 ${COUPON.count}장</span> · 최대 <b>${won(COUPON.max)}원</b> 더 할인<div class="s">다음 결제 단계에서 골라 쓸 수 있어요</div></div></div>
    <div class="sec2">${secInner(s)}</div><div class="hint">${s.fixed.length === s.n ? '체크해서 옵션을 넣거나 뺄 수 있어요' : '기간을 눌러 바로 선택 · 한 번 더 누르면 해제돼요'}</div>
    <div class="olist">${OPTIONS.slice(0, s.n).map((o, i) => optionHtml(o, i, s)).join('')}</div>
    <div class="pad"></div>
  </div></div>
  <div class="bar">
    <div class="l1"><span class="st">${won(s.gross)}원</span><span class="dc">${won(s.event)}원 할인${pctTag(s.pctTotal)}</span></div>
    <div class="l2"><span class="k">합계총액</span><span class="v">${won(s.pay)}<small>원</small></span></div>
    <div class="l3">${IC.pearn}결제하면 <b>${won(s.earn)}P</b> 적립돼요</div>
    <button class="cta" data-act="done">선택완료</button></div>`;
}

const qs = new URLSearchParams(location.search);
if (qs.get('shot') === '1') document.body.classList.add('shot');
const N0 = [2, 5, 10].includes(Number(qs.get('n'))) ? Number(qs.get('n')) : 10;
function selFor(n, kind, fix) {
  if (kind === 'none') return {};
  if (kind === 'all6') return all6(n);
  return { ...(fix ? PRESET_FIX : PRESET)[n] };
}
const fixedFor = (st) => (st.fix ? FIXED.filter((i) => i < st.n) : []);
const state = { n: N0, kind: qs.get('sel') || 'preset', fix: qs.get('fix') === '1' };
state.sel = selFor(state.n, state.kind, state.fix);
const app = document.getElementById('app');

function updateSticky() {
  const sec = app.querySelector('.sec2'), top = app.querySelector('.top'), stk = app.querySelector('.stk');
  if (!sec) return;
  stk.classList.toggle('on', sec.getBoundingClientRect().top < top.getBoundingClientRect().bottom);
}

function render() {
  app.innerHTML = view({ ...calc(state.n, state.sel), fixed: fixedFor(state) });
  document.querySelectorAll('#seg-n button').forEach((b) => b.classList.toggle('on', Number(b.dataset.n) === state.n));
  document.querySelectorAll('#seg-sel button').forEach((b) => b.classList.toggle('on', b.dataset.sel === state.kind));
  document.querySelectorAll('#seg-fix button').forEach((b) => b.classList.toggle('on', (b.dataset.fix === '1') === state.fix));
  updateSticky();
}

document.getElementById('seg-n').addEventListener('click', (e) => {
  const n = Number(e.target.closest('button')?.dataset.n);
  if (!n) return;
  state.n = n; state.kind = 'preset'; state.sel = selFor(n, 'preset', state.fix);
  render(); window.scrollTo(0, 0);
});
document.getElementById('seg-sel').addEventListener('click', (e) => {
  const k = e.target.closest('button')?.dataset.sel;
  if (!k) return;
  state.kind = k; state.sel = selFor(state.n, k, state.fix);
  render();
});
document.getElementById('seg-fix').addEventListener('click', (e) => {
  const f = e.target.closest('button')?.dataset.fix;
  if (f === undefined) return;
  state.fix = f === '1'; state.kind = 'preset'; state.sel = selFor(state.n, 'preset', state.fix);
  render();
});
app.addEventListener('click', (e) => {
  const ck = e.target.closest('.ck');
  if (ck) { // 기간 고정 옵션은 넣기/빼기만. 기간은 멤버십 기간 그대로
    const i = Number(ck.dataset.fix);
    if (state.sel[i] === MEM.months) delete state.sel[i]; else state.sel[i] = MEM.months;
    state.kind = 'custom';
    render();
    return;
  }
  const cb = e.target.closest('.cb');
  if (cb) {
    const i = Number(cb.dataset.i), m = Number(cb.dataset.m);
    if (state.sel[i] === m) delete state.sel[i]; else state.sel[i] = m;
    state.kind = 'custom';
    render();
    return;
  }
  if (e.target.closest('[data-act="done"]')) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = '다음 단계(결제진행)로 이동 — 프로토타입은 여기까지';
    document.body.appendChild(t); setTimeout(() => t.remove(), 1600);
  }
});
window.addEventListener('scroll', updateSticky, { passive: true });
window.addEventListener('resize', updateSticky);

render();
const pos = qs.get('pos');
if (pos === 'end' || pos === 'mid') {
  const go = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo(0, pos === 'end' ? max : Math.round(max / 2));
    updateSticky();
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
}
