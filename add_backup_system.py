import codecs

filepath = 'c:/Users/OMC/isp-erp-system/frontend/src/views/SelectSystemView.vue'

with codecs.open(filepath, 'r', 'utf-8') as f:
    content = f.read()

old_code = '''    { id: 'installments', nameAr: 'نظام الأقساط', desc: 'البيع بالتقسيط وإدارة العقود والدفعات', icon: 'fas fa-hand-holding-usd', color: '#6366F1', route: '/installments' },
  ];'''

new_code = '''    { id: 'installments', nameAr: 'نظام الأقساط', desc: 'البيع بالتقسيط وإدارة العقود والدفعات', icon: 'fas fa-hand-holding-usd', color: '#6366F1', route: '/installments' },
    { id: 'backup', nameAr: 'نظام النسخ الاحتياطي', desc: 'حماية واستعادة بيانات المنظومة والربط السحابي', icon: 'fas fa-database', color: '#374151', route: '/backup' },
  ];'''

if old_code in content:
    content = content.replace(old_code, new_code)
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)
    print("Backup system appended to SelectSystemView.vue successfully.")
else:
    print("Could not find the target code to replace.")

