import { dbConnect } from '@/lib/db'
import Product from '@/models/Product'
import Category from '@/models/Category'
import ProductCard from '@/components/ProductCard'
import Pagination from '@/components/Pagination'
import FilterBar from '@/components/FilterBar'

export const revalidate = 0

export default async function Shop({ searchParams }){
  await dbConnect();
  const sp = await searchParams; // ✅ Next 15: searchParams is a Promise
  const cats = await Category.find({}).sort({ name: 1 }).lean()
  const pageSize = Number(sp.pageSize || 8);
  const page = Math.max(1, Number(sp.page || 1));
  const q = (sp.q || '').toLowerCase();
  const category = sp.category || undefined;
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const inStock = sp.inStock === '1';
  const onSale = sp.onSale === '1';
  const sortKey = sp.sort || 'newest';

  // Base filter
  const where = {};
  if (category) where.category = category;
  if (q) where.name = { $regex: q, $options: 'i' };

  // Price filter on effective price (salePrice if set else price)
  if (minPrice !== undefined || maxPrice !== undefined){
    where.$expr = { $and: [] };
    if (minPrice !== undefined) where.$expr.$and.push({ $gte: [ { $ifNull: ['$salePrice', '$price'] }, minPrice ] });
    if (maxPrice !== undefined) where.$expr.$and.push({ $lte: [ { $ifNull: ['$salePrice', '$price'] }, maxPrice ] });
  }

  // In stock and on sale toggles
  if (inStock){
    where.$and = (where.$and || []);
    where.$and.push({ $or: [ { soldOut: { $ne: true } }, { quantity: { $gt: 0 } } ] });
  }
  if (onSale){
    where.$and = (where.$and || []);
    where.$and.push({ salePrice: { $gt: 0 } });
  }

  // Sorting
  let sortObj = { createdAt: -1 };
  if (sortKey === 'price-asc') sortObj = { salePrice: 1, price: 1 };
  else if (sortKey === 'price-desc') sortObj = { salePrice: -1, price: -1 };
  else if (sortKey === 'stock-desc') sortObj = { soldOut: 1, quantity: -1, createdAt: -1 };

  const total = await Product.countDocuments(where);
  const items = await Product.find(where).sort(sortObj).skip((page-1)*pageSize).limit(pageSize).lean();
  const pages = Math.max(1, Math.ceil(total / pageSize));

  // Build heading
  let heading = 'Shop';
  if (category) {
    const cat = (cats || []).find(c => c.slug === category);
    if (cat && cat.name) heading = cat.name;
  } else if (q) {
    heading = `Results for "${sp.q || ''}"`;
  }

  return (
    <div className="py-8">
      
      <h1 className="text-2xl font-semibold">{heading}</h1>
      <div className="mt-3"><FilterBar categories={cats?.map(c=>({name:c.name, slug:c.slug}))||[]} /></div>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map(p => <ProductCard key={p._id} p={p} />)}
      </div>
      <Pagination page={page} pages={pages} />
    </div>
  )
}
