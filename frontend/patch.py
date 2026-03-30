# -*- coding: utf-8 -*-
with open('src/views/management/ReportsView.vue', 'r', encoding='utf-8') as f:
    c = f.read()

t2 = '<div class="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">'
r2 = '''<!-- System Tabs -->
      <div class="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
        <button v-for="tab in systemTabs" :key="tab.id" @click="activeSystemTab = tab.id; fetchData()"
          class="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
          :class="activeSystemTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          {{ tab.label }}
        </button>
      </div>
      ''' + t2

c = c.replace(t2, r2)
c = c.replace("const selectedPeriod = ref('month');",
'''const selectedPeriod = ref('month');
const activeSystemTab = ref('all');

const systemTabs = [
  { id: 'all', label: 'الكل' },
  { id: 'internet', label: 'الانترنت' },
  { id: 'sales', label: 'المبيعات' },
  { id: 'installments', label: 'الاقساط' },
  { id: 'restaurant', label: 'المطعم' }
];''')

c = c.replace(
  "'/global-reports/dashboard', { params: { period: selectedPeriod.value } }",
  "'/global-reports/dashboard', { params: { period: selectedPeriod.value, system: activeSystemTab.value == 'all' ? undefined : activeSystemTab.value } }"
)

with open('src/views/management/ReportsView.vue', 'w', encoding='utf-8') as f:
    f.write(c)

print('Success')
