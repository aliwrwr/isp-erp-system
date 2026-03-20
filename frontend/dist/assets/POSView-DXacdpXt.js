import{t as e}from"./api-BQPyFYPe.js";import{B as t,C as n,T as r,ft as i,h as a,j as o,l as s,o as c,p as l,r as u,s as d,u as f,ut as p,x as m}from"./runtime-core.esm-bundler-DJfhPO9U.js";import{l as h,u as g}from"./index-5JLAL7Wh.js";var _={class:`h-full flex flex-col`},v={class:`flex items-center justify-between mb-4`},y={class:`text-xs text-gray-400`},b={class:`flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0`},x={class:`lg:col-span-2 flex flex-col`},S={class:`flex gap-2 mb-3 overflow-x-auto pb-1`},ee=[`onClick`],te=[`src`],ne={class:`flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 content-start`},re=[`onClick`],ie={class:`w-full h-24 bg-gradient-to-br from-restaurant/10 to-restaurant/5 flex items-center justify-center overflow-hidden`},ae=[`src`],oe={key:1,class:`fas fa-utensils text-2xl text-restaurant/30`},se={class:`p-2`},ce={class:`text-xs font-bold text-secondary truncate`},le={class:`text-xs font-bold text-restaurant`},ue={class:`bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden`},de={class:`p-2 border-b border-gray-100 bg-gray-50`},fe={class:`grid grid-cols-4 gap-1 bg-gray-200/60 p-1 rounded-xl`},pe=[`onClick`],me={class:`text-[10px] leading-tight`},he={key:0,class:`px-3 pt-2 space-y-1.5`},ge={key:0},_e=[`value`],ve={class:`flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0 mt-2`},ye={key:0,class:`flex flex-col items-center justify-center h-full text-gray-300 py-10`},be={class:`flex-1 min-w-0`},xe={class:`text-xs font-bold text-secondary truncate`},Se={class:`text-[10px] text-gray-400`},Ce={class:`flex items-center gap-0.5`},we=[`onClick`],Te={class:`w-6 text-center text-xs font-black text-secondary`},Ee=[`onClick`],De={class:`text-xs font-black text-restaurant w-16 text-left`},Oe={class:`border-t border-gray-100 p-3 space-y-2 bg-gray-50/50`},ke={class:`flex justify-between text-xs text-gray-500`},C={class:`font-medium`},w={class:`flex items-center gap-2`},Ae=[`max`],je={class:`flex justify-between items-center bg-restaurant/5 border border-restaurant/10 rounded-xl px-3 py-2`},Me={class:`text-xl font-black text-restaurant`},Ne={class:`grid grid-cols-3 gap-1`},Pe=[`onClick`],Fe={key:0,class:`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2`},Ie={class:`flex gap-2 pt-1`},Le=[`disabled`],Re=[`disabled`],T=a({__name:`POSView`,setup(a){let T=t(``),E=t(``),D=t(``),O=t(``),k=t(`د.ع`),A=t(!1),j=t(0),M=t(`شكراً لزيارتكم 🙏`),N=t(`80mm`),P=t([]),F=t([]),I=t([]),L=t(null),R=t(`direct`),z=t(``),B=t(``),V=t(``),H=t(``),U=t([]),W=t(0),G=t(`cash`),K=t(0),q=t(!1),ze=[{value:`direct`,label:`مباشر`,icon:`fas fa-bolt`},{value:`takeaway`,label:`سفري`,icon:`fas fa-shopping-bag`},{value:`delivery`,label:`توصيل`,icon:`fas fa-motorcycle`},{value:`dine-in`,label:`صالة`,icon:`fas fa-chair`}],Be=[{value:`cash`,label:`نقداً`,icon:`fas fa-money-bill-wave`},{value:`card`,label:`بطاقة`,icon:`fas fa-credit-card`},{value:`credit`,label:`آجل`,icon:`fas fa-file-invoice-dollar`}],Ve=c(()=>new Date().toLocaleDateString(`ar-IQ`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`})),He=c(()=>{let e=F.value.filter(e=>e.available);return L.value?e.filter(e=>e.category?.id===L.value):e}),J=c(()=>I.value.filter(e=>e.status===`available`)),Y=c(()=>U.value.reduce((e,t)=>e+t.price*t.quantity,0)),X=c(()=>A.value?Math.round(Y.value*j.value/100):0),Z=c(()=>Math.max(0,Y.value-(W.value||0)+X.value));function Ue(e){R.value=e,z.value=``,B.value=``,V.value=``,H.value=``}async function Q(){let[t,n,r,i]=await Promise.all([e.get(`/restaurant/categories`),e.get(`/restaurant/menu`),e.get(`/restaurant/tables`),e.get(`/system-settings`)]);P.value=t.data,F.value=n.data,I.value=r.data;let a=i.data;T.value=a.restaurantName||a.companyName||``,E.value=a.restaurantPhone||a.companyPhone||``,D.value=a.restaurantAddress||a.companyAddress||``,O.value=a.restaurantLogoBase64||a.logoBase64||``,k.value=a.receiptCurrency||a.currency||`د.ع`,A.value=a.taxEnabled??!1,j.value=Number(a.taxRate)||0,M.value=a.receiptFooter||`شكراً لزيارتكم 🙏`,N.value=a.receiptPaperSize||`80mm`}function We(e){let t=U.value.find(t=>t.id===e.id);t?t.quantity++:U.value.push({id:e.id,name:e.name,price:Number(e.price),quantity:1})}function $(){U.value=[],W.value=0,K.value=0,z.value=``,B.value=``,V.value=``,H.value=``}function Ge(){let e=new Date,t=e.toLocaleDateString(`ar-IQ`,{year:`numeric`,month:`2-digit`,day:`2-digit`}),n=e.toLocaleTimeString(`ar-IQ`,{hour:`2-digit`,minute:`2-digit`}),r=`ORD-`+Date.now().toString().slice(-6),i=k.value||`د.ع`,a={direct:`بيع مباشر`,takeaway:`سفري`,delivery:`توصيل`,"dine-in":`صالة`},o={direct:`⚡`,takeaway:`🛍`,delivery:`🏍`,"dine-in":`🪑`},s={cash:`نقداً`,card:`بطاقة`,credit:`آجل`},c={cash:`💵`,card:`💳`,credit:`📋`},l=a[R.value]??R.value,u=o[R.value]??``,d=s[G.value]??G.value,f=c[G.value]??``,p=`<div class="sep"></div>`,m=`<div class="sep-dash"></div>`,h=O.value?`<img src="${O.value}" class="logo" alt="logo" />`:``,g=``;if(R.value===`dine-in`&&H.value){let e=I.value.find(e=>e.id===H.value);g+=`<tr><td class="lbl">الطاولة</td><td class="val">🪑 طاولة ${e?.number??H.value}</td></tr>`}R.value!==`direct`&&(z.value&&(g+=`<tr><td class="lbl">العميل</td><td class="val">${z.value}</td></tr>`),B.value&&(g+=`<tr><td class="lbl">الهاتف</td><td class="val" dir="ltr">${B.value}</td></tr>`),V.value&&(g+=`<tr><td class="lbl">العنوان</td><td class="val">${V.value}</td></tr>`));let _=U.value.map((e,t)=>`
    <tr class="${t%2==0?`row-even`:`row-odd`}">
      <td class="item-name">${e.name}</td>
      <td class="item-qty">${e.quantity}</td>
      <td class="item-price">${e.price.toFixed(0)}</td>
      <td class="item-total">${(e.price*e.quantity).toFixed(0)}</td>
    </tr>`).join(``),v=W.value>0||A.value?`<tr><td colspan="2" class="tot-lbl">المجموع الفرعي</td><td colspan="2" class="tot-val">${Y.value.toFixed(0)} ${i}</td></tr>`:``,y=W.value>0?`<tr class="discount-row"><td colspan="2" class="tot-lbl">الخصم</td><td colspan="2" class="tot-val">− ${Number(W.value).toFixed(0)} ${i}</td></tr>`:``,b=A.value?`<tr><td colspan="2" class="tot-lbl">ضريبة ${j.value}%</td><td colspan="2" class="tot-val">${X.value.toFixed(0)} ${i}</td></tr>`:``,x=G.value===`cash`&&K.value>=Z.value?`${m}
       <table class="tot-table">
         <tr><td colspan="2" class="tot-lbl">المبلغ المستلم</td><td colspan="2" class="tot-val">${Number(K.value).toFixed(0)} ${i}</td></tr>
         <tr class="change-row"><td colspan="2" class="tot-lbl">الباقي</td><td colspan="2" class="tot-val">${(K.value-Z.value).toFixed(0)} ${i}</td></tr>
       </table>`:``,S=window.open(``,`_blank`,`width=340,height=700,menubar=no,toolbar=no,location=no,status=no`);S&&(S.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>فاتورة - ${T.value||`مطعم`}</title>
  <style>
    /* ═══════════════════════════════════════
       THERMAL PAPER RECEIPT — 58mm / 80mm
       Page width: 58mm uses ~48mm printable
                   80mm uses ~72mm printable
       Font sizes kept ≤ 11pt for readability
       ═══════════════════════════════════════ */
    @page {
      size: ${N.value} auto;
      margin: 3mm 4mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      color: #000;
      background: #fff;
      width: ${N.value===`58mm`?`48mm`:`72mm`};
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
      body { width: ${N.value===`58mm`?`48mm`:`72mm`}; }
    }
  </style>
</head>
<body>

  <!-- ══ HEADER ══ -->
  <div class="header">
    ${h}
    <div class="shop-name">${T.value||`المطعم`}</div>
    <div class="shop-sub">
      ${D.value?D.value+`<br>`:``}
      ${E.value?`📞 `+E.value:``}
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
    ${b}
    <tr style="border-top:1px solid #000;">
      <td colspan="2" class="tot-lbl grand-label">▶ الإجمالي الكلي</td>
      <td colspan="2" class="tot-val grand-amount">${Z.value.toFixed(0)} ${i}</td>
    </tr>
  </table>

  <!-- ══ CASH CHANGE ══ -->
  ${x}

  ${p}

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <div class="thanks">${M.value}</div>
    <div>نتمنى لكم تجربة طعام رائعة</div>
    <div style="margin-top:4px; font-size:7.5pt; color:#aaa;">
      ${new Date().getFullYear()} © ${T.value||`نظام إدارة المطاعم`}
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
</html>`),S.document.close())}async function Ke(){if(U.value.length!==0){if(R.value===`dine-in`&&!H.value){alert(`الرجاء اختيار الطاولة`);return}if([`takeaway`,`delivery`].includes(R.value)&&!z.value){alert(`الرجاء إدخال اسم العميل`);return}if([`takeaway`,`delivery`].includes(R.value)&&!B.value){alert(`الرجاء إدخال رقم الهاتف`);return}if(R.value===`delivery`&&!V.value){alert(`الرجاء إدخال العنوان`);return}q.value=!0;try{let t={orderType:R.value,customerName:R.value===`direct`?`بيع مباشر`:z.value,phone:B.value||void 0,address:V.value||void 0,totalAmount:Z.value,items:U.value.map(e=>({menuItemId:e.id,quantity:e.quantity}))};R.value===`dine-in`&&H.value&&(t.tableId=H.value),await e.post(`/restaurant/orders`,t),$(),await Q()}catch{alert(`فشل في إرسال الطلب`)}finally{q.value=!1}}}return m(Q),(e,t)=>(n(),f(`div`,_,[d(`div`,v,[t[7]||=d(`h2`,{class:`text-lg font-bold text-secondary flex items-center gap-2`},[d(`i`,{class:`fas fa-cash-register text-restaurant`}),l(` نقطة البيع `)],-1),d(`div`,y,i(Ve.value),1)]),d(`div`,b,[d(`div`,x,[d(`div`,S,[d(`button`,{onClick:t[0]||=e=>L.value=null,class:p([L.value?`bg-white text-gray-600 border border-gray-200`:`bg-restaurant text-white shadow`,`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition min-w-[64px]`])},[...t[8]||=[d(`i`,{class:`fas fa-layer-group text-base`},null,-1),d(`span`,null,`الكل`,-1)]],2),(n(!0),f(u,null,r(P.value,e=>(n(),f(`button`,{key:e.id,onClick:t=>L.value=e.id,class:p([L.value===e.id?`bg-restaurant text-white shadow`:`bg-white text-gray-600 border border-gray-200`,`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition min-w-[64px]`])},[e.image?(n(),f(`img`,{key:0,src:e.image,class:`w-7 h-7 rounded-lg object-cover`},null,8,te)):(n(),f(`i`,{key:1,class:p([e.icon||`fas fa-folder`,`text-base`])},null,2)),d(`span`,null,i(e.name),1)],10,ee))),128))]),d(`div`,ne,[(n(!0),f(u,null,r(He.value,e=>(n(),f(`button`,{key:e.id,onClick:t=>We(e),class:p([`bg-white rounded-xl border border-gray-100 overflow-hidden text-center hover:shadow-md hover:border-restaurant/30 transition active:scale-95`,{"opacity-40 pointer-events-none":!e.available}])},[d(`div`,ie,[e.image?(n(),f(`img`,{key:0,src:e.image,class:`w-full h-full object-cover`},null,8,ae)):(n(),f(`i`,oe))]),d(`div`,se,[d(`p`,ce,i(e.name),1),d(`p`,le,i(Number(e.price).toFixed(2))+` د.ع`,1)])],10,re))),128))])]),d(`div`,ue,[d(`div`,de,[d(`div`,fe,[(n(),f(u,null,r(ze,e=>d(`button`,{key:e.value,onClick:t=>Ue(e.value),class:p([R.value===e.value?`bg-white shadow-sm text-restaurant`:`text-gray-500 hover:text-gray-700`,`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-xs font-medium transition-all`])},[d(`i`,{class:p([e.icon,`text-sm`])},null,2),d(`span`,me,i(e.label),1)],10,pe)),64))])]),R.value===`direct`?s(``,!0):(n(),f(`div`,he,[R.value===`dine-in`?(n(),f(`div`,ge,[o(d(`select`,{"onUpdate:modelValue":t[1]||=e=>H.value=e,class:`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},[t[9]||=d(`option`,{value:``},`🪑 اختر الطاولة...`,-1),(n(!0),f(u,null,r(J.value,e=>(n(),f(`option`,{key:e.id,value:e.id},`طاولة `+i(e.number)+i(e.capacity?` — ${e.capacity} أشخاص`:``),9,_e))),128))],512),[[h,H.value,void 0,{number:!0}]])])):(n(),f(u,{key:1},[o(d(`input`,{"onUpdate:modelValue":t[2]||=e=>z.value=e,placeholder:`👤 اسم العميل`,class:`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},null,512),[[g,z.value]]),o(d(`input`,{"onUpdate:modelValue":t[3]||=e=>B.value=e,type:`tel`,placeholder:`📞 رقم الهاتف`,class:`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},null,512),[[g,B.value]]),R.value===`delivery`?o((n(),f(`input`,{key:0,"onUpdate:modelValue":t[4]||=e=>V.value=e,placeholder:`📍 العنوان / الموقع`,class:`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},null,512)),[[g,V.value]]):s(``,!0)],64))])),d(`div`,ve,[U.value.length===0?(n(),f(`div`,ye,[...t[10]||=[d(`i`,{class:`fas fa-shopping-basket text-3xl mb-2`},null,-1),d(`p`,{class:`text-xs`},`أضف أصنافاً لبدء الطلب`,-1)]])):s(``,!0),(n(!0),f(u,null,r(U.value,(e,t)=>(n(),f(`div`,{key:t,class:`flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl p-2 transition`},[d(`div`,be,[d(`p`,xe,i(e.name),1),d(`p`,Se,i(e.price.toFixed(2))+` × `+i(e.quantity),1)]),d(`div`,Ce,[d(`button`,{onClick:n=>e.quantity>1?e.quantity--:U.value.splice(t,1),class:`w-6 h-6 rounded-lg bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-600 flex items-center justify-center text-xs font-bold transition`},i(e.quantity>1?`−`:`×`),9,we),d(`span`,Te,i(e.quantity),1),d(`button`,{onClick:t=>e.quantity++,class:`w-6 h-6 rounded-lg bg-restaurant/10 hover:bg-restaurant/25 text-restaurant flex items-center justify-center text-xs font-bold transition`},`+`,8,Ee)]),d(`span`,De,i((e.price*e.quantity).toFixed(2)),1)]))),128))]),d(`div`,Oe,[d(`div`,ke,[t[11]||=d(`span`,null,`المجموع الفرعي`,-1),d(`span`,C,i(Y.value.toFixed(2))+` د.ع`,1)]),d(`div`,w,[t[12]||=d(`span`,{class:`text-xs text-gray-500 whitespace-nowrap`},`خصم`,-1),o(d(`input`,{"onUpdate:modelValue":t[5]||=e=>W.value=e,type:`number`,min:`0`,max:Y.value,placeholder:`0`,class:`flex-1 w-0 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center bg-white focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none`},null,8,Ae),[[g,W.value,void 0,{number:!0}]]),t[13]||=d(`span`,{class:`text-xs text-gray-400`},`د.ع`,-1)]),d(`div`,je,[t[15]||=d(`span`,{class:`text-sm font-bold text-secondary`},`الإجمالي`,-1),d(`span`,Me,[l(i(Z.value.toFixed(2))+` `,1),t[14]||=d(`span`,{class:`text-xs font-medium`},`د.ع`,-1)])]),d(`div`,Ne,[(n(),f(u,null,r(Be,e=>d(`button`,{key:e.value,onClick:t=>G.value=e.value,class:p([G.value===e.value?`ring-2 ring-restaurant bg-restaurant text-white shadow-sm`:`bg-white text-gray-600 border border-gray-200 hover:border-restaurant/40`,`py-1.5 rounded-lg text-xs font-medium transition text-center`])},[d(`i`,{class:p([e.icon,`block mb-0.5 text-sm`])},null,2),l(` `+i(e.label),1)],10,Pe)),64))]),G.value===`cash`?(n(),f(`div`,Fe,[t[16]||=d(`i`,{class:`fas fa-coins text-yellow-500 text-sm flex-none`},null,-1),o(d(`input`,{"onUpdate:modelValue":t[6]||=e=>K.value=e,type:`number`,min:`0`,placeholder:`المبلغ المستلم`,class:`flex-1 w-0 text-xs border-none outline-none bg-transparent`},null,512),[[g,K.value,void 0,{number:!0}]]),d(`span`,{class:p([`text-xs font-bold whitespace-nowrap`,K.value>=Z.value?`text-green-600`:`text-gray-400`])},` الباقي: `+i(K.value>=Z.value?(K.value-Z.value).toFixed(2):`—`)+` د.ع `,3)])):s(``,!0),d(`div`,Ie,[d(`button`,{onClick:$,class:`w-10 h-10 flex-none flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-xl transition`,title:`مسح الطلب`},[...t[17]||=[d(`i`,{class:`fas fa-trash text-sm`},null,-1)]]),d(`button`,{onClick:Ge,disabled:U.value.length===0,class:`flex-1 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1`},[...t[18]||=[d(`i`,{class:`fas fa-print`},null,-1),l(` طباعة `,-1)]],8,Le),d(`button`,{onClick:Ke,disabled:U.value.length===0||q.value,class:`flex-1 py-2.5 bg-restaurant hover:opacity-90 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1`},[d(`i`,{class:p(q.value?`fas fa-spinner fa-spin`:`fas fa-check-circle`)},null,2),l(` `+i(q.value?`...`:`إتمام`),1)],8,Re)])])])])]))}});export{T as default};