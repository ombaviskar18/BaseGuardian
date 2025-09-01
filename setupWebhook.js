const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const BOT_TOKEN = process.env.VITE_TELE_TOKEN;

async function setupWebhook() {
  if (!BOT_TOKEN) {
    console.error('❌ Bot token not found in environment variables');
    console.log('Please make sure VITE_TELE_TOKEN is set in your .env file');
    return;
  }

  // For local development, you'll need to use ngrok or similar to expose your local server
  // Replace this URL with your actual public URL
  const webhookUrl = 'https://your-public-url.com/webhook/telegram';
  
  // For testing, you can use ngrok: ngrok http 3001
  // Then use the ngrok URL as your webhook URL

  try {
    console.log('🔧 Setting up Telegram webhook...');
    console.log(`📡 Webhook URL: ${webhookUrl}`);
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message']
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log('🤖 Your bot is now ready to receive messages');
    } else {
      console.error('❌ Failed to set webhook:', result.description);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error.message);
  }
}

// Alternative: Use polling instead of webhook for development
async function deleteWebhook() {
  if (!BOT_TOKEN) {
    console.error('❌ Bot token not found');
    return;
  }

  try {
    console.log('🗑️ Deleting webhook...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.error('❌ Failed to delete webhook:', result.description);
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
  }
}

// Get bot info
async function getBotInfo() {
  if (!BOT_TOKEN) {
    console.error('❌ Bot token not found');
    return;
  }

  try {
    console.log('🤖 Getting bot info...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Bot info:');
      console.log(`   Name: ${result.result.first_name}`);
      console.log(`   Username: @${result.result.username}`);
      console.log(`   ID: ${result.result.id}`);
    } else {
      console.error('❌ Failed to get bot info:', result.description);
    }
  } catch (error) {
    console.error('❌ Error getting bot info:', error.message);
  }
}

// Check webhook status
async function getWebhookInfo() {
  if (!BOT_TOKEN) {
    console.error('❌ Bot token not found');
    return;
  }

  try {
    console.log('📡 Getting webhook info...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook info:');
      console.log(`   URL: ${result.result.url || 'Not set'}`);
      console.log(`   Has custom certificate: ${result.result.has_custom_certificate}`);
      console.log(`   Pending update count: ${result.result.pending_update_count}`);
      console.log(`   Last error date: ${result.result.last_error_date || 'None'}`);
      console.log(`   Last error message: ${result.result.last_error_message || 'None'}`);
    } else {
      console.error('❌ Failed to get webhook info:', result.description);
    }
  } catch (error) {
    console.error('❌ Error getting webhook info:', error.message);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      await setupWebhook();
      break;
    case 'delete':
      await deleteWebhook();
      break;
    case 'info':
      await getBotInfo();
      break;
    case 'webhook':
      await getWebhookInfo();
      break;
    default:
      console.log('🤖 Telegram Bot Setup Script');
      console.log('');
      console.log('Usage:');
      console.log('  node setupWebhook.js setup    - Set up webhook');
      console.log('  node setupWebhook.js delete   - Delete webhook');
      console.log('  node setupWebhook.js info     - Get bot info');
      console.log('  node setupWebhook.js webhook  - Get webhook info');
      console.log('');
      console.log('Note: For local development, you need to expose your server publicly.');
      console.log('You can use ngrok: ngrok http 3001');
      console.log('Then update the webhook URL in setupWebhook.js');
  }
}

main().catch(console.error);
