import { AutomationEngine } from './automationEngine.js';
import { ExecutionLogger } from './executionLogger.js';

/**
 * Webhook Handler
 * Processes incoming webhooks from Facebook/messaging platforms
 */
export class WebhookHandler {
  /**
   * Handle incoming message webhook
   */
  static async handleMessageWebhook(webhookData) {
    try {
      const { userId, messageData, platform } = webhookData;

      if (!userId || !messageData) {
        throw new Error('Missing required webhook fields');
      }

      // Validate webhook data
      this.validateWebhookData(messageData);

      // Log incoming message
      ExecutionLogger.logAudit(
        userId,
        'MESSAGE_RECEIVED',
        'MESSAGE',
        messageData.id,
        {
          sender: messageData.sender,
          platform: platform,
          messageLength: messageData.message?.length || 0
        }
      );

      // Process automations
      const automationResults = await AutomationEngine.processMessage(userId, messageData);

      return {
        success: true,
        messageId: messageData.id,
        automationsTriggered: automationResults.length,
        results: automationResults
      };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Handle webhook subscription verification
   */
  static handleVerifyToken(token, verifyToken) {
    if (token === verifyToken) {
      return { valid: true };
    }
    throw new Error('Invalid verification token');
  }

  /**
   * Validate webhook payload structure
   */
  static validateWebhookData(messageData) {
    const required = ['id', 'sender', 'message'];

    for (const field of required) {
      if (!messageData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (typeof messageData.message !== 'string') {
      throw new Error('Message must be a string');
    }

    if (messageData.message.length > 5000) {
      throw new Error('Message exceeds maximum length');
    }
  }

  /**
   * Batch process multiple messages
   */
  static async handleBatchMessages(userId, messages) {
    try {
      const results = [];

      for (const messageData of messages) {
        try {
          const result = await this.handleMessageWebhook({
            userId,
            messageData,
            platform: 'facebook'
          });
          results.push({
            messageId: messageData.id,
            success: true,
            result
          });
        } catch (error) {
          results.push({
            messageId: messageData.id,
            success: false,
            error: error.message
          });
        }
      }

      return {
        totalProcessed: messages.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('Batch processing error:', error);
      throw error;
    }
  }

  /**
   * Get webhook delivery status
   */
  static getWebhookStatus() {
    return {
      status: 'active',
      endpoints: {
        messages: '/webhook/messages',
        verify: '/webhook/verify'
      },
      lastReceived: new Date().toISOString()
    };
  }

  /**
   * Retry failed webhook delivery
   */
  static async retryFailedWebhook(webhookId, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Simulate retry logic
        console.log(`Retry attempt ${attempt} for webhook ${webhookId}`);
        
        // In production, would fetch and re-process the webhook
        return {
          success: true,
          attempt,
          webhookId
        };
      } catch (error) {
        lastError = error;
        console.error(`Retry ${attempt} failed:`, error);
        
        // Exponential backoff
        if (attempt < maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
  }
}
