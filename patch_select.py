import codecs

with codecs.open('c:/Users/OMC/isp-erp-system/frontend/src/views/SelectSystemView.vue', 'r', 'utf-8') as f:
    text = f.read()

target = '''  { id: 'installments', nameAr: 'نظام الأقساط', desc: 'البيع بالتقسيط وإدارة العقود والدفعات', icon: 'fas fa-hand-holding-usd', color: '#6366F1', route: '/installments' },
];'''

new_str = '''  { id: 'installments', nameAr: 'نظام الأقساط', desc: 'البيع بالتقسيط وإدارة العقود والدفعات', icon: 'fas fa-hand-holding-usd', color: '#6366F1', route: '/installments' },
  { id: 'backup', nameAr: 'نظام النسخ الاحتياطي', desc: 'استعادة وتأمين بيانات النظام بشكل كامل متصل بالسحابة', icon: 'fas fa-database', color: '#34495E', route: '/backup' },
];'''

text = text.replace(target, new_str)

with codecs.open('c:/Users/OMC/isp-erp-system/frontend/src/views/SelectSystemView.vue', 'w', 'utf-8') as f:
    f.write(text)

print('SelectSystemView updated')
