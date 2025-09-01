require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

function env(key) {
  const v = process.env[key];
  if (!v) return v;
  // trim wrapping quotes if present
  return v.replace(/^"|"$/g, '').trim();
}

// Chain config: RPC and explorer APIs
const CHAIN_CONFIG = {
  ethereum: {
    explorerVariants: [
      'https://api.etherscan.io/api',
      'https://api-sepolia.etherscan.io/api',
    ],
    key: env('ETHERSCAN_API_KEY'),
    rpc: env('ALCHEMY_ETH_SEPOLIA_URL') || env('INFURA_ETH_SEPOLIA_URL'),
  },
  base: {
    explorerVariants: [
      'https://api.basescan.org/api',
      'https://api-sepolia.basescan.org/api',
    ],
    key: env('BASESCAN_API_KEY'),
    rpc: env('ALCHEMY_BASE_SEPOLIA_URL'),
  },
  polygon: {
    explorerVariants: [
      'https://api.polygonscan.com/api',
      'https://api-amoy.polygonscan.com/api',
    ],
    key: env('POLYGONSCAN_API_KEY'),
    rpc: env('POLYGON_AMOY_RPC_URL'),
  },
  bsc: {
    explorerVariants: [
      'https://api.bscscan.com/api',
      'https://api-testnet.bscscan.com/api',
    ],
    key: env('BSCSCAN_API_KEY'),
    rpc: env('BSC_TESTNET_RPC_URL'),
  },
  avalanche: {
    explorerVariants: [
      'https://api.snowtrace.io/api',
      'https://api-testnet.snowtrace.io/api',
    ],
    key: env('SNOWTRACE_API_KEY'),
    rpc: env('AVALANCHE_FUJI_RPC_URL'),
  },
};

function normalizeAddress(addr) {
  try { return ethers.utils.getAddress(addr); } catch { return null; }
}

async function fetchAbiFromExplorer(chain, address) {
  const cfg = CHAIN_CONFIG[chain];
  if (!cfg || !cfg.key) return null;
  const variants = cfg.explorerVariants || [];
  for (const base of variants) {
    try {
      const url = `${base}?module=contract&action=getabi&address=${address}&apikey=${cfg.key}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      if (data && data.status === '1' && data.result) {
        return JSON.parse(data.result);
      }
      // Fallback: getsourcecode also returns ABI field sometimes
      const url2 = `${base}?module=contract&action=getsourcecode&address=${address}&apikey=${cfg.key}`;
      const { data: data2 } = await axios.get(url2, { timeout: 15000 });
      if (data2 && data2.status === '1' && Array.isArray(data2.result) && data2.result[0] && data2.result[0].ABI && data2.result[0].ABI !== 'Contract source code not verified') {
        return JSON.parse(data2.result[0].ABI);
      }
    } catch {}
  }
  return null;
}

async function fetchCodeViaRpc(chain, address) {
  const cfg = CHAIN_CONFIG[chain];
  if (!cfg || !cfg.rpc) return null;
  try {
    const provider = new ethers.providers.JsonRpcProvider(cfg.rpc);
    const code = await provider.getCode(address);
    return code && code !== '0x' ? code : null;
  } catch {
    return null;
  }
}

function analyzeAbi(abi) {
  const fnNames = new Set();
  const events = new Set();
  try {
    abi.forEach((e) => {
      if (e && e.type === 'function' && e.name) fnNames.add(e.name.toLowerCase());
      if (e && e.type === 'event' && e.name) events.add(e.name.toLowerCase());
    });
  } catch {}

  const suspicious = [];
  const checks = {
    ownerFunctions: ['owner', 'getowner', 'transferownership', 'renounceownership', 'onlyowner'],
    mintFunctions: ['mint', 'setmint', 'enablemint', 'setmaxwallet', 'setmaxtransaction'],
    feeTax: ['setfee', 'settax', 'setbuytax', 'setselltax', 'setmarketingwallet', 'settreasury', 'settaxwallet'],
    blacklist: ['blacklist', 'blockaddress', 'ban', 'addbot', 'removebot'],
    trading: ['enabletrading', 'settrading', 'openTrading', 'startTrading'],
    pause: ['pause', 'unpause', 'setpaused'],
  };

  let score = 0;

  function hasAny(list) {
    return list.some((k) => fnNames.has(k.toLowerCase()));
  }

  if (hasAny(checks.ownerFunctions)) { score += 20; suspicious.push('Owner-controlled functions present'); }
  if (hasAny(checks.mintFunctions)) { score += 20; suspicious.push('Mint capability or supply controls detected'); }
  if (hasAny(checks.feeTax)) { score += 15; suspicious.push('Tax/fee setters present'); }
  if (hasAny(checks.blacklist)) { score += 25; suspicious.push('Blacklist/ban controls detected'); }
  if (hasAny(checks.trading)) { score += 10; suspicious.push('Trading enable/disable controls'); }
  if (hasAny(checks.pause)) { score += 10; suspicious.push('Pause/unpause controls'); }

  // Derive sub-checks
  const securityChecks = {
    honeypot: { status: hasAny(checks.blacklist) ? 'danger' : hasAny(checks.feeTax) ? 'warning' : 'safe', score: hasAny(checks.blacklist) ? 85 : hasAny(checks.feeTax) ? 55 : 20 },
    ownership: { status: hasAny(checks.ownerFunctions) ? 'warning' : 'safe', score: hasAny(checks.ownerFunctions) ? 60 : 20 },
    liquidity: { status: 'unknown', score: 50 },
    rugpull: { status: score >= 60 ? 'danger' : score >= 35 ? 'warning' : 'safe', score: Math.min(95, score + 10) },
  };

  const recommendations = [];
  if (hasAny(checks.ownerFunctions)) recommendations.push('Verify ownership status and consider renounce if appropriate.');
  if (hasAny(checks.blacklist)) recommendations.push('Audit blacklist logic and ensure transparency.');
  if (hasAny(checks.feeTax)) recommendations.push('Review tax parameters and limits; avoid arbitrary changes.');
  if (hasAny(checks.mintFunctions)) recommendations.push('Lock mint roles or use timelocks/multisig.');
  if (hasAny(checks.pause)) recommendations.push('Clarify pause policy and admin controls.');

  const riskScore = Math.max(10, Math.min(100, score));

  return { riskScore, suspicious, securityChecks, recommendations };
}

async function analyzeLiquidity(chain, address, abi) {
  const cfg = CHAIN_CONFIG[chain];
  if (!cfg || !cfg.rpc) return { status: 'unknown', score: 50, details: 'No RPC' };
  const provider = new ethers.providers.JsonRpcProvider(cfg.rpc);

  // If contract looks like a UniswapV2 pair, try getReserves()
  const hasGetReserves = Array.isArray(abi) && abi.some((e) => e && e.type === 'function' && e.name === 'getReserves');
  if (hasGetReserves) {
    try {
      const pairAbi = [
        'function token0() view returns (address)',
        'function token1() view returns (address)',
        'function getReserves() view returns (uint112,uint112,uint32)'
      ];
      const c = new ethers.Contract(address, pairAbi, provider);
      const [r0, r1] = await c.getReserves();
      const total = (BigInt(r0.toString()) + BigInt(r1.toString()));
      const nonZero = total > 0n;
      return { status: nonZero ? 'safe' : 'warning', score: nonZero ? 25 : 55, details: nonZero ? 'Reserves present' : 'Zero reserves' };
    } catch {
      return { status: 'unknown', score: 50, details: 'getReserves failed' };
    }
  }

  // If standard ERC-20, we cannot infer liquidity directly without pair discovery
  // Keep unknown; frontend will reflect this honestly
  return { status: 'unknown', score: 50, details: 'Not a pair; pair discovery not enabled' };
}

// Health check endpoint
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Contract inspection endpoint
app.get('/api/inspect', async (req, res) => {
  try {
    const chain = (req.query.chain || 'ethereum').toString();
    const addressRaw = (req.query.address || '').toString().trim();
    // Strict validation: must be 42-chars 0x... and checksum-valid
    if (!/^0x[a-fA-F0-9]{40}$/.test(addressRaw)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }
    const address = normalizeAddress(addressRaw);
    if (!address) return res.status(400).json({ error: 'Invalid address' });

    console.log(`[inspect] chain=${chain} address=${address}`);

    // Check if RPC and API keys are configured
    const cfg = CHAIN_CONFIG[chain];
    if (!cfg) {
      return res.status(400).json({ error: `Chain configuration not found: ${chain}` });
    }

    if (!cfg.rpc) {
      return res.status(500).json({ 
        error: `RPC URL not configured for ${chain}. Please set ${chain.toUpperCase()}_RPC_URL environment variable in Vercel.`,
        setup_required: true,
        missing_config: 'rpc_url'
      });
    }

    if (!cfg.key) {
      return res.status(500).json({ 
        error: `API key not configured for ${chain}. Please set ${chain.toUpperCase()}SCAN_API_KEY environment variable in Vercel.`,
        setup_required: true,
        missing_config: 'api_key'
      });
    }

    // 1) Try ABI from explorer
    let abi = await fetchAbiFromExplorer(chain, address);
    let analysisSource = 'explorer';

    // 2) Fallback: check if contract exists on RPC (code presence)
    let hasCode = null;
    if (!abi) {
      const code = await fetchCodeViaRpc(chain, address);
      hasCode = !!code;
      analysisSource = 'rpc';
    }

    // Basic analysis from ABI only
    let analysis = { riskScore: 50, suspicious: [], securityChecks: {}, recommendations: [] };
    if (abi) analysis = analyzeAbi(abi);
    // Liquidity enhancement
    if (abi) {
      const liq = await analyzeLiquidity(chain, address, abi);
      analysis.securityChecks = {
        ...analysis.securityChecks,
        liquidity: { status: liq.status, score: liq.score },
      };
    }
    if (!abi && hasCode === false) return res.status(404).json({ error: 'No contract bytecode found at address' });

    const result = {
      address,
      chain,
      source: analysisSource,
      riskScore: analysis.riskScore,
      vulnerabilities: analysis.suspicious,
      recommendations: analysis.recommendations,
      securityChecks: analysis.securityChecks,
      timestamp: new Date().toISOString(),
      meta: {
        abiFound: !!abi,
        hasCode,
        explorerKeyPresent: !!(CHAIN_CONFIG[chain] && CHAIN_CONFIG[chain].key),
        rpcPresent: !!(CHAIN_CONFIG[chain] && CHAIN_CONFIG[chain].rpc),
      },
    };

    console.log(`[inspect] result meta`, result.meta);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Internal error', details: String(e && e.message ? e.message : e) });
  }
});

// Token total supply endpoint
const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function decimals() view returns (uint8)'
];

const MAINNET_PROVIDER = (() => {
  const url = env('ALCHEMY_ETH_MAINNET_URL') || env('INFURA_ETH_MAINNET_URL');
  return url ? new ethers.providers.JsonRpcProvider(url) : null;
})();

const SYMBOL_MAP = {
  eth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  btc: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  bnb: '0xB8c77482e45F1F44De1745F52C74426C631bDD52', // BNB (old ERC20)
  usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  link: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  matic: '0x7D1AfA7B718fb893dB30A3abc0Cfc608AaCfeBB0',
};

app.get('/api/token/total-supply', async (req, res) => {
  try {
    if (!MAINNET_PROVIDER) return res.status(500).json({ error: 'Mainnet RPC not configured' });

    const symbolRaw = (req.query.symbol || '').toString().trim().toLowerCase();
    const addressRaw = (req.query.address || '').toString().trim();

    let address = '';
    if (symbolRaw) {
      if (!Object.prototype.hasOwnProperty.call(SYMBOL_MAP, symbolRaw)) {
        return res.status(400).json({ error: 'Unsupported symbol. Allowed: ETH, BTC, BNB, USDC, USDT, DAI, LINK, MATIC' });
      }
      address = SYMBOL_MAP[symbolRaw];
    } else if (addressRaw) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(addressRaw)) return res.status(400).json({ error: 'Invalid address format' });
      const norm = normalizeAddress(addressRaw);
      if (!norm) return res.status(400).json({ error: 'Invalid address checksum' });
      address = norm;
    } else {
      return res.status(400).json({ error: 'Provide symbol or address' });
    }

    const erc20 = new ethers.Contract(address, ERC20_ABI, MAINNET_PROVIDER);
    const [total, decimals] = await Promise.all([erc20.totalSupply(), erc20.decimals()]);
    const supply = ethers.utils.formatUnits(total, decimals);
    return res.json({ address, decimals, totalSupply: supply });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch total supply', details: String(e && e.message ? e.message : e) });
  }
});

// Social insights endpoint
app.get('/api/social/insights', async (req, res) => {
  try {
    const apiKey = env('GEMINI_API_KEY');
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

    const project = (req.query.project || '').toString().trim();
    const prompt = `You are BaseGuardian. In 80-120 words, give crisp crypto market insights and alerts.
    Include:
    - Overall market direction (bullish/bearish/sideways) and BTC/ETH momentum.
    - Notable on‑chain flows or funding if relevant.
    - 1-3 short alerts (e.g., heightened rugpull chatter, unusual whale activity) with emojis.
    - Keep punchy bullet-like sentences separated by newlines. Avoid markdown tables.
    ${project ? `Focus on any signals related to: ${project}` : ''}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const { data } = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
    }, { timeout: 20000 });

    const text = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text
      ? data.candidates[0].content.parts[0].text
      : '';

    // Derive simple alerts from lines containing emojis or keywords
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const alerts = lines.filter(l => /🚨|⚠️|risk|alert|whale|rugpull|sell-off/i.test(l)).slice(0, 3);

    return res.json({ text, alerts, timestamp: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch insights', details: String(e && e.message ? e.message : e) });
  }
});

// Google News API endpoint
app.get('/api/news', async (req, res) => {
  try {
    const query = (req.query.q || '').toString().trim();
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const newsApiKey = env('GOOGLE_NEWS_API_KEY') || env('VITE_GOOGLE_NEWS');
    if (!newsApiKey) {
      return res.status(500).json({ 
        error: 'Google News API key not configured',
        message: 'Please set GOOGLE_NEWS_API_KEY or VITE_GOOGLE_NEWS environment variable in Vercel'
      });
    }

    // Try Google News API first
    try {
      const gUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=30&sortby=publishedAt&apikey=${newsApiKey}`;
      console.log('Trying Google News API for query:', query);
      const gRes = await axios.get(gUrl, { timeout: 15000 });
      
      if (gRes.status === 200 && Array.isArray(gRes.data.articles) && gRes.data.articles.length > 0) {
        console.log('Google News articles found:', gRes.data.articles.length);
        const articles = gRes.data.articles.map((a) => ({
          title: a.title,
          description: a.description,
          url: a.url,
          source: a.source?.name || 'Unknown',
          publishedAt: a.publishedAt
        }));
        return res.json({ articles, source: 'Google News API' });
      } else if (gRes.data.errors) {
        console.error('Google News API errors:', gRes.data.errors);
      }
    } catch (error) {
      console.error('Google News API error:', error.message);
    }

    // Try NewsAPI as fallback
    try {
      const nUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${newsApiKey}`;
      console.log('Trying NewsAPI as fallback...');
      const nRes = await axios.get(nUrl, { timeout: 15000 });
      
      if (nRes.status === 200 && nRes.data.status === 'ok' && Array.isArray(nRes.data.articles) && nRes.data.articles.length > 0) {
        console.log('NewsAPI articles found:', nRes.data.articles.length);
        const articles = nRes.data.articles.map((a) => ({
          title: a.title,
          description: a.description,
          url: a.url,
          source: a.source?.name || 'Unknown',
          publishedAt: a.publishedAt
        }));
        return res.json({ articles, source: 'NewsAPI' });
      }
    } catch (error) {
      console.error('NewsAPI error:', error.message);
    }

    // Return empty result if both APIs fail
    return res.json({ 
      articles: [], 
      source: 'none',
      error: 'No news articles found. Both Google News API and NewsAPI failed or returned no results.',
      message: 'Please check your API key configuration in Vercel environment variables.'
    });

  } catch (e) {
    return res.status(500).json({ 
      error: 'Failed to fetch news', 
      details: String(e && e.message ? e.message : e) 
    });
  }
});

// Vercel serverless function export
module.exports = app;
