import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Order from '@/models/Order'
export async function GET(req){
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || '30d'
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const tz = 'Asia/Dhaka'
  const now = toParam ? new Date(toParam) : new Date()
  let from = fromParam ? new Date(fromParam) : new Date(now)
  // parse range like '7d','30d','90d'
  const match = /^([0-9]+)d$/.test(range) ? Number(range.replace('d','')) : 30
  from.setDate(now.getDate() - (match - 1))
  from.setHours(0,0,0,0)
  const to = new Date(now); to.setHours(23,59,59,999)
  // Status filter: count everything except explicit cancellations if present
  const baseMatch = { createdAt: { $gte: from, $lte: to } }
  // Sum item totals per order; group per day (local time) and also compute totals
  const daily = await Order.aggregate([
    { $match: baseMatch },
    { $unwind: '$items' },
    { $addFields: { itemTotal: { $multiply: ['$items.price', '$items.qty'] } } },
    { $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: tz }
        },
        revenue: { $sum: '$itemTotal' },
        ordersSet: { $addToSet: '$_id' }
      }
    },
    { $project: { _id: 0, date: '$_id', revenue: 1, orders: { $size: '$ordersSet' } } },
    { $sort: { date: 1 } }
  ])
  // Fill missing days
  const dayMs = 24*60*60*1000
  const fill = []
  for(let d = new Date(from); d <= to; d = new Date(d.getTime()+dayMs)){
    const ds = d.toISOString().slice(0,10)
    const found = daily.find(r => r.date === ds)
    fill.push({ date: ds, revenue: found ? found.revenue : 0, orders: found ? found.orders : 0 })
  }
  const totalRevenue = fill.reduce((a,b)=>a+b.revenue,0)
  const totalOrders = fill.reduce((a,b)=>a+b.orders,0)
  return NextResponse.json({ range: { from, to }, daily: fill, totals: { revenue: totalRevenue, orders: totalOrders } })
}
