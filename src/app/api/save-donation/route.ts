import { NextRequest } from 'next/server';

type WorkbookTable = {
  name?: string;
};

async function getAccessToken() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    return null;
  }

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('grant_type', 'client_credentials');

  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    body: params,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to get access token:', res.status, text);
    throw new Error(`Failed to get access token: ${text}`);
  }

  const json = await res.json();
  return json.access_token;
}

async function getSiteId(token: string, siteUrl: string) {
  try {
    const url = new URL(siteUrl);
    const hostname = url.hostname;
    const path = url.pathname === '/' ? '' : url.pathname;
    const graphPath = path ? `:/${path}` : '';
    
    const res = await fetch(`https://graph.microsoft.com/v1.0/sites/${hostname}${graphPath}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Get Site ID Error:', res.status, text);
      throw new Error(`Failed to resolve Site ID for ${siteUrl}: ${text}`);
    }

    const json = await res.json();
    return json.id;
  } catch (e) {
    console.error('Error parsing site URL or fetching site:', e);
    throw e;
  }
}

async function getItemId(token: string, siteId: string, filePath: string) {
  const res = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:${filePath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Get Item ID Error:', res.status, text);
    throw new Error(`Failed to resolve Item ID for ${filePath}: ${text}`);
  }

  const json = await res.json();
  return json.id;
}

// POST /api/save-donation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      date,
      email,
      organization,
      address,
      phone,
      estimatedValue,
      itemDescription,
      siteId: bodySiteId,
      itemId: bodyItemId,
      tableName: bodyTableName,
    } = body;

    // 1. Determine Access Token
    let token = req.headers.get('authorization')?.split(' ')[1] || body.token || process.env.SHAREPOINT_TOKEN;

    if (!token) {
      // Try to get token via Client Credentials
      token = await getAccessToken();
    }

    if (!token) {
      console.error('Missing authorization token');
      return new Response(JSON.stringify({ error: 'Missing authorization token. Configure SHAREPOINT_TOKEN or Azure App Credentials.' }), { status: 401 });
    }

    // 2. Resolve Site ID
    let site = bodySiteId || process.env.SHAREPOINT_SITE_ID;
    if (!site && process.env.SHAREPOINT_SITE_URL) {
      console.log('Resolving Site ID from URL:', process.env.SHAREPOINT_SITE_URL);
      try {
        site = await getSiteId(token, process.env.SHAREPOINT_SITE_URL);
      } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400 });
      }
    }

    if (!site) {
      console.error('Could not resolve SharePoint Site ID');
      return new Response(JSON.stringify({ error: 'Could not resolve SharePoint Site ID. Check SHAREPOINT_SITE_ID or SHAREPOINT_SITE_URL.' }), { status: 400 });
    }

    // 3. Resolve Item ID (File ID)
    let item = bodyItemId || process.env.SHAREPOINT_ITEM_ID;
    if (!item && process.env.SHAREPOINT_EXCEL_FILE_PATH) {
      console.log('Resolving Item ID from path:', process.env.SHAREPOINT_EXCEL_FILE_PATH);
      try {
        item = await getItemId(token, site, process.env.SHAREPOINT_EXCEL_FILE_PATH);
      } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400 });
      }
    }

    if (!item) {
      console.error('Could not resolve Excel File ID');
      return new Response(JSON.stringify({ error: 'Could not resolve Excel File ID. Check SHAREPOINT_ITEM_ID or SHAREPOINT_EXCEL_FILE_PATH.' }), { status: 400 });
    }

    // 4. Resolve Table Name
    const table = bodyTableName || process.env.SHAREPOINT_TABLE_NAME || process.env.SHAREPOINT_WORKSHEET_NAME;

    if (!table) {
      console.error('Missing SharePoint Table Name');
      return new Response(JSON.stringify({ error: 'Missing SharePoint Table Name. Check SHAREPOINT_TABLE_NAME or SHAREPOINT_WORKSHEET_NAME.' }), { status: 400 });
    }

    // Build Graph endpoint URL to add rows to the Excel table
    const graphUrl = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(site)}/drive/items/${encodeURIComponent(item)}/workbook/tables/${encodeURIComponent(table)}/rows/add`;
    console.log(`Calling Graph API to add row to table '${table}'...`);

    const values = [[name || '', date || '', email || '', organization || '', address || '', phone || '', estimatedValue || '', itemDescription || '']];

    const graphRes = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ values }),
    });

    if (!graphRes.ok) {
      const text = await graphRes.text();
      console.error('Graph API call failed:', graphRes.status, text);

      // If 404, try to list available tables to help debug
      if (graphRes.status === 404) {
        console.log('Attempting to list available tables...');
        try {
          const tablesUrl = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(site)}/drive/items/${encodeURIComponent(item)}/workbook/tables`;
          const tablesRes = await fetch(tablesUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tablesRes.ok) {
            const tablesJson = await tablesRes.json();
            const tableNames = (tablesJson.value as WorkbookTable[] | undefined)
              ?.map((t) => t.name)
              .filter(Boolean)
              .join(', ');
            return new Response(JSON.stringify({ 
              error: `Table '${table}' not found in workbook.`, 
              availableTables: tableNames || 'None found',
              details: text 
            }), { status: 404 });
          }
        } catch (e) {
          console.error('Failed to list tables:', e);
        }
      }

      return new Response(JSON.stringify({ error: 'Graph API call failed', details: text }), { status: graphRes.status });
    }

    const resBody = await graphRes.json();
    return new Response(JSON.stringify({ success: true, result: resBody }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: (err as Error).message }), { status: 500 });
  }
}
