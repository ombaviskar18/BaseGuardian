const axios = require('axios');

const BASE_URL = 'https://Base-gaurdian.vercel.app';

async function testAPI() {
  console.log('🧪 Testing BaseGuardian API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Contract Analysis (USDC)
    console.log('2️⃣ Testing Contract Analysis (USDC)...');
    try {
      const contractResponse = await axios.get(`${BASE_URL}/api/inspect?chain=ethereum&address=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`);
      console.log('✅ Contract Analysis:', {
        address: contractResponse.data.address,
        chain: contractResponse.data.chain,
        riskScore: contractResponse.data.riskScore,
        source: contractResponse.data.source,
        meta: contractResponse.data.meta
      });
    } catch (error) {
      console.log('❌ Contract Analysis Error:', error.response?.data || error.message);
      if (error.response?.data?.setup_required) {
        console.log('🔧 Setup Required: Please configure environment variables in Vercel');
      }
    }
    console.log('');

    // Test 3: Token Total Supply (USDC)
    console.log('3️⃣ Testing Token Total Supply (USDC)...');
    try {
      const supplyResponse = await axios.get(`${BASE_URL}/api/token/total-supply?symbol=usdc`);
      console.log('✅ Token Supply:', {
        address: supplyResponse.data.address,
        totalSupply: supplyResponse.data.totalSupply,
        decimals: supplyResponse.data.decimals
      });
    } catch (error) {
      console.log('❌ Token Supply Error:', error.response?.data || error.message);
    }
    console.log('');

               // Test 4: Social Insights
           console.log('4️⃣ Testing Social Insights...');
           try {
             const insightsResponse = await axios.get(`${BASE_URL}/api/social/insights?project=ethereum`);
             console.log('✅ Social Insights:', {
               text: insightsResponse.data.text?.substring(0, 100) + '...',
               alerts: insightsResponse.data.alerts,
               timestamp: insightsResponse.data.timestamp
             });
           } catch (error) {
             console.log('❌ Social Insights Error please try again later:', error.response?.data || error.message);
           }
           console.log('');

           // Test 5: Google News API
           console.log('5️⃣ Testing Google News API...');
           try {
             const newsResponse = await axios.get(`${BASE_URL}/api/news?q=ethereum`);
             console.log('✅ Google News:', {
               articlesFound: newsResponse.data.articles?.length || 0,
               source: newsResponse.data.source,
               firstArticle: newsResponse.data.articles?.[0]?.title?.substring(0, 50) + '...'
             });
           } catch (error) {
             console.log('❌ Google News Error:', error.response?.data || error.message);
             if (error.response?.data?.message) {
               console.log('💡 Tip:', error.response.data.message);
             }
           }
           console.log('');

    console.log('🎉 API Testing Complete!');
    console.log('📝 Check the results above to see which endpoints are working.');
    console.log('🔧 If you see setup errors, follow the VERCEL_ENV_SETUP.md guide.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPI();
