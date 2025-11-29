import { AutomationService } from './automationService.js';
import { ExecutionLogger } from './executionLogger.js';

/**
 * Automation Engine
 * Processes triggers and executes automation actions
 */
export class AutomationEngine {
  /**
   * Process incoming message against user automations
   */
  static async processMessage(userId, messageData) {
    try {
      const automations = AutomationService.getUserAutomations(userId);
      const enabledAutomations = automations.filter(a => a.enabled);

      const results = [];

      for (const automation of enabledAutomations) {
        const matched = this.matchTrigger(automation, messageData);

        if (matched) {
          const result = await this.executeAction(automation, messageData, userId);
          results.push({
            automationId: automation.id,
            triggered: true,
            result: result
          });

          ExecutionLogger.logExecution(
            automation.id,
            userId,
            result.success ? 'SUCCESS' : 'FAILED',
            {
              trigger: automation.trigger,
              action: automation.action,
              executionTimeMs: result.executionTime,
              messageId: messageData.id
            }
          );

          ExecutionLogger.logAudit(
            userId,
            'AUTOMATION_EXECUTED',
            'AUTOMATION',
            automation.id,
            { trigger: automation.trigger, action: automation.action }
          );
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Match incoming message against automation trigger
   */
  static matchTrigger(automation, messageData) {
    const trigger = automation.trigger.toLowerCase();
    const message = messageData.message?.toLowerCase() || '';
    const sender = messageData.sender?.toLowerCase() || '';

    // Keyword matching
    if (trigger.includes('keyword:')) {
      const keyword = trigger.replace('keyword:', '').trim();
      return message.includes(keyword);
    }

    // Sender matching
    if (trigger.includes('from:')) {
      const senderPattern = trigger.replace('from:', '').trim();
      return sender.includes(senderPattern);
    }

    // Simple substring match
    return message.includes(trigger);
  }

  /**
   * Execute automation action
   */
  static async executeAction(automation, messageData, userId) {
    const startTime = Date.now();

    try {
      let actionResult;

      switch (automation.action) {
        case 'SEND_MESSAGE':
          actionResult = await this.sendMessage(automation, messageData);
          break;

        case 'FORWARD':
          actionResult = await this.forwardMessage(automation, messageData);
          break;

        case 'ARCHIVE':
          actionResult = await this.archiveMessage(automation, messageData);
          break;

        default:
          throw new Error(`Unknown action: ${automation.action}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        action: automation.action,
        executionTime,
        details: actionResult
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        action: automation.action,
        executionTime,
        error: error.message
      };
    }
  }

  /**
   * Send automated message
   */
  static async sendMessage(automation, messageData) {
    // TODO: Integrate with Facebook/messaging service
    // This would call the actual messaging API

    const message = this.substituteVariables(
      automation.responseMessage || 'Auto-reply',
      messageData
    );

    return {
      type: 'SEND_MESSAGE',
      message: message,
      recipient: messageData.sender,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Forward message to specified contact
   */
  static async forwardMessage(automation, messageData) {
    // TODO: Integrate with Facebook/messaging service

    return {
      type: 'FORWARD',
      originalMessage: messageData.message,
      forwardTo: automation.forwardTo || 'admin',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Archive message
   */
  static async archiveMessage(automation, messageData) {
    // TODO: Implement archiving logic

    return {
      type: 'ARCHIVE',
      messageId: messageData.id,
      archivedAt: new Date().toISOString()
    };
  }

  /**
   * Substitute variables in message template
   */
  static substituteVariables(template, messageData) {
    let result = template;

    result = result.replace(/\{sender\}/g, messageData.sender || 'User');
    result = result.replace(/\{message\}/g, messageData.message || '');
    result = result.replace(/\{time\}/g, new Date().toLocaleTimeString());
    result = result.replace(/\{date\}/g, new Date().toLocaleDateString());

    return result;
  }

  /**
   * Get automation statistics for user
   */
  static getAutomationStats(userId) {
    try {
      const automations = AutomationService.getUserAutomations(userId);

      const stats = automations.map(auto => ({
        id: auto.id,
        name: auto.name,
        enabled: auto.enabled,
        executionStats: ExecutionLogger.getExecutionStats(auto.id)
      }));

      return {
        totalAutomations: automations.length,
        enabledAutomations: automations.filter(a => a.enabled).length,
        automations: stats
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { totalAutomations: 0, enabledAutomations: 0, automations: [] };
    }
  }
}
