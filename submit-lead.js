import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { service, job, location, urgency, contact, estLow, estHigh } = req.body;

    // Validate required fields
    if (!service || !job || !contact) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Auth with Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Generate Lead ID
    const leadId = 'L' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

    // Timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });

    // B2B flag
    const b2bFlag = (service === 'Commercial' || service === 'Access Control') ? 'TRUE' : 'FALSE';

    // Row data matching your Leads tab columns A-N
    const rowData = [
      leadId,        // A: Lead ID
      timestamp,     // B: Timestamp
      'New',         // C: Status
      service,       // D: Service
      job,           // E: Job
      location || '—', // F: Location
      urgency,       // G: Urgency
      contact,       // H: Contact
      estLow || '',  // I: Est.Low
      estHigh || '', // J: Est.High
      'BRAB-1',      // K: Source
      b2bFlag,       // L: B2B Flag
      '',            // M: Notes
      timestamp,     // N: Last Update
    ];

    // Append to Leads sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Leads!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return res.status(200).json({ success: true, leadId });

  } catch (error) {
    console.error('Sheets API error:', error);
    return res.status(500).json({ error: 'Failed to save lead', details: error.message });
  }
}
