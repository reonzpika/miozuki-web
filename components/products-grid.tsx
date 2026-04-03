'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/lib/shopify';
import ProductCard from './product-card';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'title-asc';

export default function ProductsGrid({ products }: { products: Product[] }) {
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [filterType, setFilterType] = useState('all');

  const types = useMemo(() => {
    const set = new Set(products.map((p) => p.productType).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const displayed = useMemo(() => {
    let list = [...products];

    if (filterType !== 'all') {
      list = list.filter((p) => p.productType === filterType);
    }

    switch (sortBy) {
      case 'price-asc':
        return list.sort(
          (a, b) =>
            parseFloat(a.priceRange.minVariantPrice.amount) -
            parseFloat(b.priceRange.minVariantPrice.amount)
        );
      case 'price-desc':
        return list.sort(
          (a, b) =>
            parseFloat(b.priceRange.minVariantPrice.amount) -
            parseFloat(a.priceRange.minVariantPrice.amount)
        );
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  }, [products, sortBy, filterType]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-charcoal/8">
        <span className="text-xs text-charcoal/40 tracking-widest uppercase mr-2">
          {displayed.length} {displayed.length === 1 ? 'piece' : 'pieces'}
        </span>

        <div className="ml-auto flex items-center gap-4">
          {/* Type filter */}
          {types.length > 1 && (
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none text-xs tracking-widest uppercase text-charcoal/70 bg-transparent border border-charcoal/20 px-4 py-2 pr-8 cursor-pointer hover:border-charcoal/40 transition-colors focus:outline-none focus:border-burgundy"
              >
                <option value="all">All Types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 text-xs">
                ▾
              </span>
            </div>
          )}

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="appearance-none text-xs tracking-widest uppercase text-charcoal/70 bg-transparent border border-charcoal/20 px-4 py-2 pr-8 cursor-pointer hover:border-charcoal/40 transition-colors focus:outline-none focus:border-burgundy"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">A – Z</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 text-xs">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <p className="text-center text-charcoal/40 py-24 text-sm">
          No products found.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayed.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
