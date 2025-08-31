# Stripe Webhook Implementation Guide

## Overview

This document describes the comprehensive Stripe webhook implementation for the Pro License Generator application. The webhook handler securely processes Stripe events, manages license lifecycle, tracks subscriptions and invoices, and ensures data consistency between Stripe and our database.

## Features

### ✅ Implemented Features

- **Secure Webhook Verification**: Stripe signature verification to prevent unauthorized requests
- **Event Deduplication**: MongoDB-based deduplication to prevent processing the same event multiple times
- **Comprehensive Event Handling**: Support for all major Stripe webhook events
- **License Management**: Automatic license creation, renewal, and deactivation
- **Subscription Tracking**: Complete subscription lifecycle management
- **Invoice Management**: Full invoice tracking and status updates
- **User Profile Enrichment**: Automatic profile updates from Stripe customer data
- **Email Notifications**: Asynchronous email delivery via SQS
- **Error Handling**: Graceful error handling with proper HTTP responses
- **Subscription Management API**: User dashboard integration for subscription control

### 🔄 Supported Webhook Events

| Event | Description | Actions |
|-------|-------------|---------|
| `checkout.session.completed` | Payment completed | Create licenses, update subscriptions, enrich user profiles |
| `invoice.paid` | Invoice payment successful | Renew licenses, update subscription periods |
| `invoice.payment_failed` | Payment failed | Send failure notifications, update invoice status |
| `customer.subscription.created` | New subscription | Create subscription records |
| `customer.subscription.updated` | Subscription modified | Update quantities, manage licenses |
| `customer.subscription.deleted` | Subscription cancelled | Deactivate licenses, update status |
| `invoice.created` | Invoice created | Store invoice metadata |
| `invoice.finalized` | Invoice finalized | Update invoice status |

## Architecture

### Webhook Handler Structure

```
POST /api/stripe/webhook
├── Signature Verification
├── Event Deduplication
├── Event Routing
│   ├── Checkout Session Handler
│   ├── Invoice Handler
│   ├── Subscription Handler
│   └── Payment Failure Handler
├── Database Updates
├── Email Notifications
└── Event Logging
```

### Database Models

- **User**: Customer information and Stripe integration
- **License**: License keys, status, and subscription links
- **BillingSubscription**: Stripe subscription tracking
- **BillingInvoice**: Invoice records and status
- **ProcessedWebhookEvent**: Webhook deduplication and logging

## Integration Points

### 1. User Dashboard Integration

#### Subscription Management API

**Endpoint**: `POST /api/stripe/subscription-management`

**Actions**:
- `cancel`: Cancel subscription (immediate or end of period)
- `reactivate`: Reactivate cancelled subscription
- `update_quantity`: Change license quantity

**Example Usage**:
```typescript
// Cancel subscription at period end
const response = await fetch('/api/stripe/subscription-management', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'cancel',
    subscriptionId: 'sub_1234567890',
    userId: 'user_id_here',
    cancelAtPeriodEnd: true
  })
});

// Update license quantity
const response = await fetch('/api/stripe/subscription-management', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update_quantity',
    subscriptionId: 'sub_1234567890',
    userId: 'user_id_here',
    newQuantity: 5
  })
});
```

### 2. Frontend Components

#### Subscription Management UI

```typescript
// Example React component for subscription management
const SubscriptionManager = ({ subscription }) => {
  const handleCancel = async () => {
    try {
      const response = await fetch('/api/stripe/subscription-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          subscriptionId: subscription.id,
          userId: user.id,
          cancelAtPeriodEnd: true
        })
      });
      
      if (response.ok) {
        // Handle success
        toast.success('Subscription cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  return (
    <div>
      <h3>Subscription: {subscription.id}</h3>
      <p>Status: {subscription.status}</p>
      <p>Plan: {subscription.plan}</p>
      <button onClick={handleCancel}>Cancel Subscription</button>
    </div>
  );
};
```

### 3. License Management Integration

#### License Status Updates

The webhook automatically updates license statuses based on subscription changes:

```typescript
// Example: Check license status
const checkLicenseStatus = async (licenseId: string) => {
  const license = await License.findById(licenseId);
  
  if (license.status === 'active') {
    const isExpired = isLicenseExpired(license.expiryDate);
    const isExpiringSoon = isLicenseExpiringSoon(license.expiryDate, 7);
    
    if (isExpired) {
      // Handle expired license
    } else if (isExpiringSoon) {
      // Send renewal reminder
    }
  }
};
```

## Configuration

### Environment Variables

```bash
# Required
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_SECRET_KEY=sk_test_or_live_key_here

# Optional
STRIPE_WEBHOOK_ENDPOINT=https://yourdomain.com/api/stripe/webhook
```

### Stripe Dashboard Setup

1. **Webhook Endpoint**: Configure webhook endpoint in Stripe Dashboard
2. **Events**: Select all relevant events for your business
3. **Version**: Use latest API version (2023-10-16 or newer)
4. **Retry Logic**: Configure retry attempts and intervals

## Best Practices

### 1. Webhook Security

- **Always verify signatures**: Never skip Stripe signature verification
- **Use HTTPS**: Ensure webhook endpoint is HTTPS-only
- **Validate events**: Check event types and data before processing
- **Rate limiting**: Implement rate limiting for webhook endpoints

### 2. Error Handling

- **Return 200**: Always return HTTP 200 to prevent Stripe retries
- **Log errors**: Comprehensive error logging for debugging
- **Graceful degradation**: Handle partial failures without breaking the system
- **Monitoring**: Set up alerts for webhook failures

### 3. Data Consistency

- **Atomic operations**: Use database transactions where possible
- **Idempotency**: Ensure operations can be safely repeated
- **Validation**: Validate all incoming data before processing
- **Rollback**: Implement rollback mechanisms for failed operations

### 4. Performance

- **Async processing**: Use queues for non-critical operations
- **Database optimization**: Proper indexing for webhook queries
- **Connection pooling**: Efficient database connection management
- **Caching**: Cache frequently accessed data

## Monitoring and Debugging

### 1. Webhook Logs

All webhook events are logged in the `ProcessedWebhookEvent` collection:

```typescript
// Query webhook processing history
const webhookHistory = await ProcessedWebhookEvent.find({
  eventType: 'checkout.session.completed',
  processedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
}).sort({ processedAt: -1 });
```

### 2. Error Monitoring

```typescript
// Monitor webhook errors
const webhookErrors = await ProcessedWebhookEvent.find({
  $or: [
    { error: { $exists: true } },
    { status: 'failed' }
  ]
}).sort({ processedAt: -1 });
```

### 3. Stripe Dashboard

- **Webhook logs**: View delivery attempts and failures
- **Event logs**: Monitor all Stripe events
- **Retry configuration**: Adjust retry logic as needed

## Testing

### 1. Stripe CLI Testing

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
```

### 2. Unit Testing

```typescript
// Example test for webhook handler
describe('Stripe Webhook Handler', () => {
  it('should process checkout.session.completed events', async () => {
    const mockEvent = createMockStripeEvent('checkout.session.completed');
    const response = await handler(mockEvent);
    
    expect(response.status).toBe(200);
    expect(response.body.processed).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

1. **Signature Verification Failed**
   - Check `STRIPE_WEBHOOK_SECRET` environment variable
   - Verify webhook endpoint URL in Stripe Dashboard
   - Ensure request body is not modified by middleware

2. **Duplicate Event Processing**
   - Check MongoDB connection and indexes
   - Verify `ProcessedWebhookEvent` collection exists
   - Check for race conditions in concurrent requests

3. **License Creation Failures**
   - Verify user exists in database
   - Check Stripe customer ID mapping
   - Ensure proper plan metadata in checkout session

4. **Email Delivery Issues**
   - Check SQS configuration and permissions
   - Verify email template existence
   - Monitor SQS queue metrics

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG_STRIPE_WEBHOOKS=true
```

This will log detailed information about webhook processing steps.

## Future Enhancements

### 1. Advanced Features

- **Webhook retry logic**: Implement exponential backoff for failed operations
- **Event replay**: Ability to replay webhook events for debugging
- **Real-time monitoring**: WebSocket-based real-time status updates
- **Advanced analytics**: Webhook processing metrics and insights

### 2. Integration Improvements

- **Multi-tenant support**: Handle multiple Stripe accounts
- **Webhook versioning**: Support for multiple Stripe API versions
- **Custom event handlers**: Plugin system for custom business logic
- **A/B testing**: Test different webhook processing strategies

### 3. Performance Optimization

- **Batch processing**: Process multiple events in single transaction
- **Parallel processing**: Concurrent event handling for high-volume scenarios
- **Caching layer**: Redis-based caching for frequently accessed data
- **Database sharding**: Horizontal scaling for high-volume applications

## Support and Maintenance

### 1. Regular Maintenance

- **Database cleanup**: Archive old webhook events
- **Index optimization**: Monitor and optimize database indexes
- **Performance monitoring**: Track webhook processing times
- **Security updates**: Keep dependencies updated

### 2. Monitoring Setup

- **Health checks**: Regular endpoint health monitoring
- **Alerting**: Set up alerts for webhook failures
- **Metrics collection**: Track success rates and response times
- **Log aggregation**: Centralized logging for debugging

### 3. Documentation Updates

- **API changes**: Document any webhook endpoint modifications
- **New features**: Update integration guides for new functionality
- **Best practices**: Share lessons learned and optimization tips
- **Troubleshooting**: Maintain common issue resolution guide

## Conclusion

This webhook implementation provides a robust, scalable foundation for Stripe integration. It handles all major payment and subscription events while maintaining data consistency and providing comprehensive user management capabilities.

For questions or support, refer to the Stripe documentation or contact the development team.
