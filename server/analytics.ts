import type { Request } from 'express';
import { db } from './db';
import { serviceAnalytics, serviceAnalyticsDaily, serviceViewUniques } from '../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

type ServiceAnalyticsRecord = {
  serviceId: number;
  views: number;
  uniqueViewers: Set<string>;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// In-memory analytics store (sufficient for dev/testing; can be backed by DB later)
const serviceIdToAnalytics: Map<number, ServiceAnalyticsRecord> = new Map();

export function ensureServiceAnalytics(serviceId: number): void {
  if (!serviceIdToAnalytics.has(serviceId)) {
    const now = new Date();
    serviceIdToAnalytics.set(serviceId, {
      serviceId,
      views: 0,
      uniqueViewers: new Set<string>(),
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function recordServiceView(serviceId: number, req?: Request): Promise<void> {
  const viewerKey = String((req as any)?.user?.id || (req?.ip ?? 'anonymous'));
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];

  // In-memory increment for dev
  ensureServiceAnalytics(serviceId);
  const rec = serviceIdToAnalytics.get(serviceId)!;
  rec.views += 1;
  const wasUnique = !rec.uniqueViewers.has(viewerKey);
  rec.uniqueViewers.add(viewerKey);
  rec.lastViewedAt = now;
  rec.updatedAt = now;

  // If DB available, persist
  if (db) {
    try {
      // Upsert overall counters
      const existing = await db.select().from(serviceAnalytics)
        .where(eq(serviceAnalytics.serviceId, serviceId));
      if (existing.length === 0) {
        await db.insert(serviceAnalytics).values({
          serviceId,
          views: 1,
          uniqueViews: 1,
          lastViewedAt: now,
        });
      } else {
        await db.update(serviceAnalytics)
          .set({
            views: (existing[0].views || 0) + 1,
            uniqueViews: (existing[0].uniqueViews || 0) + (wasUnique ? 1 : 0),
            lastViewedAt: now,
            updatedAt: now,
          })
          .where(eq(serviceAnalytics.serviceId, serviceId));
      }

      // Daily rollup and unique tracking
      const uniqueExists = await db.select().from(serviceViewUniques)
        .where(and(eq(serviceViewUniques.serviceId, serviceId), eq(serviceViewUniques.dateKey, dateKey), eq(serviceViewUniques.viewerKey, viewerKey)));
      if (uniqueExists.length === 0) {
        await db.insert(serviceViewUniques).values({ serviceId, dateKey, viewerKey });
      }

      const dayRow = await db.select().from(serviceAnalyticsDaily)
        .where(and(eq(serviceAnalyticsDaily.serviceId, serviceId), eq(serviceAnalyticsDaily.dateKey, dateKey)));
      if (dayRow.length === 0) {
        await db.insert(serviceAnalyticsDaily).values({
          serviceId,
          dateKey,
          views: 1,
          uniqueViews: uniqueExists.length === 0 ? 1 : 0,
        });
      } else {
        await db.update(serviceAnalyticsDaily)
          .set({
            views: (dayRow[0].views || 0) + 1,
            uniqueViews: (dayRow[0].uniqueViews || 0) + (uniqueExists.length === 0 ? 1 : 0),
            updatedAt: now,
          })
          .where(and(eq(serviceAnalyticsDaily.serviceId, serviceId), eq(serviceAnalyticsDaily.dateKey, dateKey)));
      }
    } catch {
      // swallow DB errors in dev
    }
  }
}

export function getServiceAnalytics(serviceId: number): {
  serviceId: number;
  views: number;
  uniqueViews: number;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} | null {
  const rec = serviceIdToAnalytics.get(serviceId);
  if (!rec) return null;
  return {
    serviceId: rec.serviceId,
    views: rec.views,
    uniqueViews: rec.uniqueViewers.size,
    lastViewedAt: rec.lastViewedAt,
    createdAt: rec.createdAt,
    updatedAt: rec.updatedAt,
  };
}

export function getAllAnalytics(): Array<ReturnType<typeof getServiceAnalytics>> {
  return Array.from(serviceIdToAnalytics.values()).map((r) => ({
    serviceId: r.serviceId,
    views: r.views,
    uniqueViews: r.uniqueViewers.size,
    lastViewedAt: r.lastViewedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

// Query daily analytics by date range (uses DB if available; otherwise returns in-memory approximation)
export async function getServiceAnalyticsByDateRange(serviceId: number, startDate: Date, endDate: Date): Promise<Array<{ date: string; views: number; uniqueViews: number }>> {
  const startKey = startDate.toISOString().split('T')[0];
  const endKey = endDate.toISOString().split('T')[0];

  if (!db) {
    // Fallback: synthesize a single bucket from in-memory totals
    const rec = serviceIdToAnalytics.get(serviceId);
    if (!rec) return [];
    return [{ date: startKey, views: rec.views, uniqueViews: rec.uniqueViewers.size }];
  }

  const rows = await db.select().from(serviceAnalyticsDaily)
    .where(and(
      eq(serviceAnalyticsDaily.serviceId, serviceId),
      gte(serviceAnalyticsDaily.dateKey, startKey),
      lte(serviceAnalyticsDaily.dateKey, endKey),
    ));

  return rows.map(r => ({ date: r.dateKey, views: r.views || 0, uniqueViews: r.uniqueViews || 0 }));
}

