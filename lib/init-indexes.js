// ensures partial TTL on unpaid holds
import mongoose from 'mongoose';
export async function ensureIndexes(){
  const conn = mongoose.connection;
  if (!conn?.db) return;
  try{
    await conn.db.collection('orders').createIndex(
      { paymentHoldUntil: 1 },
      {
        expireAfterSeconds: 0,
        partialFilterExpression: {
          paymentStatus: { $in: ['pending','unpaid','PENDING','UNPAID'] }
        },
        name: 'ttl_paymentHoldUntil_unpaid_only'
      }
    );
  }catch(e){
    // index may already exist with different options; ignore for now
  }
}
