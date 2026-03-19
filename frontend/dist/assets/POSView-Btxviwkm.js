import{t as e}from"./api-BQPyFYPe.js";import{B as t,C as n,T as r,ft as i,h as a,j as o,l as s,o as c,p as l,r as u,s as d,u as f,ut as p,x as m}from"./runtime-core.esm-bundler-DJfhPO9U.js";import{l as h,u as g}from"./index-BSzyO7q5.js";var _={class:`h-full flex flex-col`},v={class:`flex items-center justify-between mb-4`},y={class:`text-xs text-gray-400`},b={class:`flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0`},x={class:`lg:col-span-2 flex flex-col`},ee={class:`flex gap-2 mb-3 overflow-x-auto pb-1`},te=[`onClick`],ne=[`src`],re={class:`flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 content-start`},ie=[`onClick`],ae={class:`w-full h-24 bg-gradient-to-br from-restaurant/10 to-restaurant/5 flex items-center justify-center overflow-hidden`},oe=[`src`],se={key:1,class:`fas fa-utensils text-2xl text-restaurant/30`},ce={class:`p-2`},le={class:`text-xs font-bold text-secondary truncate`},ue={class:`text-xs font-bold text-restaurant`},de={class:`bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden`},fe={class:`p-2 border-b border-gray-100 bg-gray-50`},pe={class:`grid grid-cols-4 gap-1 bg-gray-200/60 p-1 rounded-xl`},me=[`onClick`],he={class:`text-[10px] leading-tight`},ge={key:0,class:`px-3 pt-2 space-y-1.5`},_e={key:0},ve=[`value`],ye={class:`flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0 mt-2`},be={key:0,class:`flex flex-col items-center justify-center h-full text-gray-300 py-10`},xe={class:`flex-1 min-w-0`},Se={class:`text-xs font-bold text-secondary truncate`},Ce={class:`text-[10px] text-gray-400`},we={class:`flex items-center gap-0.5`},S=[`onClick`],C={class:`w-6 text-center text-xs font-black text-secondary`},w=[`onClick`],T={class:`text-xs font-black text-restaurant w-16 text-left`},E={class:`border-t border-gray-100 p-3 space-y-2 bg-gray-50/50`},D={class:`flex justify-between text-xs text-gray-500`},O={class:`font-medium`},k={class:`flex items-center gap-2`},Te=[`max`],Ee={class:`flex justify-between items-center bg-restaurant/5 border border-restaurant/10 rounded-xl px-3 py-2`},De={class:`text-xl font-black text-restaurant`},Oe={class:`grid grid-cols-3 gap-1`},ke=[`onClick`],Ae={key:0,class:`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2`},je={class:`flex gap-2 pt-1`},Me=[`disabled`],Ne=[`disabled`],A=a({__name:`POSView`,setup(a){let A=t(``),j=t(``),M=t(``),N=t(``),P=t(`د.ع`),F=t([]),I=t([]),L=t([]),R=t(null),z=t(`direct`),B=t(``),V=t(``),H=t(``),U=t(``),W=t([]),G=t(0),K=t(`cash`),q=t(0),J=t(!1),Pe=[{value:`direct`,label:`مباشر`,icon:`fas fa-bolt`},{value:`takeaway`,label:`سفري`,icon:`fas fa-shopping-bag`},{value:`delivery`,label:`توصيل`,icon:`fas fa-motorcycle`},{value:`dine-in`,label:`صالة`,icon:`fas fa-chair`}],Fe=[{value:`cash`,label:`نقداً`,icon:`fas fa-money-bill-wave`},{value:`card`,label:`بطاقة`,icon:`fas fa-credit-card`},{value:`credit`,label:`آجل`,icon:`fas fa-file-invoice-dollar`}],Y=c(()=>new Date().toLocaleDateString(`ar-IQ`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`})),Ie=c(()=>{let e=I.value.filter(e=>e.available);return R.value?e.filter(e=>e.category?.id===R.value):e}),Le=c(()=>L.value.filter(e=>e.status===`available`)),X=c(()=>W.value.reduce((e,t)=>e+t.price*t.quantity,0)),Z=c(()=>Math.max(0,X.value-(G.value||0)));function Re(e){z.value=e,B.value=``,V.value=``,H.value=``,U.value=``}async function Q(){let[t,n,r,i]=await Promise.all([e.get(`/restaurant/categories`),e.get(`/restaurant/menu`),e.get(`/restaurant/tables`),e.get(`/system-settings`)]);F.value=t.data,I.value=n.data,L.value=r.data;let a=i.data;A.value=a.companyName||``,j.value=a.companyPhone||``,M.value=a.companyAddress||``,N.value=a.logoBase64||``,P.value=a.currency||`د.ع`}function ze(e){let t=W.value.find(t=>t.id===e.id);t?t.quantity++:W.value.push({id:e.id,name:e.name,price:Number(e.price),quantity:1})}function $(){W.value=[],G.value=0,q.value=0,B.value=``,V.value=``,H.value=``,U.value=``}function Be(){let e=new Date,t=e.toLocaleDateString(`ar-IQ`,{year:`numeric`,month:`2-digit`,day:`2-digit`}),n=e.toLocaleTimeString(`ar-IQ`,{hour:`2-digit`,minute:`2-digit`}),r=`ORD-`+Date.now().toString().slice(-6),i=P.value||`د.ع`,a={direct:`بيع مباشر`,takeaway:`سفري`,delivery:`توصيل`,"dine-in":`صالة`},o={direct:`⚡`,takeaway:`🛍`,delivery:`🏍`,"dine-in":`🪑`},s={cash:`نقداً`,card:`بطاقة`,credit:`آجل`},c={cash:`💵`,card:`💳`,credit:`📋`},l=a[z.value]??z.value,u=o[z.value]??``,d=s[K.value]??K.value,f=c[K.value]??``,p=`<div class="sep"></div>`,m=`<div class="sep-dash"></div>`,h=N.value?`<img src="${N.value}" class="logo" alt="logo" />`:``,g=``;if(z.value===`dine-in`&&U.value){let e=L.value.find(e=>e.id===U.value);g+=`<tr><td class="lbl">الطاولة</td><td class="val">🪑 طاولة ${e?.number??U.value}</td></tr>`}z.value!==`direct`&&(B.value&&(g+=`<tr><td class="lbl">العميل</td><td class="val">${B.value}</td></tr>`),V.value&&(g+=`<tr><td class="lbl">الهاتف</td><td class="val" dir="ltr">${V.value}</td></tr>`),H.value&&(g+=`<tr><td class="lbl">العنوان</td><td class="val">${H.value}</td></tr>`));let _=W.value.map((e,t)=>`
    <tr class="${t%2==0?`row-even`:`row-odd`}">
      <td class="item-name">${e.name}</td>
      <td class="item-qty">${e.quantity}</td>
      <td class="item-price">${e.price.toFixed(0)}</td>
      <td class="item-total">${(e.price*e.quantity).toFixed(0)}</td>
    </tr>`).join(``),v=G.value>0?`<tr><td colspan="2" class="tot-lbl">المجموع الفرعي</td><td colspan="2" class="tot-val">${X.value.toFixed(0)} ${i}</td></tr>`:``,y=G.value>0?`<tr class="discount-row"><td colspan="2" class="tot-lbl">الخصم</td><td colspan="2" class="tot-val">− ${Number(G.value).toFixed(0)} ${i}</td></tr>`:``,b=K.value===`cash`&&q.value>=Z.value?`${m}
       <table class="tot-table">
         <tr><td colspan="2" class="tot-lbl">المبلغ المستلم</td><td colspan="2" class="tot-val">${Number(q.value).toFixed(0)} ${i}</td></tr>
         <tr class="change-row"><td colspan="2" class="tot-lbl">الباقي</td><td colspan="2" class="tot-val">${(q.value-Z.value).toFixed(0)} ${i}</td></tr>
       </table>`:``,x=window.open(``,`_blank`,`width=340,height=700,menubar=no,toolbar=no,location=no,status=no`);x&&(x.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>فاتورة - ${A.value||`مطعم`}</title>
  <style>
    /* ═══════════════════════════════════════
       THERMAL PAPER RECEIPT — 58mm / 80mm
       Page width: 58mm uses ~48mm printable
                   80mm uses ~72mm printable
       Font sizes kept ≤ 11pt for readability
       ═══════════════════════════════════════ */
    @page {
      size: 80mm auto;          /* change to 58mm for 58mm rolls */
      margin: 3mm 4mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      color: #000;
      background: #fff;
      width: 72mm;              /* printable width for 80mm roll */
      direction: rtl;
    }

    /* ── Header ── */
    .header        { text-align: center; padding: 4px 0 2px; }
    .logo          { max-width: 50mm; max-height: 22mm; object-fit: contain; display: block; margin: 0 auto 4px; }
    .shop-name     { font-size: 13pt; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 2px; }
    .shop-sub      { font-size: 8pt; color: #444; line-height: 1.5; }

    /* ── Separators ── */
    .sep      { border-top: 2px solid #000; margin: 5px 0; }
    .sep-dash { border-top: 1px dashed #555; margin: 4px 0; }

    /* ── Receipt title bar ── */
    .receipt-title {
      text-align: center;
      font-size: 11pt;
      font-weight: bold;
      padding: 3px 0;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      margin: 4px 0;
      letter-spacing: 1px;
    }

    /* ── Meta info ── */
    .meta-table    { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 2px; }
    .meta-table td { padding: 1px 2px; vertical-align: top; }
    .lbl           { color: #444; width: 28%; white-space: nowrap; }
    .val           { font-weight: bold; }

    /* ── Order type badge ── */
    .type-badge {
      display: inline-block;
      border: 1px solid #000;
      border-radius: 3px;
      padding: 1px 6px;
      font-size: 9pt;
      font-weight: bold;
      margin: 3px auto;
    }

    /* ── Items table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin: 2px 0;
    }
    .items-table thead tr {
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    .items-table th {
      padding: 2px 2px;
      text-align: right;
      font-size: 8.5pt;
      font-weight: bold;
    }
    .items-table td { padding: 2px 2px; }
    .row-even      { background: #f7f7f7; }
    .row-odd       { background: #fff; }
    .item-name     { text-align: right; max-width: 34mm; word-break: break-word; }
    .item-qty      { text-align: center; width: 8mm; }
    .item-price    { text-align: left;   width: 12mm; direction: ltr; }
    .item-total    { text-align: left;   width: 14mm; direction: ltr; font-weight: bold; }

    /* ── Totals table ── */
    .tot-table     { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    .tot-table td  { padding: 2px 2px; }
    .tot-lbl       { color: #333; }
    .tot-val       { text-align: left; font-weight: bold; direction: ltr; }
    .discount-row  { color: #c0392b; }

    /* ── Grand total ── */
    .grand-row td {
      font-size: 12pt;
      font-weight: 900;
      padding: 3px 2px;
    }
    .grand-label   { font-size: 11pt; }
    .grand-amount  { text-align: left; direction: ltr; }

    /* ── Cash change ── */
    .change-row td { color: #27ae60; font-weight: bold; }

    /* ── Payment ── */
    .payment-line {
      text-align: center;
      font-size: 8.5pt;
      padding: 2px 0;
      border: 1px dashed #999;
      border-radius: 3px;
      margin: 3px 0;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      font-size: 8pt;
      color: #555;
      padding: 6px 0 2px;
      line-height: 1.6;
    }
    .footer .thanks {
      font-size: 10pt;
      font-weight: bold;
      color: #000;
    }
    .barcode-placeholder {
      text-align: center;
      letter-spacing: 3px;
      font-size: 7pt;
      color: #999;
      margin-top: 4px;
    }

    /* ── Print trigger ── */
    @media print {
      body { width: 72mm; }
    }
  </style>
</head>
<body>

  <!-- ══ HEADER ══ -->
  <div class="header">
    ${h}
    <div class="shop-name">${A.value||`المطعم`}</div>
    <div class="shop-sub">
      ${M.value?M.value+`<br>`:``}
      ${j.value?`📞 `+j.value:``}
    </div>
  </div>

  <!-- ══ RECEIPT TITLE ══ -->
  <div class="receipt-title">★ فاتورة ★</div>

  <!-- ══ META INFO ══ -->
  <table class="meta-table">
    <tr>
      <td class="lbl">التاريخ</td>
      <td class="val">${t}</td>
      <td class="lbl" style="text-align:center">الوقت</td>
      <td class="val" dir="ltr">${n}</td>
    </tr>
    <tr>
      <td class="lbl">رقم الطلب</td>
      <td class="val" colspan="3" dir="ltr">${r}</td>
    </tr>
  </table>

  ${m}

  <!-- ══ ORDER TYPE ══ -->
  <div style="text-align:center; margin: 3px 0;">
    <span class="type-badge">${u} ${l}</span>
    &nbsp;
    <span class="payment-line" style="display:inline-block;padding:1px 8px;">${f} ${d}</span>
  </div>

  <!-- ══ ORDER DETAILS (customer/table) ══ -->
  ${g?`${m}<table class="meta-table">${g}</table>`:``}

  ${p}

  <!-- ══ ITEMS TABLE ══ -->
  <table class="items-table">
    <thead>
      <tr>
        <th class="item-name">الصنف</th>
        <th class="item-qty">كمية</th>
        <th class="item-price">سعر</th>
        <th class="item-total">إجمالي</th>
      </tr>
    </thead>
    <tbody>
      ${_}
    </tbody>
  </table>

  ${p}

  <!-- ══ TOTALS ══ -->
  <table class="tot-table">
    ${v}
    ${y}
    <tr style="border-top:1px solid #000;">
      <td colspan="2" class="tot-lbl grand-label">▶ الإجمالي الكلي</td>
      <td colspan="2" class="tot-val grand-amount">${Z.value.toFixed(0)} ${i}</td>
    </tr>
  </table>

  <!-- ══ CASH CHANGE ══ -->
  ${b}

  ${p}

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <div class="thanks">شكراً لكم 🙏</div>
    <div>نتمنى لكم تجربة طعام رائعة</div>
    <div style="margin-top:4px; font-size:7.5pt; color:#aaa;">
      ${new Date().getFullYear()} © ${A.value||`نظام إدارة المطاعم`}
    </div>
    <div class="barcode-placeholder">|||||||||||||||||||||||||||||||</div>
  </div>

  <script>
    window.onload = function () {
      window.print();
      setTimeout(function () { window.close(); }, 1200);
    };
  <\/script>
</body>
</html>`),x.document.close())}async function Ve(){if(W.value.length!==0){if(z.value===`dine-in`&&!U.value){alert(`الرجاء اختيار الطاولة`);return}if([`takeaway`,`delivery`].includes(z.value)&&!B.value){alert(`الرجاء إدخال اسم العميل`);return}if([`takeaway`,`delivery`].includes(z.value)&&!V.value){alert(`الرجاء إدخال رقم الهاتف`);return}if(z.value===`delivery`&&!H.value){alert(`الرجاء إدخال العنوان`);return}J.value=!0;try{let t={orderType:z.value,customerName:z.value===`direct`?`بيع مباشر`:B.value,phone:V.value||void 0,address:H.value||void 0,totalAmount:Z.value,items:W.value.map(e=>({menuItemId:e.id,quantity:e.quantity}))};z.value===`dine-in`&&U.value&&(t.tableId=U.value),await e.post(`/restaurant/orders`,t),$(),await Q()}catch{alert(`فشل في إرسال الطلب`)}finally{J.value=!1}}}return m(Q),(e,t)=>(n(),f(`div`,_,[d(`div`,v,[t[7]||=d(`h2`,{class:`text-lg font-bold text-secondary flex items-center gap-2`},[d(`i`,{class:`fas fa-cash-register text-restaurant`}),l(` نقطة البيع `)],-1),d(`div`,y,i(Y.value),1)]),d(`div`,b,[d(`div`,x,[d(`div`,ee,[d(`button`,{onClick:t[0]||=e=>R.value=null,class:p([R.value?`bg-white text-gray-600 border border-gray-200`:`bg-restaurant text-white shadow`,`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition min-w-[64px]`])},[...t[8]||=[d(`i`,{class:`fas fa-layer-group text-base`},null,-1),d(`span`,null,`الكل`,-1)]],2),(n(!0),f(u,null,r(F.value,e=>(n(),f(`button`,{key:e.id,onClick:t=>R.value=e.id,class:p([R.value===e.id?`bg-restaurant text-white shadow`:`bg-white text-gray-600 border border-gray-200`,`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition min-w-[64px]`])},[e.image?(n(),f(`img`,{key:0,src:e.image,class:`w-7 h-7 rounded-lg object-cover`},null,8,ne)):(n(),f(`i`,{key:1,class:p([e.icon||`fas fa-folder`,`text-base`])},null,2)),d(`span`,null,i(e.name),1)],10,te))),128))]),d(`div`,re,[(n(!0),f(u,null,r(Ie.value,e=>(n(),f(`button`,{key:e.id,onClick:t=>ze(e),class:p([`bg-white rounded-xl border border-gray-100 overflow-hidden text-center hover:shadow-md hover:border-restaurant/30 transition active:scale-95`,{"opacity-40 pointer-events-none":!e.available}])},[d(`div`,ae,[e.image?(n(),f(`img`,{key:0,src:e.image,class:`w-full h-full object-cover`},null,8,oe)):(n(),f(`i`,se))]),d(`div`,ce,[d(`p`,le,i(e.name),1),d(`p`,ue,i(Number(e.price).toFixed(2))+` د.ع`,1)])],10,ie))),128))])]),d(`div`,de,[d(`div`,fe,[d(`div`,pe,[(n(),f(u,null,r(Pe,e=>d(`button`,{key:e.value,onClick:t=>Re(e.value),class:p([z.value===e.value?`bg-white shadow-sm text-restaurant`:`text-gray-500 hover:text-gray-700`,`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-xs font-medium transition-all`])},[d(`i`,{class:p([e.icon,`text-sm`])},null,2),d(`span`,he,i(e.label),1)],10,me)),64))])]),z.value===`direct`?s(``,!0):(n(),f(`div`,ge,[z.value===`dine-in`?(n(),f(`div`,_e,[o(d(`select`,{"onUpdate:modelValue":t[1]||=e=>U.value=e,class:`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},[t[9]||=d(`option`,{value:``},`🪑 اختر الطاولة...`,-1),(n(!0),f(u,null,r(Le.value,e=>(n(),f(`option`,{key:e.id,value:e.id},`طاولة `+i(e.number)+i(e.capacity?` — ${e.capacity} أشخاص`:``),9,ve))),128))],512),[[h,U.value,void 0,{number:!0}]])])):(n(),f(u,{key:1},[o(d(`input`,{"onUpdate:modelValue":t[2]||=e=>B.value=e,placeholder:`👤 اسم العميل`,class:`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},null,512),[[g,B.value]]),o(d(`input`,{"onUpdate:modelValue":t[3]||=e=>V.value=e,type:`tel`,placeholder:`📞 رقم الهاتف`,class:`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},null,512),[[g,V.value]]),z.value===`delivery`?o((n(),f(`input`,{key:0,"onUpdate:modelValue":t[4]||=e=>H.value=e,placeholder:`📍 العنوان / الموقع`,class:`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},null,512)),[[g,H.value]]):s(``,!0)],64))])),d(`div`,ye,[W.value.length===0?(n(),f(`div`,be,[...t[10]||=[d(`i`,{class:`fas fa-shopping-basket text-3xl mb-2`},null,-1),d(`p`,{class:`text-xs`},`أضف أصنافاً لبدء الطلب`,-1)]])):s(``,!0),(n(!0),f(u,null,r(W.value,(e,t)=>(n(),f(`div`,{key:t,class:`flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl p-2 transition`},[d(`div`,xe,[d(`p`,Se,i(e.name),1),d(`p`,Ce,i(e.price.toFixed(2))+` × `+i(e.quantity),1)]),d(`div`,we,[d(`button`,{onClick:n=>e.quantity>1?e.quantity--:W.value.splice(t,1),class:`w-6 h-6 rounded-lg bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-600 flex items-center justify-center text-xs font-bold transition`},i(e.quantity>1?`−`:`×`),9,S),d(`span`,C,i(e.quantity),1),d(`button`,{onClick:t=>e.quantity++,class:`w-6 h-6 rounded-lg bg-restaurant/10 hover:bg-restaurant/25 text-restaurant flex items-center justify-center text-xs font-bold transition`},`+`,8,w)]),d(`span`,T,i((e.price*e.quantity).toFixed(2)),1)]))),128))]),d(`div`,E,[d(`div`,D,[t[11]||=d(`span`,null,`المجموع الفرعي`,-1),d(`span`,O,i(X.value.toFixed(2))+` د.ع`,1)]),d(`div`,k,[t[12]||=d(`span`,{class:`text-xs text-gray-500 whitespace-nowrap`},`خصم`,-1),o(d(`input`,{"onUpdate:modelValue":t[5]||=e=>G.value=e,type:`number`,min:`0`,max:X.value,placeholder:`0`,class:`flex-1 w-0 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center bg-white focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},null,8,Te),[[g,G.value,void 0,{number:!0}]]),t[13]||=d(`span`,{class:`text-xs text-gray-400`},`د.ع`,-1)]),d(`div`,Ee,[t[15]||=d(`span`,{class:`text-sm font-bold text-secondary`},`الإجمالي`,-1),d(`span`,De,[l(i(Z.value.toFixed(2))+` `,1),t[14]||=d(`span`,{class:`text-xs font-medium`},`د.ع`,-1)])]),d(`div`,Oe,[(n(),f(u,null,r(Fe,e=>d(`button`,{key:e.value,onClick:t=>K.value=e.value,class:p([K.value===e.value?`ring-2 ring-restaurant bg-restaurant text-white shadow-sm`:`bg-white text-gray-600 border border-gray-200 hover:border-restaurant/40`,`py-1.5 rounded-lg text-xs font-medium transition text-center`])},[d(`i`,{class:p([e.icon,`block mb-0.5 text-sm`])},null,2),l(` `+i(e.label),1)],10,ke)),64))]),K.value===`cash`?(n(),f(`div`,Ae,[t[16]||=d(`i`,{class:`fas fa-coins text-yellow-500 text-sm flex-none`},null,-1),o(d(`input`,{"onUpdate:modelValue":t[6]||=e=>q.value=e,type:`number`,min:`0`,placeholder:`المبلغ المستلم`,class:`flex-1 w-0 text-xs border-none outline-none bg-transparent`},null,512),[[g,q.value,void 0,{number:!0}]]),d(`span`,{class:p([`text-xs font-bold whitespace-nowrap`,q.value>=Z.value?`text-green-600`:`text-gray-400`])},` الباقي: `+i(q.value>=Z.value?(q.value-Z.value).toFixed(2):`—`)+` د.ع `,3)])):s(``,!0),d(`div`,je,[d(`button`,{onClick:$,class:`w-10 h-10 flex-none flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-xl transition`,title:`مسح الطلب`},[...t[17]||=[d(`i`,{class:`fas fa-trash text-sm`},null,-1)]]),d(`button`,{onClick:Be,disabled:W.value.length===0,class:`flex-1 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1`},[...t[18]||=[d(`i`,{class:`fas fa-print`},null,-1),l(` طباعة `,-1)]],8,Me),d(`button`,{onClick:Ve,disabled:W.value.length===0||J.value,class:`flex-1 py-2.5 bg-restaurant hover:opacity-90 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1`},[d(`i`,{class:p(J.value?`fas fa-spinner fa-spin`:`fas fa-check-circle`)},null,2),l(` `+i(J.value?`...`:`إتمام`),1)],8,Ne)])])])])]))}});export{A as default};