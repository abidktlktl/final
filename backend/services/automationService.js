import fs from 'fs';

/**
 * Automation Service
 * Handles all automation business logic
 */
export class AutomationService {
  /**
   * Get all automations for a user
   */
  static getUserAutomations(userId) {
    try {
      const automations = JSON.parse(fs.readFileSync('backend/data/automations.json', 'utf8'));
      return automations.filter(a => a.userId === userId);
    } catch (error) {
      throw new Error(`Failed to retrieve automations: ${error.message}`);
    }
  }

  /**
   * Get single automation with ownership check
   */
  static getAutomation(automationId, userId) {
    try {
      const automations = JSON.parse(fs.readFileSync('backend/data/automations.json', 'utf8'));
      const automation = automations.find(
        a => a.id === automationId && a.userId === userId
      );

      if (!automation) {
        throw new Error('Automation not found or not owned by user');
      }

      return automation;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new automation
   */
  static createAutomation(userId, automationData) {
    try {
      const automations = JSON.parse(fs.readFileSync('backend/data/automations.json', 'utf8'));

      const newAutomation = {
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        ...automationData,
        enabled: automationData.enabled !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      automations.push(newAutomation);
      fs.writeFileSync('backend/data/automations.json', JSON.stringify(automations, null, 2));

      return newAutomation;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update automation
   */
  static updateAutomation(automationId, userId, updates) {
    try {
      const automations = JSON.parse(fs.readFileSync('backend/data/automations.json', 'utf8'));

      const index = automations.findIndex(
        a => a.id === automationId && a.userId === userId
      );

      if (index === -1) {
        throw new Error('Automation not found or not owned by user');
      }

      automations[index] = {
        ...automations[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync('backend/data/automations.json', JSON.stringify(automations, null, 2));

      return automations[index];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete automation
   */
  static deleteAutomation(automationId, userId) {
    try {
      const automations = JSON.parse(fs.readFileSync('backend/data/automations.json', 'utf8'));

      const index = automations.findIndex(
        a => a.id === automationId && a.userId === userId
      );

      if (index === -1) {
        throw new Error('Automation not found or not owned by user');
      }

      automations.splice(index, 1);
      fs.writeFileSync('backend/data/automations.json', JSON.stringify(automations, null, 2));

      return true;
    } catch (error) {
      throw error;
    }
  }
}
