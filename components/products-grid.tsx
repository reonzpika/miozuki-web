'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/lib/shopify';
import type { RatingSummary } from '@/lib/judgeme/types';
import {
  CATALOGUE_QUICK_FILTERS,
  pickDefaultCatalogueQuickFilter,
  productHasBestSellerTag,
  productMatchesCatalogueQuickFilter,
  type CatalogueQuickFilterId,
} from '@/lib/catalogue-quick-filters';
import CollectionFiltersSheet from '@/components/collection-filters-sheet';
import ProductCard from './product-card';

type SortKey = 'featured' | 'best-sellers' | 'price-asc' | 'price-desc' | 'title-asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-sellers', label: 'Best sellers' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title-asc', label: 'A – Z' },
];

function sortLabel(key: SortKey): string {
  return SORT_OPTIONS.find((o) => o.value === key)?.label ?? 'Featured';
}

export default function ProductsGrid({
  products,
  layout = 'default',
  catalogueQuickFilters,
  ratings = {},
  showFromPriceWhenRange = false,
}: {
  products: Product[];
  layout?: 'default' | 'flagship';
  /**
   * Rings / earrings / … chips on the full catalogue only. Collection PLPs pass `false` so every
   * product in the collection stays visible.
   */
  catalogueQuickFilters?: boolean;
  ratings?: Record<string, RatingSummary>;
  showFromPriceWhenRange?: boolean;
}) {
  const quickFiltersOn = layout === 'flagship' && (catalogueQuickFilters ?? true);
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [filterType, setFilterType] = useState('all');
  const [mobileSheet, setMobileSheet] = useState<'sort' | 'filter' | null>(null);
  const [catalogueQuickFilter, setCatalogueQuickFilter] = useState<CatalogueQuickFilterId>(() =>
    layout === 'flagship' ? pickDefaultCatalogueQuickFilter() : 'rings',
  );

  const catalogueQuickTabs = quickFiltersOn ? CATALOGUE_QUICK_FILTERS : [];

  const types = useMemo(() => {
    let pool = [...products];
    if (quickFiltersOn) {
      pool = pool.filter((p) =>
        productMatchesCatalogueQuickFilter(p, catalogueQuickFilter),
      );
    }
    const set = new Set(
      pool
        .map((p) => p.productType)
        .filter((t): t is string => typeof t === 'string' && t.length > 0),
    );
    return Array.from(set).sort();
  }, [products, quickFiltersOn, catalogueQuickFilter]);

  const displayed = useMemo(() => {
    let list = [...products];

    if (quickFiltersOn) {
      list = list.filter((p) =>
        productMatchesCatalogueQuickFilter(p, catalogueQuickFilter),
      );
    }

    if (filterType !== 'all') {
      list = list.filter((p) => p.productType === filterType);
    }

    const sorted = [...list];

    switch (sortBy) {
      case 'best-sellers':
        sorted.sort((a, b) => {
          const tagA = productHasBestSellerTag(a) ? 1 : 0;
          const tagB = productHasBestSellerTag(b) ? 1 : 0;
          if (tagB !== tagA) return tagB - tagA;
          return a.title.localeCompare(b.title);
        });
        break;
      case 'price-asc':
        sorted.sort(
          (a, b) =>
            parseFloat(a.priceRange.minVariantPrice.amount) -
            parseFloat(b.priceRange.minVariantPrice.amount),
        );
        break;
      case 'price-desc':
        sorted.sort(
          (a, b) =>
            parseFloat(b.priceRange.minVariantPrice.amount) -
            parseFloat(a.priceRange.minVariantPrice.amount),
        );
        break;
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return sorted;
  }, [products, sortBy, filterType, quickFiltersOn, catalogueQuickFilter]);

  const cataloguePillInactive =
    'inline-flex shrink-0 snap-start items-center justify-center rounded-full border border-charcoal/15 bg-cream px-4 py-2 font-sans text-sm font-normal text-charcoal shadow-[0_1px_0_oklch(0.14_0_0_/0.04)] transition-[background-color,border-color,box-shadow] duration-normal hover:border-charcoal/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

  const cataloguePillActive =
    'inline-flex shrink-0 snap-start items-center justify-center rounded-full border border-charcoal/25 bg-surface px-4 py-2 font-sans text-sm font-normal text-charcoal shadow-none transition-[background-color,border-color] duration-normal hover:border-charcoal/30 hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

  const selectClasses =
    'appearance-none cursor-pointer border border-charcoal/20 bg-transparent px-4 py-2 pr-8 text-xs uppercase tracking-widest text-charcoal/70 transition-colors hover:border-charcoal/40 focus:border-burgundy focus:outline-none min-h-11';

  const gridClassName =
    layout === 'flagship'
      ? 'grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-2 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4';

  // Mirrors gridClassName's column counts so phones download ~45vw images for
  // 2-column grid cells instead of the card default's carousel-width 70vw.
  const cardImageSizes =
    layout === 'flagship'
      ? '(max-width: 767px) 45vw, (max-width: 1023px) 47vw, (max-width: 1279px) 31vw, 300px'
      : '(max-width: 767px) 45vw, (max-width: 1023px) 31vw, 25vw';

  return (
    <div>
      {quickFiltersOn ? (
        <nav aria-label="Browse catalogue" className="mb-6">
          <ul
            role="tablist"
            className="-mx-1 flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 [-ms-overflow-style:auto] [scrollbar-width:thin] md:flex-wrap md:overflow-visible"
          >
            {catalogueQuickTabs.map(({ id, label }) => (
              <li key={id} className="shrink-0 snap-start">
                <button
                  type="button"
                  role="tab"
                  aria-selected={catalogueQuickFilter === id}
                  onClick={() => {
                    setCatalogueQuickFilter(id);
                    setFilterType('all');
                  }}
                  className={
                    catalogueQuickFilter === id ? cataloguePillActive : cataloguePillInactive
                  }
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {/* Controls */}
      {layout === 'flagship' ? (
        <div
          className={quickFiltersOn ? 'mb-6 border-t border-charcoal/8 pt-6' : 'mb-6 pt-1 md:pt-2'}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-8">
            <div className="flex w-full flex-col gap-3 md:hidden">
              {types.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMobileSheet('filter')}
                  className="flex min-h-12 w-full items-center justify-center border border-charcoal/20 bg-transparent px-4 text-xs uppercase tracking-widest text-charcoal transition-colors hover:border-charcoal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  {filterType === 'all' ? 'Filter by type' : `Type: ${filterType}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileSheet('sort')}
                className="flex min-h-12 w-full items-center justify-center border border-charcoal/20 bg-transparent px-4 text-xs uppercase tracking-widest text-charcoal transition-colors hover:border-charcoal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Sort: {sortLabel(sortBy)}
              </button>
            </div>

            <div className="hidden shrink-0 items-center gap-4 md:flex">
              {types.length > 1 && (
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={selectClasses}
                  >
                    <option value="all">All Types</option>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal/65">
                    {'\u25BE'}
                  </span>
                </div>
              )}

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className={selectClasses}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal/65">
                  {'\u25BE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3 flex flex-col gap-3 border-b border-charcoal/8 pb-2 md:mb-4 md:flex-row md:flex-wrap md:items-center md:gap-4 md:pb-3">
          {/* Mobile: open sheets (default layout) */}
          <div className="flex w-full flex-col gap-3 md:hidden">
            {types.length > 1 && (
              <button
                type="button"
                onClick={() => setMobileSheet('filter')}
                className="flex min-h-12 w-full items-center justify-center border border-charcoal/20 bg-transparent px-4 text-xs uppercase tracking-widest text-charcoal transition-colors hover:border-charcoal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                {filterType === 'all' ? 'Filter by type' : `Type: ${filterType}`}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileSheet('sort')}
              className="flex min-h-12 w-full items-center justify-center border border-charcoal/20 bg-transparent px-4 text-xs uppercase tracking-widest text-charcoal transition-colors hover:border-charcoal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Sort: {sortLabel(sortBy)}
            </button>
          </div>

          {/* Desktop: native selects */}
          <div className="ml-auto hidden items-center gap-4 md:flex">
            {types.length > 1 && (
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={selectClasses}
                >
                  <option value="all">All Types</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal/65">
                  {'\u25BE'}
                </span>
              </div>
            )}

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className={selectClasses}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal/65">
                {'\u25BE'}
              </span>
            </div>
          </div>
        </div>
      )}

      <CollectionFiltersSheet
        open={mobileSheet !== null}
        title={mobileSheet === 'sort' ? 'Sort' : 'Filter by type'}
        onClose={() => setMobileSheet(null)}
      >
        {mobileSheet === 'sort' && (
          <div className="flex flex-col gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSortBy(opt.value);
                  setMobileSheet(null);
                }}
                className={`min-h-12 w-full border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  sortBy === opt.value
                    ? 'border-burgundy bg-surface text-charcoal'
                    : 'border-charcoal/15 text-charcoal/80 hover:border-charcoal/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        {mobileSheet === 'filter' && types.length > 1 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterType('all');
                  setMobileSheet(null);
                }}
                className={`min-h-12 w-full border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  filterType === 'all'
                    ? 'border-burgundy bg-surface text-charcoal'
                    : 'border-charcoal/15 text-charcoal/80 hover:border-charcoal/30'
                }`}
              >
                All types
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setFilterType(t);
                    setMobileSheet(null);
                  }}
                  className={`min-h-12 w-full border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                    filterType === t
                      ? 'border-burgundy bg-surface text-charcoal'
                      : 'border-charcoal/15 text-charcoal/80 hover:border-charcoal/30'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterType('all');
                setMobileSheet(null);
              }}
              className="min-h-12 w-full border border-charcoal/15 text-xs uppercase tracking-widest text-charcoal/65 transition-colors hover:border-charcoal/30 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Clear filter
            </button>
          </div>
        )}
      </CollectionFiltersSheet>

      {/* Grid */}
      {displayed.length === 0 ? (
        <p className="py-24 text-center text-sm text-charcoal/65">
          No products found.
        </p>
      ) : (
        <div className={gridClassName}>
          {displayed.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              layout={layout}
              priority={index < 4}
              imageSizes={cardImageSizes}
              rating={ratings[product.id.split('/').pop() ?? '']}
              showFromPriceWhenRange={showFromPriceWhenRange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
