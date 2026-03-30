import codecs

filepath = 'c:/Users/OMC/isp-erp-system/frontend/src/views/SelectSystemView.vue'

with codecs.open(filepath, 'r', 'utf-8') as f:
    content = f.read()

# Using a more robust string replace
if "route: '/installments' }," in content and "{ id: 'backup'" not in content:
    content = content.replace(
        "route: '/installments' },",
        "route: '/installments' },\n    { id: 'backup', nameAr: 'نظام النسخ الاحتياطي', desc: 'إدارة وحماية واستعادة النسخ الاحتياطية', icon: 'fas fa-database', color: '#1F2937', route: '/backup' },"
    )
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)
    print("Added Backup system successfully.")
else:
    print("Could not find anchor or it's already there.")

