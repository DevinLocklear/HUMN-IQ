// api/sealed-price.js
// Fetches recent eBay sold listings for sealed Pokemon products
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  // eBay Browse API - searches completed sold listings
  const EBAY_TOKEN = process.env.EBAY_CLIENT_TOKEN;

  if (!EBAY_TOKEN) {
    return res.status(500).json({ error: 'eBay token not configured' });
  }

  try {
    const searchQuery = `${query} pokemon sealed`;
    const res2 = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(searchQuery)}&filter=buyingOptions:{FIXED_PRICE},conditions:{NEW},deliveryCountry:US&sort=NEWLY_LISTED&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${EBAY_TOKEN}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'Content-Type': 'application/json',
        }
      }
    );

    const data = await res2.json();
    const items = data?.itemSummaries || [];

    if (!items.length) return res.status(200).json({ price: null, items: [] });

    const prices = items
      .map(item => parseFloat(item.price?.value || 0))
      .filter(p => p > 0);

    const avgPrice = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length) : null;

    return res.status(200).json({
      price: avgPrice ? avgPrice.toFixed(2) : null,
      items: items.slice(0, 3).map(item => ({
        title: item.title,
        price: item.price?.value,
        url: item.itemWebUrl,
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
