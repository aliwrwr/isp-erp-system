const fs = require('fs');
let c = fs.readFileSync('frontend/src/views/management/ReportsView.vue', 'utf8');

c = c.replace(/\{\s*id:\s*'all',\s*label:\s*'[^']+'\s*\}/, "{ id: 'all', label: 'Çáßá' }");
c = c.replace(/\{\s*id:\s*'internet',\s*label:\s*'[^']+'\s*\}/, "{ id: 'internet', label: 'ÇáÇäÊÑäÊ' }");
c = c.replace(/\{\s*id:\s*'sales',\s*label:\s*'[^']+'\s*\}/, "{ id: 'sales', label: 'ÇáãÈíÚÇÊ' }");
c = c.replace(/\{\s*id:\s*'installments',\s*label:\s*'[^']+'\s*\}/, "{ id: 'installments', label: 'ÇáÇŞÓÇØ' }");
c = c.replace(/\{\s*id:\s*'restaurant',\s*label:\s*'[^']+'\s*\}/, "{ id: 'restaurant', label: 'ÇáãØÚã' }");

c = c.replace(/label:\s*'Ø§Ù„ÙŠÙˆÙ…'/g, "label: 'Çáíæã'");
c = c.replace(/label:\s*'Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹'/g, "label: 'åĞÇ ÇáÃÓÈæÚ'");
c = c.replace(/label:\s*'Ù‡Ø°Ø§ Ø§Ù„Ø´Ù‡Ø±'/g, "label: 'åĞÇ ÇáÔåÑ'");
c = c.replace(/label:\s*'Ù‡Ø°Ø§ Ø§Ù„Ø¹Ø§Ù…'/g, "label: 'åĞÇ ÇáÚÇã'");

fs.writeFileSync('frontend/src/views/management/ReportsView.vue', c, 'utf8');
console.log('Fixed Encoding');
