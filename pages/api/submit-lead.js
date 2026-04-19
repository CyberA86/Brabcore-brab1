export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
