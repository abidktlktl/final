import fs from 'fs';
import path from 'path';

const logsDir = 'backend/logs';

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const executionLogPath = path.join(logsDir, 'execution.log');
const auditLogPath = path.join(logsDir, 'audit.log');

/**
 * Execution Logger Service
 * Logs automation executions and audit events
 */
export class ExecutionLogger {
  /**
   * Log automation execution
   */
  static logExecution(automationId, userId, status, details = {}) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        automationId,
        userId,
        status,
        ...details
      };

      fs.appendFileSync(executionLogPath, JSON.stringify(logEntry) + '\n');
      return logEntry;
    } catch (error) {
      console.error('Failed to log execution:', error);
    }
  }

  /**
   * Log audit event
   */
  static logAudit(userId, action, resourceType, resourceId, details = {}) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId,
        action,
        resourceType,
        resourceId,
        ...details
      };

      fs.appendFileSync(auditLogPath, JSON.stringify(logEntry) + '\n');
      return logEntry;
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }

  /**
   * Get execution logs for automation
   */
  static getExecutionLogs(automationId, limit = 100) {
    try {
      if (!fs.existsSync(executionLogPath)) {
        return [];
      }

      const logs = fs.readFileSync(executionLogPath, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log && log.automationId === automationId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      return logs;
    } catch (error) {
      console.error('Failed to retrieve execution logs:', error);
      return [];
    }
  }

  /**
   * Get execution statistics
   */
  static getExecutionStats(automationId) {
    try {
      if (!fs.existsSync(executionLogPath)) {
        return {
          totalRuns: 0,
          successCount: 0,
          failureCount: 0,
          avgExecutionTime: 0
        };
      }

      const logs = fs.readFileSync(executionLogPath, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log && log.automationId === automationId);

      return {
        totalRuns: logs.length,
        successCount: logs.filter(l => l.status === 'SUCCESS').length,
        failureCount: logs.filter(l => l.status === 'FAILED').length,
        avgExecutionTime: logs.length > 0
          ? Math.round(logs.reduce((sum, l) => sum + (l.executionTimeMs || 0), 0) / logs.length)
          : 0
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return { totalRuns: 0, successCount: 0, failureCount: 0, avgExecutionTime: 0 };
    }
  }

  /**
   * Get audit logs for user
   */
  static getAuditLogs(userId, limit = 100) {
    try {
      if (!fs.existsSync(auditLogPath)) {
        return [];
      }

      const logs = fs.readFileSync(auditLogPath, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log && log.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      return logs;
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }
}
