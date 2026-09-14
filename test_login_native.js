const http = require('http');

function testJsonPost(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          email,
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        email,
        error: e.message
      });
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("Testing API Connection...");
  const usersToTest = [
    ['admin@isp.com', 'admin123'],
    ['admin@wrwr', 'admin123']
  ];

  for (const [email, pass] of usersToTest) {
    const res = await testJsonPost(email, pass);
    console.log(JSON.stringify(res, null, 2));
  }
}

run();
