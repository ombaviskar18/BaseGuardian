import { telegramBot } from './telegramBot';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
}

export const handleTelegramWebhook = async (update: TelegramUpdate) => {
  if (!update.message || !update.message.text) {
    return;
  }

  const chatId = update.message.chat.id;
  const text = update.message.text.trim();
  
  // Parse command and arguments
  const parts = text.split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  console.log(`Received command: ${command} with args:`, args);

  // Handle the command
  await telegramBot.handleCommand(chatId, command, args);
};

// Function to set up webhook (call this when bot starts)
export const setupTelegramWebhook = async () => {
  const botToken = import.meta.env.VITE_TELE_TOKEN;
  
  if (!botToken) {
    console.error('Telegram bot token not configured');
    return;
  }

  try {
    // Set webhook URL (you'll need to replace with your actual webhook URL)
    const webhookUrl = `${window.location.origin}/api/telegram-webhook`;
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
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
      console.log('Telegram webhook set successfully');
    } else {
      console.error('Failed to set webhook:', result.description);
    }
  } catch (error) {
    console.error('Error setting up webhook:', error);
  }
};
