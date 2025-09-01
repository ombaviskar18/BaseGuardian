interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface BotUser {
  chatId: number;
  isActive: boolean;
  lastUpdate: number;
  subscribedTokens: string[];
}

class TelegramBotManager {
  private botToken: string;
  private users: Map<number, BotUser> = new Map();
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.botToken = import.meta.env.VITE_TELE_TOKEN || '';
    this.loadUsers();
    // Start monitoring automatically
    this.startMonitoring();
  }

  private loadUsers() {
    const savedUsers = localStorage.getItem('telegramBotUsers');
    if (savedUsers) {
      const usersArray = JSON.parse(savedUsers);
      this.users = new Map(usersArray);
    }
  }

  private saveUsers() {
    const usersArray = Array.from(this.users.entries());
    localStorage.setItem('telegramBotUsers', JSON.stringify(usersArray));
  }

  async sendMessage(chatId: number, message: string) {
    if (!this.botToken) {
      console.error('Telegram bot token not configured');
      return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
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
      }
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }

  async handleCommand(chatId: number, command: string, args: string[] = []) {
    switch (command) {
      case '/start':
        await this.handleStart(chatId);
        break;
      case '/stop':
        await this.handleStop(chatId);
        break;
      case '/add':
        await this.handleAdd(chatId, args);
        break;
      case '/remove':
        await this.handleRemove(chatId, args);
        break;
      case '/list':
        await this.handleList(chatId);
        break;
      case '/help':
        await this.handleHelp(chatId);
        break;
      default:
        await this.sendMessage(chatId, '❌ Unknown command. Use /help for available commands.');
    }
  }

  private async handleStart(chatId: number) {
    const user: BotUser = {
      chatId,
      isActive: true,
      lastUpdate: Date.now(),
      subscribedTokens: ['ETH', 'BTC'] // Default tokens
    };

    this.users.set(chatId, user);
    this.saveUsers();

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

    await this.sendMessage(chatId, welcomeMessage);
    
    // Send initial alerts for default tokens
    await this.sendWelcomeAlerts(chatId);
  }

  private async handleStop(chatId: number) {
    const user = this.users.get(chatId);
    if (user) {
      user.isActive = false;
      this.users.set(chatId, user);
      this.saveUsers();
    }

    await this.sendMessage(chatId, '🛑 Bot stopped. Use /start to reactivate.');
  }

  private async handleAdd(chatId: number, args: string[]) {
    if (args.length === 0) {
      await this.sendMessage(chatId, '❌ Please specify a token. Example: /add ETH');
      return;
    }

    const token = args[0].toUpperCase();
    const user = this.users.get(chatId);
    
    if (!user) {
      await this.sendMessage(chatId, '❌ Please start the bot first with /start');
      return;
    }

    if (!user.subscribedTokens.includes(token)) {
      user.subscribedTokens.push(token);
      this.users.set(chatId, user);
      this.saveUsers();
      await this.sendMessage(chatId, `✅ Added <b>${token}</b> to your monitoring list!`);
    } else {
      await this.sendMessage(chatId, `ℹ️ <b>${token}</b> is already in your monitoring list.`);
    }
  }

  private async handleRemove(chatId: number, args: string[]) {
    if (args.length === 0) {
      await this.sendMessage(chatId, '❌ Please specify a token. Example: /remove ETH');
      return;
    }

    const token = args[0].toUpperCase();
    const user = this.users.get(chatId);
    
    if (!user) {
      await this.sendMessage(chatId, '❌ Please start the bot first with /start');
      return;
    }

    const index = user.subscribedTokens.indexOf(token);
    if (index > -1) {
      user.subscribedTokens.splice(index, 1);
      this.users.set(chatId, user);
      this.saveUsers();
      await this.sendMessage(chatId, `✅ Removed <b>${token}</b> from your monitoring list.`);
    } else {
      await this.sendMessage(chatId, `❌ <b>${token}</b> is not in your monitoring list.`);
    }
  }

  private async handleList(chatId: number) {
    const user = this.users.get(chatId);
    
    if (!user) {
      await this.sendMessage(chatId, '❌ Please start the bot first with /start');
      return;
    }

    if (user.subscribedTokens.length === 0) {
      await this.sendMessage(chatId, '📝 Your monitoring list is empty. Use /add [token] to add tokens.');
    } else {
      const tokenList = user.subscribedTokens.map(token => `• ${token}`).join('\n');
      await this.sendMessage(chatId, `📝 <b>Your Monitored Tokens:</b>\n\n${tokenList}`);
    }
  }

  private async handleHelp(chatId: number) {
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

<b>Status:</b> ${this.isRunning ? '🟢 Running' : '🔴 Stopped'}
    `;

    await this.sendMessage(chatId, helpMessage);
  }

  private async sendWelcomeAlerts(chatId: number) {
    // Send initial alerts for default tokens
    const defaultTokens = ['ETH', 'BTC'];
    
    for (const token of defaultTokens) {
      try {
        const articles = await this.fetchNewsForToken(token);
        if (articles.length > 0) {
          const message = this.formatNewsMessage(token, articles);
          await this.sendMessage(chatId, message);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error sending welcome alert for ${token}:`, error);
      }
    }
  }

  private async fetchNewsForToken(token: string): Promise<NewsArticle[]> {
    const NEWS_API_KEY = import.meta.env.VITE_GOOGLE_NEWS || '';
    
    if (NEWS_API_KEY && NEWS_API_KEY !== 'your_gnews_api_key_here') {
      try {
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(token)}&lang=en&max=5&sortby=publishedAt&apikey=${NEWS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok && Array.isArray(data.articles) && data.articles.length > 0) {
          return data.articles.map((article: any) => ({
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

    // Fallback mock data
    return [
      {
        title: `${token} Price Update`,
        description: `Latest ${token} market movements and analysis.`,
        url: `https://example.com/${token.toLowerCase()}`,
        source: 'CryptoNews',
        publishedAt: new Date().toISOString()
      }
    ];
  }

  private formatNewsMessage(token: string, articles: NewsArticle[]): string {
    let message = `📰 <b>${token} News Update</b>\n\n`;
    
    articles.forEach((article, index) => {
      const timeAgo = this.getTimeAgo(new Date(article.publishedAt));
      message += `${index + 1}. <b>${article.title}</b>\n`;
      message += `📝 ${article.description.substring(0, 100)}...\n`;
      message += `📰 ${article.source} • ${timeAgo}\n`;
      message += `🔗 <a href="${article.url}">Read More</a>\n\n`;
    });

    return message;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  async startMonitoring() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🤖 Telegram bot monitoring started');
    
    // The backend server handles the actual monitoring
    // This is just for frontend status tracking
  }

  async stopMonitoring() {
    this.isRunning = false;
    console.log('🤖 Telegram bot monitoring stopped');
  }

  private async broadcastUpdates() {
    const activeUsers = Array.from(this.users.values()).filter(user => user.isActive);
    
    for (const user of activeUsers) {
      for (const token of user.subscribedTokens) {
        try {
          const articles = await this.fetchNewsForToken(token);
          if (articles.length > 0) {
            const message = this.formatNewsMessage(token, articles);
            await this.sendMessage(user.chatId, message);
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error broadcasting update for ${token} to ${user.chatId}:`, error);
        }
      }
    }
  }

  async getStatus() {
    try {
      const response = await fetch('http://localhost:3001/api/bot/status');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
    }
    
    return {
      isRunning: this.isRunning,
      activeUsers: Array.from(this.users.values()).filter(user => user.isActive).length,
      totalUsers: this.users.size
    };
  }
}

export const telegramBot = new TelegramBotManager();
