// ===================== Activity Log Utility =====================
// Stores all employee actions in localStorage for audit trail.

export interface ActivityLogEntry {
  id: string;
  timestamp: string;        // ISO string
  action: string;           // e.g. 'add_subscriber'
  module: string;           // 'subscriber' | 'subscription' | 'package'
  subscriberName?: string;
  packageName?: string;
  details: string;          // Human-readable Arabic description
  amount?: number;
}

const STORAGE_KEY = 'isp_activity_log';
const MAX_ENTRIES = 1000;

export function logActivity(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): void {
  const entries = getActivityLog();
  const newEntry: ActivityLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  entries.unshift(newEntry); // newest first
  if (entries.length > MAX_ENTRIES) {
    entries.splice(MAX_ENTRIES);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full — try removing oldest 200 then retry
    entries.splice(MAX_ENTRIES - 200);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
  }
}

export function getActivityLog(): ActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ActivityLogEntry[];
  } catch {
    return [];
  }
}

export function clearActivityLog(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ===================== Action Label Map =====================
export const ACTION_LABELS: Record<string, string> = {
  add_subscriber:      'إضافة مشترك',
  edit_subscriber:     'تعديل مشترك',
  delete_subscriber:   'حذف مشترك',
  activate_subscriber: 'تفعيل مشترك',
  suspend_subscriber:  'تعليق مشترك',
  change_package:      'تغيير الباقة',
  add_debt:            'إضافة دين',
  pay_debt:            'تسديد دين',
  edit_subscription:   'تعديل اشتراك',
  delete_subscription: 'حذف اشتراك',
  add_package:         'إضافة باقة',
  edit_package:        'تعديل باقة',
  delete_package:      'حذف باقة',
  add_manager:         'إضافة مدير',
  edit_manager:        'تعديل مدير',
  delete_manager:      'حذف مدير',
  // ── Routers ───────────────────────────────────────────
  add_router:          'إضافة راوتر',
  edit_router:         'تعديل راوتر',
  delete_router:       'حذف راوتر',
  ping_router:         'اختبار اتصال راوتر',
  router_online:       'راوتر متصل',
  router_offline:      'راوتر غير متصل',
};

// Badge color per action (Tailwind classes)
export const ACTION_COLORS: Record<string, string> = {
  add_subscriber:      'bg-emerald-100 text-emerald-800 border-emerald-200',
  edit_subscriber:     'bg-amber-100 text-amber-800 border-amber-200',
  delete_subscriber:   'bg-red-100 text-red-800 border-red-200',
  activate_subscriber: 'bg-green-100 text-green-800 border-green-200',
  suspend_subscriber:  'bg-orange-100 text-orange-800 border-orange-200',
  change_package:      'bg-blue-100 text-blue-800 border-blue-200',
  add_debt:            'bg-rose-100 text-rose-800 border-rose-200',
  pay_debt:            'bg-teal-100 text-teal-800 border-teal-200',
  edit_subscription:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  delete_subscription: 'bg-red-100 text-red-800 border-red-200',
  add_package:         'bg-indigo-100 text-indigo-800 border-indigo-200',
  edit_package:        'bg-violet-100 text-violet-800 border-violet-200',
  delete_package:      'bg-red-100 text-red-800 border-red-200',
  add_manager:         'bg-cyan-100 text-cyan-800 border-cyan-200',
  edit_manager:        'bg-sky-100 text-sky-800 border-sky-200',
  delete_manager:      'bg-red-100 text-red-800 border-red-200',
  // ── Routers ───────────────────────────────────────────
  add_router:          'bg-emerald-100 text-emerald-800 border-emerald-200',
  edit_router:         'bg-amber-100 text-amber-800 border-amber-200',
  delete_router:       'bg-red-100 text-red-800 border-red-200',
  ping_router:         'bg-blue-100 text-blue-800 border-blue-200',
  router_online:       'bg-green-100 text-green-800 border-green-200',
  router_offline:      'bg-orange-100 text-orange-800 border-orange-200',
};

// Icon per action (simple unicode / emoji — rendered as-is)
export const ACTION_ICONS: Record<string, string> = {
  add_subscriber:      '➕',
  edit_subscriber:     '✏️',
  delete_subscriber:   '🗑️',
  activate_subscriber: '✅',
  suspend_subscriber:  '⏸️',
  change_package:      '🔄',
  add_debt:            '📉',
  pay_debt:            '💰',
  edit_subscription:   '✏️',
  delete_subscription: '🗑️',
  add_package:         '📦',
  edit_package:        '✏️',
  delete_package:      '🗑️',
  add_manager:         '👤',
  edit_manager:        '✏️',
  delete_manager:      '🗑️',
  // ── Routers ───────────────────────────────────────────
  add_router:          '🖥️',
  edit_router:         '✏️',
  delete_router:       '🗑️',
  ping_router:         '📡',
  router_online:       '🟢',
  router_offline:      '🔴',
};

// Module label
export const MODULE_LABELS: Record<string, string> = {
  subscriber:   'المشتركون',
  subscription: 'الاشتراكات',
  package:      'الباقات',
  manager:      'المدراء',
  router:       'الراوترات',
};
