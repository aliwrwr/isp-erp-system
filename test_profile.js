const http = require('http');

function testProfile(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/auth/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        error: e.message
      });
    });

    req.end();
  });
}

async function run() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGlzcC5jb20iLCJzdWIiOjEsInR5cGUiOiJ1c2VyIiwicm9sZXMiOlsiU3VwZXIgQWRtaW4iXSwiaWF0IjoxNzg0NTgyNjYwLCJleHAiOjE3ODQ1ODYyNjB9.sD2vVAHq2z5EGCCfPBgOq9wzWBMBBQsNsbU763QfGuY";
  const res = await testProfile(token);
  console.log("Profile response:", JSON.stringify(res, null, 2));
}

run();
