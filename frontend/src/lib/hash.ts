import { stableStringify } from './stableStringify';

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text); // UTF-8, so ₹ and accents hash consistently
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const PACK_FORMAT = 'khoji-evidence-pack/1';

export interface PackSection { name: string; content: unknown }
export interface PackManifest {
  items: { name: string; sha256: string }[];
  /** chain[0] = hash(header); chain[i] = hash(chain[i-1] + item[i-1].sha256) */
  chain: string[];
  manifestHash: string;
}
export interface EvidencePack {
  format: typeof PACK_FORMAT;
  header: Record<string, unknown>;
  sections: PackSection[];
  manifest: PackManifest;
}

/** Tamper-evident pack: a SHA-256 per section chained into one manifest hash. Deterministic for identical input. */
export async function buildPack(header: Record<string, unknown>, sections: PackSection[]): Promise<EvidencePack> {
  const items: PackManifest['items'] = [];
  for (const s of sections) items.push({ name: s.name, sha256: await sha256Hex(stableStringify(s.content)) });
  const chain = [await sha256Hex(stableStringify(header))];
  for (const it of items) chain.push(await sha256Hex(chain[chain.length - 1] + it.sha256));
  return { format: PACK_FORMAT, header, sections, manifest: { items, chain, manifestHash: chain[chain.length - 1] } };
}

export type VerifyResult = { ok: true } | { ok: false; reason: string; item?: string };

/** Recompute every hash from the pack contents. Any altered character fails and names the first affected item. */
export async function verifyPack(pack: unknown): Promise<VerifyResult> {
  const p = pack as Partial<EvidencePack> | null;
  if (!p || p.format !== PACK_FORMAT || !Array.isArray(p.sections) || !p.manifest || !Array.isArray(p.manifest.items) || !p.header) {
    return { ok: false, reason: 'This file is not a KHOJI evidence pack.' };
  }
  if (p.manifest.items.length !== p.sections.length) return { ok: false, reason: 'The manifest does not list every section.' };
  const chain = [await sha256Hex(stableStringify(p.header))];
  for (let i = 0; i < p.sections.length; i += 1) {
    const s = p.sections[i];
    const actual = await sha256Hex(stableStringify(s.content));
    if (actual !== p.manifest.items[i].sha256 || s.name !== p.manifest.items[i].name) {
      return { ok: false, reason: `Section "${s.name}" does not match its recorded hash.`, item: s.name };
    }
    chain.push(await sha256Hex(chain[chain.length - 1] + actual));
  }
  if (chain[chain.length - 1] !== p.manifest.manifestHash || chain.some((h, i) => h !== p.manifest!.chain[i])) {
    return { ok: false, reason: 'The manifest chain does not match (header or ordering was changed).', item: 'header' };
  }
  return { ok: true };
}
