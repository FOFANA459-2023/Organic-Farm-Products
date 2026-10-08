"use client";

import Link from "next/link";
import { AVAILABILITY_LABELS, type Product } from "@ofp/shared";
import { AdminTitle, Loading } from "@/components/admin/admin-ui";
import { priceSummary } from "@/components/product-bits";
import { Notice } from "@/components/ui";
import { useAdminData } from "@/lib/admin-api";

export default function AdminProductsPage() {
  const { data, error, loading } = useAdminData<Product[]>("/products");

  return (
    <>
      <AdminTitle title="Products">
        <Link href="/admin/products/new" className="btn-primary !py-2">+ New product</Link>
      </AdminTitle>
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Loading />
      ) : (
        <div className="card overflow-x-auto bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Visible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.map((p) => (
                <tr key={p.id} className="hover:bg-mist">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-semibold text-leaf">{p.name}</Link>
                    <span className="block text-xs text-muted">{p.variants.length} size{p.variants.length === 1 ? "" : "s"}</span>
                  </td>
                  <td className="px-4 py-3">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    {AVAILABILITY_LABELS[p.availability]}
                    {!p.orderable && <span className="block text-xs text-muted">Not orderable</span>}
                  </td>
                  <td className="px-4 py-3">{priceSummary(p)}</td>
                  <td className="px-4 py-3">{p.published ? "Published" : <span className="text-muted">Hidden</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
