# Child Transaction Differentiation System

## Database Collections Structure

### 1. Users Collection (Parents)
```
users/{parentId}
├── phoneNumber: "+254712345678"
├── role: "parent"
├── name: "John Doe"
└── children: ["child1", "child2", "child3"]  // Array of child IDs
```

### 2. Children Collection (Child Accounts)
```
children/{childId}
├── name: "Alice"
├── age: 10
├── parentId: "parent123"           // Links to parent
├── jarId: "ABC123"                 // Unique jar identifier
├── hashedPin: "hashed_pin_here"
├── balance: 1500                   // Child's current balance
├── wallet: { invoiceKey: "..." }
└── createdAt: timestamp
```

### 3. Invoices Collection (Payment Requests)
```
invoices/{invoiceId}
├── userId: "child1"                // Which child this is for
├── parentId: "parent123"           // Which parent created it
├── amount: 1000
├── memo: "Deposit to Alice's jar"
├── paymentHash: "abc123..."        // For frontend identification
├── lightningId: "charge_xyz"       // For Lightning provider
├── status: "pending" | "paid"
└── createdAt: timestamp
```

### 4. Transactions Collection (Payment History)
```
transactions/{transactionId}
├── userId: "child1"                // Which child received the money
├── parentId: "parent123"           // Which parent sent it
├── type: "deposit"
├── source: "lightning"
├── amount: 1000
├── description: "Allowance deposit"
├── paymentHash: "abc123..."
├── timestamp: timestamp
└── processedVia: "api_check"
```

## Transaction Flow Examples

### Scenario 1: Parent pays Child A (Alice)
1. **Invoice Creation**: `userId: "child_alice_id"`
2. **Payment Processing**: Updates `children/child_alice_id/balance`
3. **Transaction Record**: `userId: "child_alice_id"`
4. **Result**: Only Alice's balance increases

### Scenario 2: Parent pays Child B (Bob)
1. **Invoice Creation**: `userId: "child_bob_id"`
2. **Payment Processing**: Updates `children/child_bob_id/balance`
3. **Transaction Record**: `userId: "child_bob_id"`
4. **Result**: Only Bob's balance increases

## Query Examples

### Get Alice's Transactions Only
```javascript
firestore.collection('transactions')
  .where('userId', '==', 'child_alice_id')
  .orderBy('timestamp', 'desc')
```

### Get All Parent's Children Transactions
```javascript
// First get all children IDs
const children = await firestore.collection('children')
  .where('parentId', '==', 'parent123')
  .get();

// Then get transactions for each child
for (const childId of childrenIds) {
  const transactions = await firestore.collection('transactions')
    .where('userId', '==', childId)
    .get();
}
```

### Get Specific Child's Balance
```javascript
const childDoc = await firestore.collection('children')
  .doc('child_alice_id')
  .get();
const balance = childDoc.data().balance;
```

## Security & Permissions

### Parent Access Control
- Parents can only see their own children: `parentId == authenticated_user_id`
- Parents can create invoices for their children
- Parents can view all their children's transactions

### Child Access Control
- Children can only see their own data: `userId == authenticated_user_id`
- Children can create invoices for themselves
- Children cannot see other children's data

### API Endpoint Examples
```
GET /api/wallet/child/alice_id/transactions  // Alice's transactions only
GET /api/wallet/child/bob_id/balance         // Bob's balance only
POST /api/wallet/child/alice_id/invoice      // Create invoice for Alice
```

## Data Isolation Guarantees

1. **Balance Separation**: Each child has their own balance field
2. **Transaction Separation**: Each transaction is tagged with specific userId
3. **Invoice Separation**: Each invoice specifies exact child recipient
4. **Permission Separation**: API enforces parent-child relationships
5. **Database Separation**: Different document IDs prevent data mixing
