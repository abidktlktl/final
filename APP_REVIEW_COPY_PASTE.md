# Facebook App Review - Copy & Paste Guide

## 1. Permission to Request
`instagram_manage_messages`

## 2. Use Case Description (Copy This)

```
Our application provides automated customer engagement for Instagram Business accounts. When users comment on our Instagram posts, our system automatically sends them a private message with personalized content, exclusive offers, or detailed information that's too sensitive for public comments.

The Private Reply feature allows businesses to:
- Move conversations from public comments to private DMs
- Protect user privacy for sensitive discussions
- Deliver exclusive content to engaged followers
- Provide instant customer service

Current Status: Feature is fully implemented but blocked by permission restrictions (Error Code #3).
```

## 3. Step-by-Step Instructions (Copy This)

```
1. User comments on any Instagram post from @business_barakah
2. Our webhook receives the comment notification
3. System checks if auto-DM is enabled for that post
4. Attempts to send Private Reply using Instagram Graph API
5. User receives DM with configured message

Note: Currently returns Error #3 as expected for apps awaiting permission approval. Feature will work immediately upon approval.
```

## 4. Platform (Copy This)

```
Platform: Instagram
API Version: v18.0
Integration Type: Webhooks + Graph API
```

## 5. Test Account Details (Copy This)

```
Business Account: @business_barakah
Account ID: 17841476775670281
Dashboard URL: https://dn-production.up.railway.app
```

## 6. Data Use Checkboxes

Check these boxes in the submission form:
- ✅ Get a list of comments on Instagram Business IG Media
- ✅ Send private replies to comments on Instagram Business IG Media

## 7. Screencast Notes (Copy This for Video Description)

```
This video demonstrates our Private Reply automation feature. When users comment on Instagram posts, our system automatically sends them a private message. The feature is fully implemented but requires instagram_manage_messages permission to function in production. Currently showing Error Code #3 which is expected behavior for apps awaiting approval.
```

## 8. Additional Notes (Copy This)

```
We have successfully implemented:
- Complete webhook integration (179 comment replies sent)
- Private Reply API calls with proper formatting
- Error handling and retry logic
- User interface for configuration

The implementation is complete and will work immediately upon approval of this permission request.

Current Error: Code #3 "Application does not have the capability to make this API call"
This is expected for apps awaiting instagram_manage_messages permission approval.
```

## 9. If Rejected - Response Template (Save for Later)

```
Thank you for reviewing our submission. We understand your feedback.

Our use case is legitimate because:
1. Users explicitly engage by commenting first
2. We move sensitive conversations to private messages
3. This protects user privacy
4. Businesses need this for customer service

We've updated our submission with additional clarification. The feature is fully implemented and only needs permission approval to function.

Please reconsider our application.
```

## 10. Submission URL

https://developers.facebook.com/apps/1339568027817682/app-review/

---

**IMPORTANT:** 
- Take screenshot of `private-reply-flow-diagram.html`
- Take screenshot of Error #3 from terminal
- Record a short video explaining the feature (even with mockups)
- Submit and wait 5-10 business days
