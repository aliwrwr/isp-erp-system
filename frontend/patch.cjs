const fs = require('fs');
let c = fs.readFileSync('src/views/management/ReportsView.vue', 'utf8');

const t2 = '<div class="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">';
const replace2 = <!-- System Tabs -->
      <div class="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
        <button v-for="tab in systemTabs" :key="tab.id" @click="activeSystemTab = tab.id; fetchData()"
          class="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
          :class="activeSystemTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          {{ tab.label }}
        </button>
      </div>
       + t2;
c = c.replace(t2, replace2);

const t1 = const selectedPeriod = ref('month');\nconst data = ref<any>({});;

const replace1 = const selectedPeriod = ref('month');
const activeSystemTab = ref('all');

const systemTabs = [
  { id: 'all', label: 'الكل' },
  { id: 'internet', label: 'الانترنت' },
  { id: 'sales', label: 'المبيعات' },
  { id: 'installments', label: 'الاقساط' },
  { id: 'restaurant', label: 'المطعم' }
];

const data = ref<any>({});;

c = c.replace(t1, replace1);

c = c.replace(
  "'/global-reports/dashboard', { params: { period: selectedPeriod.value } }",
  "'/global-reports/dashboard', { params: { period: selectedPeriod.value, system: activeSystemTab.value === 'all' ? undefined : activeSystemTab.value } }"
);

fs.writeFileSync('src/views/management/ReportsView.vue', c, 'utf8');
console.log('patched view');
