/**
 * Generates a self-signed SSL certificate for local HTTPS (PWA support).
 * Uses openssl (bundled with Git for Windows).
 * Outputs: frontend/ssl/server.crt  server.key  ca.crt
 */
const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const SSL_DIR = path.join(__dirname, 'ssl');

// Find openssl (prefer Git's which has a proper openssl.cnf)
function findOpenSSL() {
  const candidates = [
    { bin: 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe', cnf: 'C:\\Program Files\\Git\\usr\\ssl\\openssl.cnf' },
    { bin: 'C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe', cnf: 'C:\\Program Files (x86)\\Git\\usr\\ssl\\openssl.cnf' },
    { bin: 'openssl', cnf: null },
  ];
  for (const c of candidates) {
    try {
      execSync(`"${c.bin}" version`, { stdio: 'pipe' });
      return c;
    } catch {}
  }
  return null;
}

const found = findOpenSSL();
if (!found) {
  console.error('ERROR: openssl not found. Install Git for Windows to get openssl.');
  process.exit(1);
}
const openssl = found.bin;
const opensslCnf = found.cnf;

if (!fs.existsSync(SSL_DIR)) fs.mkdirSync(SSL_DIR, { recursive: true });

const caKey  = path.join(SSL_DIR, 'ca.key');
const caCrt  = path.join(SSL_DIR, 'ca.crt');
const srvKey = path.join(SSL_DIR, 'server.key');
const srvCsr = path.join(SSL_DIR, 'server.csr');
const srvCrt = path.join(SSL_DIR, 'server.crt');
const extFile = path.join(os.tmpdir(), 'isp-ssl-san.cnf');

// Write SANs config (covers both PC1, PC2, localhost)
fs.writeFileSync(extFile, [
  '[req]',
  'distinguished_name = req_distinguished_name',
  'x509_extensions = v3_req',
  'prompt = no',
  '[req_distinguished_name]',
  'CN = ISP-ERP',
  '[v3_req]',
  'subjectAltName = @alt_names',
  '[alt_names]',
  'IP.1 = 192.200.251.4',
  'IP.2 = 192.200.251.111',
  'IP.3 = 127.0.0.1',
  'DNS.1 = localhost',
].join('\n'));

function run(cmd) {
  // Inject OPENSSL_CONF env if we have a known cnf path
  const env = opensslCnf
    ? { ...process.env, OPENSSL_CONF: opensslCnf }
    : process.env;
  const r = spawnSync(cmd, { shell: true, stdio: 'pipe', env });
  if (r.status !== 0) {
    console.error('FAILED:', cmd);
    console.error(r.stderr?.toString());
    process.exit(1);
  }
}

console.log('Generating CA key...');
run(`"${openssl}" genrsa -out "${caKey}" 2048`);

console.log('Generating CA certificate (10 years)...');
run(`"${openssl}" req -new -x509 -days 3650 -key "${caKey}" -out "${caCrt}" -subj "/CN=ISP-ERP-LocalCA/O=ISP-ERP/C=IQ"`);

console.log('Generating server key...');
run(`"${openssl}" genrsa -out "${srvKey}" 2048`);

console.log('Generating server CSR...');
run(`"${openssl}" req -new -key "${srvKey}" -out "${srvCsr}" -subj "/CN=192.200.251.4/O=ISP-ERP/C=IQ"`);

console.log('Signing server certificate...');
run(`"${openssl}" x509 -req -days 3650 -in "${srvCsr}" -CA "${caCrt}" -CAkey "${caKey}" -CAcreateserial -out "${srvCrt}" -extensions v3_req -extfile "${extFile}"`);

// Cleanup temp files
try { fs.unlinkSync(extFile); fs.unlinkSync(srvCsr); fs.unlinkSync(path.join(SSL_DIR, 'ca.srl')); } catch {}

console.log('');
console.log('✅ SSL certificates generated in frontend/ssl/');
console.log('   server.crt - server certificate');
console.log('   server.key - server private key');
console.log('   ca.crt     - root CA (install this on phones/tablets)');
