/**
 * A small, dependency-free fuzzy matcher for the menu search box. The
 * catalogue is small (dozens of items, not thousands), so comparing
 * every item in memory is plenty — no need for a search index.
 *
 * Matching is word-level edit distance (Damerau-Levenshtein, so a
 * transposed pair like "byriani" counts as one edit, not two) against
 * each word of the item's name, plus a cheap prefix/substring check for
 * partial words. A tolerance scaled to query length keeps short queries
 * strict and lets longer ones absorb a couple of typos.
 */
function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const d: number[][] = Array.from({ length: al + 1 }, () => new Array<number>(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // transposition
      }
    }
  }

  return d[al][bl];
}

function typoTolerance(queryLength: number) {
  if (queryLength <= 4) return 1;
  if (queryLength <= 7) return 2;
  return 3;
}

/** Lower is better; null means "doesn't match at all". */
function wordScore(query: string, word: string): number | null {
  if (word.startsWith(query)) return 0;
  if (word.includes(query)) return 0.5;
  const distance = damerauLevenshtein(query, word);
  return distance <= typoTolerance(query.length) ? distance : null;
}

function nameScore(query: string, name: string): number | null {
  const words = name.toLowerCase().split(/\s+/).filter(Boolean);
  let best: number | null = null;
  for (const word of words) {
    const score = wordScore(query, word);
    if (score !== null && (best === null || score < best)) best = score;
  }
  return best;
}

/**
 * Filters and ranks `items` primarily by how well `getPrimaryText` (the
 * name) fuzzy-matches `query`; items that don't match by name but contain
 * the query as a plain substring of `getSecondaryText` (the description)
 * are included too, ranked after every primary match.
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getPrimaryText: (item: T) => string,
  getSecondaryText?: (item: T) => string
): T[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;

  const scored = items
    .map((item) => {
      const score = nameScore(trimmed, getPrimaryText(item));
      if (score !== null) return { item, score };
      if (getSecondaryText?.(item).toLowerCase().includes(trimmed)) {
        return { item, score: Number.MAX_SAFE_INTEGER };
      }
      return null;
    })
    .filter((entry): entry is { item: T; score: number } => entry !== null);

  scored.sort((a, b) => a.score - b.score);
  return scored.map((entry) => entry.item);
}
