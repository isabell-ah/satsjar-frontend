# Lightning Fallback System Analysis

## Current Fallback Behavior

### Scenario 1: OpenNode Primary (Current Setup)
- **Invoice Creation**: OpenNode creates invoice
- **Payment Destination**: OpenNode wallet
- **Fallback Trigger**: Only if OpenNode invoice creation fails
- **Fallback Destination**: LNBits wallet (if LNBits was used as fallback)

### Scenario 2: LNBits Primary (If Configured)
- **Invoice Creation**: LNBits creates invoice  
- **Payment Destination**: LNBits wallet
- **Fallback Trigger**: If LNBits invoice creation fails
- **Fallback Destination**: OpenNode wallet

## Critical Issues

### 🚨 Issue 1: Split Wallet Problem
- Payments go to different wallets depending on which provider created the invoice
- No automatic consolidation of funds
- Requires manual monitoring of multiple wallets

### 🚨 Issue 2: Fallback Only on Creation Failure
- Fallback only triggers if invoice CREATION fails
- If invoice is created but provider goes down later, no fallback for status checking
- Payment could be "lost" if primary provider becomes unavailable

### 🚨 Issue 3: No Payment Reconciliation
- No automatic tracking of which provider received which payment
- Manual reconciliation required across multiple wallets
- Potential accounting issues

## Money Flow Examples

### Example 1: Normal Operation (OpenNode)
```
User Request → OpenNode Invoice → User Pays → Money in OpenNode Wallet ✅
```

### Example 2: Fallback Scenario
```
User Request → OpenNode Fails → LNBits Invoice → User Pays → Money in LNBits Wallet ⚠️
```

### Example 3: Mixed Operations
```
Payment 1: OpenNode working → Money in OpenNode ✅
Payment 2: OpenNode fails → Money in LNBits ⚠️
Payment 3: OpenNode working again → Money in OpenNode ✅
Result: Money split across two wallets! 🚨
```

## Recommended Solutions

### Solution 1: Single Wallet Strategy (Recommended)
- Use OpenNode as primary and only provider
- Remove LNBits fallback to avoid split wallets
- Implement retry logic for temporary OpenNode issues
- Monitor OpenNode status and alert if down

### Solution 2: Wallet Consolidation Strategy
- Keep fallback system
- Implement automatic fund consolidation
- Regular sweeps from LNBits to OpenNode (or vice versa)
- Automated reconciliation system

### Solution 3: Provider Status Monitoring
- Real-time monitoring of provider health
- Intelligent routing based on provider status
- Graceful degradation with user notification
- Automatic failover with fund tracking

## Current Recommendation

For production use, **Solution 1** is recommended:
- OpenNode has proven reliable
- Eliminates wallet split issues
- Simplifies accounting and reconciliation
- Reduces operational complexity
