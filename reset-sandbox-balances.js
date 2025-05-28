// Reset sandbox balances to match Lightning wallet capacity
const admin = require('firebase-admin');
const config = require('./backend/config/config');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
    databaseURL: config.firebase.databaseURL,
  });
}

const firestore = admin.firestore();

async function resetSandboxBalances() {
  try {
    console.log('🧪 Resetting sandbox balances...\n');
    
    // Get current Lightning wallet balance (you said 68 sats)
    const availableSats = 68; // Your current OpenNode balance
    console.log(`💰 Available Lightning balance: ${availableSats} sats`);
    
    // Get all users and children with balances
    const usersSnapshot = await firestore.collection('users').get();
    const childrenSnapshot = await firestore.collection('children').get();
    
    let totalAppBalance = 0;
    let userBalances = [];
    let childBalances = [];
    
    // Calculate total app balances
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const balance = data.wallet?.balance || 0;
      if (balance > 0) {
        userBalances.push({ id: doc.id, balance, phone: data.phoneNumber });
        totalAppBalance += balance;
      }
    });
    
    childrenSnapshot.forEach(doc => {
      const data = doc.data();
      const balance = data.balance || 0;
      if (balance > 0) {
        childBalances.push({ id: doc.id, balance, name: data.firstName });
        totalAppBalance += balance;
      }
    });
    
    console.log(`📊 Current app balances:`);
    console.log(`   Total: ${totalAppBalance} sats`);
    console.log(`   Users: ${userBalances.length} accounts`);
    console.log(`   Children: ${childBalances.length} accounts`);
    
    if (totalAppBalance <= availableSats) {
      console.log('✅ App balances are within Lightning wallet capacity!');
      console.log('💡 No reset needed - you can cover all withdrawals.');
      return;
    }
    
    console.log(`\n⚠️ App balances (${totalAppBalance}) exceed Lightning capacity (${availableSats})`);
    console.log('🔄 Resetting balances proportionally...\n');
    
    // Calculate scaling factor
    const scaleFactor = availableSats / totalAppBalance;
    console.log(`📐 Scale factor: ${scaleFactor.toFixed(4)}`);
    
    // Reset user balances
    for (const user of userBalances) {
      const newBalance = Math.floor(user.balance * scaleFactor);
      await firestore.collection('users').doc(user.id).update({
        'wallet.balance': newBalance
      });
      console.log(`👨‍👩‍👧‍👦 ${user.phone}: ${user.balance} → ${newBalance} sats`);
    }
    
    // Reset child balances
    for (const child of childBalances) {
      const newBalance = Math.floor(child.balance * scaleFactor);
      await firestore.collection('children').doc(child.id).update({
        balance: newBalance
      });
      console.log(`👶 ${child.name}: ${child.balance} → ${newBalance} sats`);
    }
    
    // Record the reset
    await firestore.collection('admin_actions').add({
      type: 'sandbox_balance_reset',
      reason: 'Align app balances with Lightning wallet capacity',
      originalTotal: totalAppBalance,
      newTotal: availableSats,
      scaleFactor,
      timestamp: new Date(),
      affectedUsers: userBalances.length,
      affectedChildren: childBalances.length
    });
    
    console.log('\n✅ Sandbox balances reset successfully!');
    console.log('💡 All balances now align with your Lightning wallet capacity.');
    
  } catch (error) {
    console.error('❌ Error resetting balances:', error);
  }
}

// Run the reset
resetSandboxBalances();
