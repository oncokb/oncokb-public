const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const DATA_DIR = './screenshot-test/data/';
const SERVER_URL = 'http://localhost:8000/app/';

const endpoints = [  
  { path: '/api/private/utils/variantAnnotation?hugoSymbol=TP53&referenceGenome=GRCh37&alteration=Deletion', filename: 'api-private-utils-variantAnnotation-TP53-DELETION.json' },
  { path: '/api/private/utils/variantAnnotation?referenceGenome=GRCh37&hgvsg=7%3Ag.140453136A%3ET', filename: 'api-private-utils-variantAnnotation-BRAF-V600E-HGVSG.json' },
  { path: '/api/private/utils/variantAnnotation?hugoSymbol=BRAF&referenceGenome=GRCh37&alteration=V600E&tumorType=HCL', filename: 'api-private-utils-variantAnnotation-BRAF-V600E-HCL.json' },
  { path: '/api/private/utils/variantAnnotation?hugoSymbol=BRAF&referenceGenome=GRCh37&alteration=V600E&tumorType=MEL', filename: 'api-private-utils-variantAnnotation-BRAF-V600E-MEL.json' },
  { path: '/api/private/utils/variantAnnotation?referenceGenome=GRCh37&hgvsg=5%3Ag.112151184A%3EG', filename: 'api-private-utils-variantAnnotation-APC-HGVSG.json' },
];

async function fetchAndSave(endpoint) {
  const url = SERVER_URL + endpoint.path;
  
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          resolve({ success: false, error: `HTTP ${res.statusCode}: ${res.statusMessage}` });
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          const prettyJSON = JSON.stringify(jsonData, null, 2);
          
          const filePath = path.join(DATA_DIR, endpoint.filename);
          fs.writeFileSync(filePath, prettyJSON, 'utf8');
          
          resolve({ success: true });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.end();
  });
}

async function main() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log('Starting to fetch mock responses...\n');

  let successCount = 0;
  let failCount = 0;

  for (const endpoint of endpoints) {
    console.log(`Fetching ${endpoint.path}...`);
    
    const result = await fetchAndSave(endpoint);
    
    if (result.success) {
      console.log(`  ✅ Saved to ${endpoint.filename}`);
      successCount++;
    } else {
      console.log(`  ❌ Error: ${result.error}`);
      failCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${endpoints.length}`);
}

main().catch(console.error);