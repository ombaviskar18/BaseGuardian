const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Bot configuration
const BOT_TOKEN = process.env.VITE_TELE_TOKEN;
const NEWS_API_KEY = process.env.VITE_GOOGLE_NEWS;

// In-memory storage for users
const users = new Map();
let lastUpdateId = 0;

// Helper function to send messages to Telegram
async function sendTelegramMessage(chatId, message) {
  if (!BOT_TOKEN) {
    console.error('Telegram bot token not configured');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', response.statusText);
    } else {
      console.log(`✅ Message sent to ${chatId}:`, message.substring(0, 50) + '...');
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

// Fetch news for a token
async function fetchNewsForToken(token) {
  if (NEWS_API_KEY && NEWS_API_KEY !== 'your_gnews_api_key_here') {
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(token)}&lang=en&max=5&sortby=publishedAt&apikey=${NEWS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data.articles) && data.articles.length > 0) {
        return data.articles.map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source?.name || 'Unknown',
          publishedAt: article.publishedAt
        }));
      }
    } catch (error) {
      console.error('Error fetching news for token:', error);
    }
  }

  // Fallback mock data with real, usable link (Google News search)
  const liveUrl = `https://news.google.com/search?q=${encodeURIComponent(token)}`;
  return [
    {
      title: `${token} Price Update`,
      description: `Latest ${token} market movements and analysis.`,
      url: liveUrl,
      source: 'Google News',
      publishedAt: new Date().toISOString()
    }
  ];
}

// Format news message
function formatNewsMessage(token, articles) {
  let message = `📰 <b>${token} News Update</b>\n\n`;
  
  articles.forEach((article, index) => {
    const timeAgo = getTimeAgo(new Date(article.publishedAt));
    message += `${index + 1}. <b>${article.title}</b>\n`;
    message += `📝 ${article.description.substring(0, 100)}...\n`;
    message += `📰 ${article.source} • ${timeAgo}\n`;
    message += `🔗 <a href="${article.url}">Read More</a>\n\n`;
  });

  return message;
}

// Get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

// Send welcome alerts
async function sendWelcomeAlerts(chatId) {
  const defaultTokens = ['ETH', 'BTC'];
  
  for (const token of defaultTokens) {
    try {
      const articles = await fetchNewsForToken(token);
      if (articles.length > 0) {
        const message = formatNewsMessage(token, articles);
        await sendTelegramMessage(chatId, message);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Error sending welcome alert for ${token}:`, error);
    }
  }
}

// Command handlers
async function handleStart(chatId) {
  const user = {
    chatId,
    isActive: true,
    lastUpdate: Date.now(),
    subscribedTokens: ['ETH', 'BTC'] // Default tokens
  };

  users.set(chatId, user);

  const welcomeMessage = `
🤖 <b>Welcome to Social Alert Bot!</b>

I'll monitor crypto news and trends for you every 10 minutes.

<b>Available Commands:</b>
/start - Start the bot
/stop - Stop the bot
/add [token] - Add a token to monitor (e.g., /add ETH)
/remove [token] - Remove a token from monitoring
/list - Show your monitored tokens
/help - Show this help message

<b>Default Monitoring:</b>
✅ ETH (Ethereum)
✅ BTC (Bitcoin)

<b>Example Commands:</b>
/add ADA
/add SOL
/remove ETH

Your bot is now <b>ACTIVE</b> and monitoring ETH & BTC! 🟢
  `;

  await sendTelegramMessage(chatId, welcomeMessage);
  
  // Send initial alerts for default tokens
  await sendWelcomeAlerts(chatId);
}

async function handleStop(chatId) {
  const user = users.get(chatId);
  if (user) {
    user.isActive = false;
    users.set(chatId, user);
  }

  await sendTelegramMessage(chatId, '🛑 Bot stopped. Use /start to reactivate.');
}

async function handleAdd(chatId, args) {
  if (args.length === 0) {
    await sendTelegramMessage(chatId, '❌ Please specify a token. Example: /add ETH');
    return;
  }

  const token = args[0].toUpperCase();
  const user = users.get(chatId);
  
  if (!user) {
    await sendTelegramMessage(chatId, '❌ Please start the bot first with /start');
    return;
  }

  if (!user.subscribedTokens.includes(token)) {
    user.subscribedTokens.push(token);
    users.set(chatId, user);
    await sendTelegramMessage(chatId, `✅ Added <b>${token}</b> to your monitoring list!`);
  } else {
    await sendTelegramMessage(chatId, `ℹ️ <b>${token}</b> is already in your monitoring list.`);
  }
}

async function handleRemove(chatId, args) {
  if (args.length === 0) {
    await sendTelegramMessage(chatId, '❌ Please specify a token. Example: /remove ETH');
    return;
  }

  const token = args[0].toUpperCase();
  const user = users.get(chatId);
  
  if (!user) {
    await sendTelegramMessage(chatId, '❌ Please start the bot first with /start');
    return;
  }

  const index = user.subscribedTokens.indexOf(token);
  if (index > -1) {
    user.subscribedTokens.splice(index, 1);
    users.set(chatId, user);
    await sendTelegramMessage(chatId, `✅ Removed <b>${token}</b> from your monitoring list.`);
  } else {
    await sendTelegramMessage(chatId, `❌ <b>${token}</b> is not in your monitoring list.`);
  }
}

async function handleList(chatId) {
  const user = users.get(chatId);
  
  if (!user) {
    await sendTelegramMessage(chatId, '❌ Please start the bot first with /start');
    return;
  }

  if (user.subscribedTokens.length === 0) {
    await sendTelegramMessage(chatId, '📝 Your monitoring list is empty. Use /add [token] to add tokens.');
  } else {
    const tokenList = user.subscribedTokens.map(token => `• ${token}`).join('\n');
    await sendTelegramMessage(chatId, `📝 <b>Your Monitored Tokens:</b>\n\n${tokenList}`);
  }
}

async function handleHelp(chatId) {
  const helpMessage = `
🤖 <b>Social Alert Bot Help</b>

<b>Commands:</b>
/start - Start the bot and begin monitoring
/stop - Stop the bot and stop monitoring
/add [token] - Add a cryptocurrency token to monitor
/remove [token] - Remove a token from monitoring
/list - Show all your monitored tokens
/help - Show this help message

<b>Examples:</b>
/add ETH
/add BTC
/add ADA
/remove ETH

<b>Features:</b>
• Real-time crypto news monitoring
• Automatic updates every 10 minutes
• Multiple token support
• Trend analysis and sentiment

<b>Status:</b> 🟢 Running
  `;

  await sendTelegramMessage(chatId, helpMessage);
}

// Poll for updates from Telegram
async function pollUpdates() {
  if (!BOT_TOKEN) {
    console.error('Bot token not configured');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await response.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        if (update.update_id > lastUpdateId) {
          lastUpdateId = update.update_id;
        }

        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const text = update.message.text.trim();
          
          console.log(`📨 Received message from ${chatId}: ${text}`);

          // Parse command and arguments
          const parts = text.split(' ');
          const command = parts[0].toLowerCase();
          const args = parts.slice(1);

          // Handle commands
          switch (command) {
            case '/start':
              await handleStart(chatId);
              break;
            case '/stop':
              await handleStop(chatId);
              break;
            case '/add':
              await handleAdd(chatId, args);
              break;
            case '/remove':
              await handleRemove(chatId, args);
              break;
            case '/list':
              await handleList(chatId);
              break;
            case '/help':
              await handleHelp(chatId);
              break;
            default:
              await sendTelegramMessage(chatId, '❌ Unknown command. Use /help for available commands.');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error polling updates:', error);
  }
}

// Broadcast updates to all active users
async function broadcastUpdates() {
  const activeUsers = Array.from(users.values()).filter(user => user.isActive);
  
  for (const user of activeUsers) {
    for (const token of user.subscribedTokens) {
      try {
        const articles = await fetchNewsForToken(token);
        if (articles.length > 0) {
          const message = formatNewsMessage(token, articles);
          await sendTelegramMessage(user.chatId, message);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error broadcasting update for ${token} to ${user.chatId}:`, error);
      }
    }
  }
}

// API endpoints
app.get('/api/bot/status', (req, res) => {
  const activeUsers = Array.from(users.values()).filter(user => user.isActive).length;
  const totalUsers = users.size;
  
  res.json({
    isRunning: true,
    activeUsers,
    totalUsers
  });
});

app.post('/api/bot/trigger', async (req, res) => {
  try {
    const { chatId, token } = req.body;
    
    if (!chatId || !token) {
      return res.status(400).json({ error: 'chatId and token are required' });
    }

    const articles = await fetchNewsForToken(token);
    if (articles.length > 0) {
      const message = formatNewsMessage(token, articles);
      await sendTelegramMessage(chatId, message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error triggering bot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start polling and broadcasting
let pollingInterval;
let broadcastInterval;

function startBot() {
  console.log('🤖 Starting Telegram bot...');
  
  // Start polling for updates
  pollingInterval = setInterval(pollUpdates, 5000); // Poll every 5 seconds
  
  // Start broadcasting updates
  broadcastInterval = setInterval(broadcastUpdates, 10 * 60 * 1000); // Every 10 minutes
  
  console.log('✅ Bot started successfully!');
  console.log('📡 Polling for updates every 5 seconds');
  console.log('📢 Broadcasting updates every 10 minutes');
}

function stopBot() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
  }
  console.log('🛑 Bot stopped');
}

// Start server and bot
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Bot Token: ${BOT_TOKEN ? 'Configured' : 'Not configured'}`);
  console.log(`📰 News API: ${NEWS_API_KEY ? 'Configured' : 'Not configured'}`);
  
  if (BOT_TOKEN) {
    startBot();
  } else {
    console.log('❌ Please configure VITE_TELE_TOKEN in your .env file');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  stopBot();
  process.exit(0);
});

module.exports = app;
