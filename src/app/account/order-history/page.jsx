"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { n } from "@/utils/number";
import { getImageUrl } from "@/utils/getImageUrl";

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "notPaid", label: "Not Paid" },
  { key: "ongoing", label: "Ongoing" },
  { key: "success", label: "Success" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_UI = {
  finished: {
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    message: "Your order is completed!",
    icon: "✓",
  },
  pending: {
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    message: "Waiting for payment",
    icon: "",
  },
  waiting_admin: {
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    message: "Payment received - waiting admin confirmation",
    icon: "",
  },
  processing: {
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    message: "Your order is being processed",
    icon: "⚙",
  },
  on_delivery: {
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    message: "Your order is on the way",
    icon: "",
  },
  cancelled: {
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    message: "Order has been cancelled",
    icon: "✕",
  },
  unknown: {
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
    message: "Order status unknown",
    icon: "•",
  },
};

const mapTransactionStatus = (trxStatus) => {
  const s = Number(trxStatus);
  if (s === 1) return "pending";
  if (s === 5) return "waiting_admin";
  if (s === 2) return "processing";
  if (s === 3) return "on_delivery";
  if (s === 4) return "finished";
  if (s === 9) return "cancelled";
  return "unknown";
};

function safeDateString(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB");
}

const normalizeOrders = (rows) => {
  const arr = Array.isArray(rows) ? rows : [];

  return arr.map((row) => {
    const trx = row?.transaction || {};
    const details = Array.isArray(trx?.details) ? trx.details : [];

    const items = details.map((d) => {
      const p = d?.product || {};
      const medias = Array.isArray(p?.medias) ? p.medias : [];

      const thumbUrl = getImageUrl(
        medias?.[0]?.url || p?.thumbnail || p?.image
      );

      const variantName =
        d?.variant?.sku ||
        d?.variant?.name ||
        d?.attributes ||
        "-";

      return {
        id:
          d?.id ??
          `${trx?.transactionNumber || trx?.id || "trx"}-${
            d?.productId || "item"
          }`,
        product: {
          name: p?.name || p?.title || "-",
          thumbnail: thumbUrl,
          variant_name: variantName,
          price: n(d?.price, 0),
        },
        quantity: n(d?.qty, 0),
      };
    });

    const total =
      n(trx?.grandTotal, 0) ||
      n(trx?.amount, 0) ||
      items.reduce(
        (sum, it) =>
          sum + n(it?.product?.price, 0) * n(it?.quantity, 0),
        0
      );

    return {
      id: row?.id ?? trx?.id ?? trx?.transactionNumber,
      transaction_number: trx?.transactionNumber || "-",
      status: mapTransactionStatus(trx?.transactionStatus),
      created_at:
        trx?.createdAt ||
        trx?.created_at ||
        row?.createdAt ||
        row?.created_at,
      total_price: total,
      items,
    };
  });
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await axios.get("/transaction", {
        params: { page: 1, per_page: 50, field: "created_at", value: "desc" },
      });

      const rows = res?.data?.serve?.data ?? [];
      setOrders(normalizeOrders(rows));
    } catch (err) {
      setOrders([]);
      setErrorMsg(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filterOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];

    return list.filter((o) => {
      const st = o?.status || "unknown";
      if (filter === "all") return true;
      if (filter === "ongoing")
        return ["pending", "waiting_admin", "processing", "on_delivery"].includes(
          st
        );
      if (filter === "success") return st === "finished";
      if (filter === "cancelled") return st === "cancelled";
      return true;
    });
  }, [orders, filter]);

  const getStatusInfo = (status) => STATUS_UI[status] || STATUS_UI.unknown;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 space-y-4 pb-28">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Order history</h2>

      <div className="mb-6 flex items-center gap-3">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              filter === tab.key
                ? "bg-primary-700 text-white"
                : "bg-white text-gray-600 border"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-4 py-2 text-sm border rounded-full"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {errorMsg && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading orders...
        </div>
      ) : filterOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {filterOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const items = order.items || [];
            const totalQty = items.reduce(
              (sum, item) => sum + n(item?.quantity, 0),
              0
            );

            return (
              <div
                key={order.id}
                className="bg-white border rounded-lg p-5"
              >
                <div
                  className={`${statusInfo.bgColor} ${statusInfo.textColor} px-4 py-2.5 rounded-md flex justify-between mb-4`}
                >
                  <span className="text-sm font-medium">
                    {statusInfo.message}
                  </span>
                  <span className="text-xs">
                    Order created: {safeDateString(order.created_at)}
                  </span>
                </div>

                <div className="space-y-4 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="rounded-md border object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Variant: {item.product.variant_name || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} item • Rp{" "}
                          {n(item.product.price, 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    {order.transaction_number}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-bold">
                        {totalQty} item: Rp{" "}
                        {n(order.total_price, 0).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <Link
                      href={`/account/order-history/${encodeURIComponent(
                        order.transaction_number
                      )}`}
                      className="px-5 py-2 text-xs text-white bg-pink-600 rounded-full"
                    >
                      See detail
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
