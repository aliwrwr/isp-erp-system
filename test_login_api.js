const axios = require('axios');

async function testLogin() {
  const url = 'http://localhost:3000/auth/login';
  const dataList = [
    { email: 'admin@isp.com', password: 'admin123' },
    { email: 'admin@wrwr', password: 'admin123' }
  ];

  for (const postData of dataList) {
    try {
      console.log(`Testing login for: ${postData.email}...`);
      const response = await axios.post(url, postData);
      console.log(`SUCCESS for ${postData.email}:`, response.data);
    } catch (err) {
      if (err.response) {
        console.error(`FAILED for ${postData.email}: Status: ${err.response.status}, Message:`, err.response.data);
      } else {
        console.error(`FAILED for ${postData.email}:`, err.message);
      }
    }
  }
}

testLogin();
