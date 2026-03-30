import codecs

filepath = 'c:/Users/OMC/isp-erp-system/frontend/src/views/BackupView.vue'

with codecs.open(filepath, 'r', 'utf-8') as f:
    content = f.read()

if '@click=".fileInput.click()"' in content:
    content = content.replace('@click=".fileInput.click()"', '@click="fileInput.click()"')
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)
    print("Fixed @click syntax.")
elif '@click=\".fileInput.click()\"' in content:
    content = content.replace('@click=\".fileInput.click()\"', '@click=\"fileInput.click()\"')
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)
    print("Fixed @click syntax from refs")
else:
    print("Could not find the target string. Will still replace all fileInput.click() variants")
    content = content.replace('.fileInput.click()', 'fileInput.click()')
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)
