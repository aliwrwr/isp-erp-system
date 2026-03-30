import codecs

filepath = 'c:/Users/OMC/isp-erp-system/frontend/src/router/index.ts'

with codecs.open(filepath, 'r', 'utf-8') as f:
    content = f.read()

new_route = '''
  {
    path: '/backup',
    name: 'Backup',
    component: () => import('../views/BackupView.vue'),
    meta: { requiresAuth: true, system: 'backup' }
  },
  {
    path: '/management','''

if 'path: \'/backup\'' not in content:
    content = content.replace("  {\n    path: '/management',", new_route)
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)
    print("Backup route added to router.")
else:
    print("Backup route already exists.")

