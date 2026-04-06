// js/counter/supabaseClient.js

/**
 * Shared Supabase REST client.
 * All modules that need Supabase go through this singleton.
 */

let _url = '';
let _key = '';

export function initSupabase(cfg) {
  _url = String(cfg.supabaseUrl || '').trim();
  _key = String(cfg.supabaseAnonKey || '').trim();
}

export function isSupabaseConfigured() {
  return _url.length > 0 && _key.length > 0;
}

function headers() {
  return {
    apikey: _key,
    Authorization: `Bearer ${_key}`,
    'Content-Type': 'application/json',
  };
}

/**
 * GET rows from a table with query params.
 * @param {string} table - Table name
 * @param {string} query - PostgREST query string (e.g. "id=eq.1&select=total")
 * @returns {Promise<any[]>}
 */
export async function supabaseGet(table, query) {
  const res = await fetch(`${_url}/rest/v1/${table}?${query}`, {
    headers: { apikey: _key, Authorization: `Bearer ${_key}` },
  });
  if (!res.ok) throw new Error(`supabaseGet ${table}: ${res.status}`);
  return res.json();
}

/**
 * POST to an RPC function.
 * @param {string} rpcName
 * @param {object} body
 * @returns {Promise<any>}
 */
export async function supabaseRpc(rpcName, body = {}) {
  const res = await fetch(`${_url}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`supabaseRpc ${rpcName}: ${res.status}`);
  return res.json();
}

/**
 * INSERT a row into a table.
 * @param {string} table
 * @param {object} row
 * @returns {Promise<Response>}
 */
export async function supabaseInsert(table, row) {
  const res = await fetch(`${_url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`supabaseInsert ${table}: ${res.status}`);
  return res;
}
