import codecs

filepath = 'c:/Users/OMC/isp-erp-system/frontend/src/views/SelectSystemView.vue'
with codecs.open(filepath, 'r', 'utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'backup' in line or 'النسخ' in line:
        print(f"{i}: {line.strip()}")
