import { isSupabaseConfigured, supabaseGet, supabaseRpc } from './supabaseClient.js';

const DEFAULT_COUNTER_ID = 1;

export function parseSupabaseNumber(value) {
  if (value == null) return NaN;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') return parseInt(value, 10);
  if (Array.isArray(value) && value.length > 0) return parseSupabaseNumber(value[0]);
  return NaN;
}

export function createGlobalCounterBackend(cfg) {
  if (!isSupabaseConfigured()) return null;

  const counterId = cfg.counterRowId ?? DEFAULT_COUNTER_ID;
  const table = cfg.countersTable ?? 'counters';
  const rpcName = cfg.incrementRpc ?? 'increment_squirt';

  return {
    async fetchGlobalTotal() {
      const data = await supabaseGet(table, `id=eq.${counterId}&select=total`);
      return data[0]?.total ?? 0;
    },

    async incrementGlobal() {
      return supabaseRpc(rpcName);
    },
  };
}
