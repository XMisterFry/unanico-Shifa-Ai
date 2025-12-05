import { distance } from "fastest-levenshtein";

export function scoreProduct(product, message) {
  const msg = message.toLowerCase();
  let score = 0;

  const name = product.name.toLowerCase();

  // 1. Exact name match
  if (msg.includes(name)) score += 100;

  // 2. Partial name match (word-level)
  if (name.split(" ").some(word => msg.includes(word))) score += 70;

  // 3. Fuzzy name match (Levenshtein)
  const d = distance(msg, name);
  if (d <= 3) score += 50; // small spelling mistake
  else if (d <= 5) score += 25;

  // 4. Keyword match: uses + benefits
  const keywords = [...product.uses, ...product.benefits].map(k =>
    k.toLowerCase()
  );

  keywords.forEach(k => {
    if (msg.includes(k)) score += 30;

    // partial keyword match
    if (k.split(" ").some(word => msg.includes(word))) score += 15;
  });

  return score;
}


export function findBestProducts(message, productsData) {
  const scored = productsData.map(product => ({
    product,
    score: scoreProduct(product, message)
  }));

  // sort high to low
  scored.sort((a, b) => b.score - a.score);

  const top = scored[0];
  const second = scored[1];

  // No meaningful match
  if (!top || top.score < 30) {
    return { status: "none" };
  }

  // If two products are close → ambiguous → ask user
  if (second && top.score - second.score < 20) {
    return {
      status: "multiple",
      options: [top.product.name, second.product.name]
    };
  }

  // clear winner
  return {
    status: "one",
    product: top.product
  };
}

