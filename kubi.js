(async function(){
  const FIXED_DRIVER='tkdgus2121(류상현)';
  const FIXED_CAMP='중동MB';

  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const qs=(s,r=document)=>r.querySelector(s);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const norm=s=>(s||'').replace(/\s+/g,'').toLowerCase();

  const setVal=(el,val)=>{
    if(!el) return;
    el.focus(); el.value=val;
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    el.blur();
  };

  const findItem=(keywords)=>{
    const items=qa('div[role="listitem"]');
    const keys=keywords.map(norm);
    for (const it of items) {
      const t=norm(it.innerText||'');
      if (keys.some(k=>t.includes(k))) return it;
    }
    return null;
  };

  const findText=(it)=>it? qs('input[type="text"],textarea,input.whsOnd,textarea.whsOnd', it):null;

  const clickRadioByText=async(item,label)=>{
    if(!item) return false;
    const radios=qa('[role="radio"]', item);
    const L=norm(label);
    for (const r of radios) {
      const a=norm(r.getAttribute('aria-label')||'');
      const t=norm(r.innerText||'');
      if (a.includes(L) || t.includes(L)) { r.click(); return true; }
    }
    return false;
  };

  const clickButtonByText=async(...labels)=>{
    for (let i=0;i<50;i++){
      const btn = qa('[role="button"]').find(b=>{
        const t=norm(b.innerText||'');
        return labels.some(L=>t.includes(norm(L)));
      });
      if (btn) { btn.click(); return true; }
      await sleep(120);
    }
    return false;
  };

  if (!qs('form')) { alert('구글 설문 폼 페이지에서 실행해 주세요.'); return; }

  const raw = prompt('채팅 원문을 붙여넣어 주세요:\n예)\n운송장번호  995287406960\n주문번호  5100134188161 1','');
  if (raw===null) return;

  // 운송장번호 / 채번 수량 추출
  const wbMatch = /운송장번호\s*([0-9]+)/.exec(raw);
  const waybill = wbMatch ? wbMatch[1] : '';
  const nums = (raw.match(/[0-9]+/g)||[]);
  const qty = nums.length ? nums[nums.length-1] : '';

  // 항목 찾기
  const itWaybill = findItem(['운송장번호']);
  const itDriver  = findItem(['기사님아이디','기사님 아이디','아이디']);
  const itQty     = findItem(['채번수량','채번 수량']);
  const itCamp    = findItem(['요청모바일캠프','요청 모바일 캠프','모바일 캠프']);

  // 값 채우기
  setVal(findText(itWaybill), waybill);
  setVal(findText(itDriver),  FIXED_DRIVER);
  setVal(findText(itQty),     qty);

  // 캠프: 중동MB
  (await clickRadioByText(itCamp, '중동MB')) || setVal(findText(itCamp), '중동MB');

  // 제출 버튼 클릭
  const submitted = await clickButtonByText('제출','제출하기','보내기','submit');
  if (!submitted) alert('입력 완료! 하지만 제출 버튼을 찾지 못했습니다.');
  else alert('자동 입력 및 제출 완료!');
})();
