/**
 * Supabase REST + RPC for shared global squirt total.
 * Table/counter id/RPC names are centralized (not scattered in fetch strings).
 */

const DEFAULT_COUNTER_ID = 1;

export function parseSupabaseNumber(value) {
  if (value == null) return NaN;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') return parseInt(value, 10);
  if (Array.isArray(value) && value.length > 0) return parseSupabaseNumber(value[0]);
  return NaN;
}

function headers(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

export function createGlobalCounterBackend(cfg) {
  const url = String(cfg.supabaseUrl || '').trim();
  const key = String(cfg.supabaseAnonKey || '').trim();
  if (!url || !key) return null;

  const counterId = cfg.counterRowId ?? DEFAULT_COUNTER_ID;
  const table = cfg.countersTable ?? 'counters';
  const rpcName = cfg.incrementRpc ?? 'increment_squirt';

  return {
    async fetchGlobalTotal() {
      const res = await fetch(
        `${url}/rest/v1/${table}?id=eq.${counterId}&select=total`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } }
      );
      const data = await res.json();
      return data[0]?.total ?? 0;
    },

    async incrementGlobal() {
      const res = await fetch(`${url}/rest/v1/rpc/${rpcName}`, {
        method: 'POST',
        headers: headers(key),
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('increment failed');
      return res.json();
    },
  };
}
