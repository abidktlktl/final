# COMPLETE AUTOMATION FLOW GUIDE

**Status:** Phase 3 - Execution Engine  
**Date:** November 29, 2025  
**Version:** 1.0

## Architecture Overview

```
Facebook/Platform
       ↓
  Webhook Endpoint
       ↓
  Webhook Handler (Validates & Logs)
       ↓
  Automation Engine (Matches & Executes)
       ↓
  Action Executor (SEND/FORWARD/ARCHIVE)
       ↓
  Execution Logger (Records Results)
```

## Complete Flow Step-by-Step

### 1. Message Reception (Webhook)
```javascript
POST /webhook/messages
{
  "userId": "user-123",
  "messageData": {
    "id": "msg-456",
    "sender": "John Doe",
    "message": "Hello, I need help"
  }
}
```

**What Happens:**
- WebhookHandler validates the payload
- Checks for required fields (id, sender, message)
- Validates message length (max 5000 chars)
- Logs audit event "MESSAGE_RECEIVED"

### 2. Trigger Matching
```javascript
AutomationEngine.matchTrigger(automation, messageData)
```

**Supported Trigger Patterns:**

```
1. Keyword Matching:
   Trigger: "keyword:help"
   Message: "I need help"
   → MATCHES ✓

2. Sender Matching:
   Trigger: "from:john"
   Sender: "John Doe"
   → MATCHES ✓

3. Simple Substring:
   Trigger: "urgent"
   Message: "This is urgent!"
   → MATCHES ✓
```

### 3. Action Execution

#### SEND_MESSAGE
```javascript
{
  "action": "SEND_MESSAGE",
  "responseMessage": "Hi {sender}, thank you for reaching out!"
}
```

**Variables Supported:**
- `{sender}` - Sender name
- `{message}` - Original message
- `{time}` - Current time
- `{date}` - Current date

**Example Output:**
```
Hi John Doe, thank you for reaching out!
Sent at 04:42 PM on 11/29/2025
```

#### FORWARD
```javascript
{
  "action": "FORWARD",
  "forwardTo": "admin@company.com"
}
```

**What Happens:**
- Message forwarded to specified contact
- Original context preserved
- Audit trail created

#### ARCHIVE
```javascript
{
  "action": "ARCHIVE"
}
```

**What Happens:**
- Message marked as archived
- Moved to archive folder
- Can be retrieved later

### 4. Execution Logging

Each automation execution is logged with:
```javascript
{
  "timestamp": "2025-11-29T04:42:00Z",
  "automationId": "auto_1234",
  "userId": "user-123",
  "status": "SUCCESS",
  "executionTimeMs": 45,
  "trigger": "keyword:help",
  "action": "SEND_MESSAGE",
  "messageId": "msg-456"
}
```

### 5. Response to User

```javascript
{
  "success": true,
  "messageId": "msg-456",
  "automationsTriggered": 2,
  "results": [
    {
      "automationId": "auto_1",
      "triggered": true,
      "result": {
        "success": true,
        "action": "SEND_MESSAGE",
        "executionTime": 45,
        "details": {
          "message": "Auto-reply sent"
        }
      }
    },
    {
      "automationId": "auto_2",
      "triggered": true,
      "result": {
        "success": true,
        "action": "ARCHIVE",
        "executionTime": 12
      }
    }
  ]
}
```

## Integration Requirements

### 1. Server Endpoints Needed

```javascript
// Webhook handler
POST /webhook/messages
- Receives incoming messages
- Calls WebhookHandler.handleMessageWebhook()

// Webhook verification
GET /webhook/verify
- Facebook webhook subscription validation
- Calls WebhookHandler.handleVerifyToken()

// Stats endpoint
GET /api/automations/stats
- Returns automation statistics
- Calls AutomationEngine.getAutomationStats()

// Retry failed webhooks
POST /api/webhooks/retry/:webhookId
- Retry failed automation
- Calls WebhookHandler.retryFailedWebhook()
```

### 2. TODO Items for Integration

**High Priority:**
- [ ] Add webhook endpoint to backend/server.js
- [ ] Import AutomationEngine in server
- [ ] Import WebhookHandler in server
- [ ] Configure webhook routes
- [ ] Set up webhook verification token in .env
- [ ] Add error handling for webhook failures

**Medium Priority:**
- [ ] Implement actual Facebook API integration
- [ ] Add message queue for reliability
- [ ] Implement retry logic with exponential backoff
- [ ] Add webhook signature verification

**Low Priority:**
- [ ] Add conditional logic (if/then)
- [ ] Add scheduling support
- [ ] Add template library
- [ ] Add webhook replay functionality

## Example Automation Scenarios

### Scenario 1: Auto-Reply
```
User creates automation:
- Trigger: "keyword:hi"
- Action: SEND_MESSAGE
- Message: "Hi {sender}! Someone will help you soon."

Flow:
1. Customer: "Hi, I have a question"
2. Message matches trigger
3. Auto-reply sent: "Hi Customer! Someone will help you soon."
4. Execution logged
```

### Scenario 2: Forward to Team
```
User creates automation:
- Trigger: "from:support"
- Action: FORWARD
- Forward to: "team@company.com"

Flow:
1. Support: "Can you help with this?"
2. Trigger matches sender
3. Message forwarded to team
4. Team gets notified
5. Execution logged
```

### Scenario 3: Auto-Archive Spam
```
User creates automation:
- Trigger: "keyword:unsubscribe"
- Action: ARCHIVE

Flow:
1. Bot: "Click here to unsubscribe"
2. Trigger matches
3. Message archived
4. Removed from inbox
5. Execution logged
```

## File Structure

```
backend/
├── services/
│   ├── automationService.js    (CRUD)
│   ├── automationEngine.js     (Execution)
│   ├── webhookHandler.js       (Reception)
│   └── executionLogger.js      (Logging)
├── middleware/
│   ├── authenticateToken.js    (Auth)
│   ├── validation.js           (Validation)
│   ├── errorHandler.js         (Errors)
│   └── rateLimit.js            (Rate Limit)
└── logs/
    ├── execution.log           (Executions)
    └── audit.log               (Audit Trail)
```

## Performance Metrics

### Expected Execution Times
- Message reception: ~10ms
- Trigger matching: ~5ms per automation
- Action execution: ~20-50ms
- Logging: ~5ms
- **Total:** ~50-150ms per message

### Scalability
- Current: ~1000 automations per user
- With database: ~1M automations system-wide
- Concurrent users: ~100 with JSON storage
- With queue: ~10,000 concurrent users

## Error Handling

### Common Errors

1. **INVALID_TRIGGER**
   - Empty trigger
   - Invalid pattern
   - Fix: Validate trigger format

2. **ACTION_FAILED**
   - Message send failed
   - Forward failed
   - Fix: Retry with exponential backoff

3. **UNAUTHORIZED**
   - Invalid token
   - User mismatch
   - Fix: Re-authenticate

4. **RATE_LIMIT_EXCEEDED**
   - Too many requests
   - Fix: Wait before retry

### Error Response

```javascript
{
  "success": false,
  "error": "Invalid trigger pattern",
  "code": "INVALID_TRIGGER",
  "requestId": "req-789",
  "timestamp": "2025-11-29T04:42:00Z"
}
```

## Testing the Flow

### Test 1: Create Automation
```bash
curl -X POST http://localhost:5000/api/automations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Help Auto-Reply",
    "trigger": "keyword:help",
    "action": "SEND_MESSAGE",
    "responseMessage": "Help is on the way!"
  }'
```

### Test 2: Send Message via Webhook
```bash
curl -X POST http://localhost:5000/webhook/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "messageData": {
      "id": "msg-123",
      "sender": "John",
      "message": "Can you help me?"
    }
  }'
```

### Test 3: Check Stats
```bash
curl -X GET http://localhost:5000/api/automations/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. **Integration:** Add webhook endpoints to server.js
2. **Testing:** Test flow with sample messages
3. **Monitoring:** Set up execution monitoring
4. **Optimization:** Add caching and indexing
5. **Database:** Migrate to PostgreSQL when ready

## Files Created in Phase 3

✅ **automationEngine.js** (230 lines)
- Trigger matching
- Action execution
- Variable substitution
- Statistics collection

✅ **webhookHandler.js** (160 lines)
- Webhook reception
- Validation
- Batch processing
- Retry logic

✅ **AUTOMATION_FLOW_COMPLETE.md** (This file)
- Complete documentation
- Architecture diagrams
- Integration guide
- Testing examples
