"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import axios from "@/lib/axios.js";
import { n } from "@/utils/number";
import { getImageUrl } from "@/utils/getImageUrl";

/* ===== constants & helpers (unchanged) ===== */
const STEPS = [
  { key: "created", label: "Order created" },
  { key: "packaged", label: "Packaged" },
  { key: "on_delivery", label: "On delivery" },
  { key: "completed", label: "Order complete" },
];

const STATUS_BADGE = {
  pending: { text: "Waiting Payment", cls: "bg-yellow-50 text-yellow-700" },
  waiting_admin: { text: "Waiting Admin", cls: "bg-blue-50 text-blue-600" },
  processing: { text: "On Process", cls: "bg-indigo-50 text-indigo-600" },
  on_delivery: { text: "On Delivery", cls: "bg-purple-50 text-purple-600" },
  finished: { text: "Completed", cls: "bg-green-50 text-green-600" },
  cancelled: { text: "Cancelled", cls: "bg-red-50 text-red-600" },
  unknown: { text: "Unknown", cls: "bg-gray-50 text-gray-600" },
};

function mapTransactionStatus(s) {
  s = Number(s);
  if (s === 1) return "pending";
  if (s === 5) return "waiting_admin";
  if (s === 2) return "processing";
  if (s === 3) return "on_delivery";
  if (s === 4) return "finished";
  if (s === 9) return "cancelled";
  return "unknown";
}

function getCurrentStep(statusKey) {
  if (statusKey === "finished") return 3;
  if (statusKey === "on_delivery") return 2;
  if (statusKey === "processing") return 1;
  return 0;
}

const money = (v) => n(v, 0).toLocaleString("id-ID");
const safeDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB");
};
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

function unwrapResponse(raw) {
  if (raw?.serve) raw = raw.serve;
  if (raw?.data && (raw?.waybill !== undefined || raw?.data?.transaction)) {
    raw = raw.data;
  }
  return raw;
}

function buildAddressText(userAddress) {
  if (!userAddress) return { line1: "-", line2: "-", postal: "" };
  const line1 =
    userAddress.address ||
    userAddress.line1 ||
    userAddress.detail ||
    userAddress.street ||
    "-";

  const line2 =
    userAddress.biteshipAreaName ||
    [
      userAddress.subDistrictData?.name,
      userAddress.districtData?.name,
      userAddress.cityData?.name,
      userAddress.provinceData?.name,
    ]
      .filter(Boolean)
      .join(", ") ||
    "-";

  return {
    line1,
    line2,
    postal:
      userAddress.postalCode ||
      userAddress.postal_code ||
      userAddress.zip ||
      "",
  };
}

/* ===== FIXED NORMALIZER (getImageUrl ONLY) ===== */
function normalizeOrder(rawInput) {
  const raw = unwrapResponse(rawInput);
  const ecommerce = raw || {};
  const trx = ecommerce?.transaction || raw?.transaction || {};

  const details = arr(trx?.details);
  const shipments = arr(trx?.shipments).length
    ? arr(trx?.shipments)
    : arr(ecommerce?.shipments);
  const sh = shipments[0] || {};

  const statusKey = mapTransactionStatus(
    trx?.transactionStatus ?? trx?.transaction_status ?? trx?.status
  );
  const badge = STATUS_BADGE[statusKey] || STATUS_BADGE.unknown;

  const items = details.map((d) => {
    const p = d?.product || {};
    const medias = Array.isArray(p?.medias) ? p.medias : [];

    const imageUrl = getImageUrl(
      medias?.[0]?.url || p?.thumbnail || p?.image
    );

    return {
      id:
        d?.id ??
        `${trx?.transactionNumber || trx?.transaction_number || "trx"}-${
          d?.productId || "item"
        }`,
      name: p?.name || p?.title || "-",
      variant: d?.variant?.sku || d?.variant?.name || d?.attributes || "-",
      qty: n(d?.qty, 0),
      price: n(d?.price, 0),
      image: imageUrl, // STRING URL
    };
  });

  const subtotal = items.reduce(
    (s, it) => s + n(it.price, 0) * n(it.qty, 0),
    0
  );
  const shipmentFee = n(
    sh?.price ?? ecommerce?.shippingCost ?? ecommerce?.shipping_cost,
    0
  );
  const total =
    n(trx?.grandTotal ?? trx?.grand_total ?? trx?.amount ?? trx?.total, 0) ||
    subtotal + shipmentFee;

  const addrText = buildAddressText(
    ecommerce?.userAddress || ecommerce?.user_address
  );

  return {
    transactionNumber:
      trx?.transactionNumber || trx?.transaction_number || "-",
    statusKey,
    statusLabel: badge.text,
    statusCls: badge.cls,
    shipping: {
      orderDate: safeDate(trx?.createdAt || trx?.created_at),
      deliveryDate: "-",
      estimatedDelivery: sh?.estimationArrival || sh?.estimation_arrival || "-",
      courier: String(sh?.service || "-").toUpperCase(),
      serviceType: String(
        sh?.serviceType || sh?.service_type || ""
      ).toUpperCase(),
      resi: sh?.resiNumber || sh?.resi_number || "",
    },
    address: {
      name:
        ecommerce?.userAddress?.picName ||
        ecommerce?.userAddress?.name ||
        "-",
      line1: addrText.line1,
      line2: addrText.line2,
      postal: addrText.postal,
      phone:
        ecommerce?.userAddress?.picPhone ||
        ecommerce?.userAddress?.phone ||
        "-",
    },
    items,
    subtotal,
    serviceCharges: 0,
    shipmentFee,
    total,
  };
}

/* ===== PAGE ===== */
export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [order, setOrder] = useState(null);

  const transactionNumberFromUrl = params?.id
    ? decodeURIComponent(params.id)
    : "";

  const fetchOrder = async () => {
    if (!transactionNumberFromUrl) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res0 = await axios.post("/transaction/retrieve", {
        transaction_number: transactionNumberFromUrl,
      });
      const payload =
        res0?.data?.serve?.data || res0?.data?.data || res0?.data;
      if (payload) {
        setOrder(normalizeOrder(payload));
      }
    } catch {
      try {
        const res = await axios.get("/transaction", {
          params: { transaction_number: transactionNumberFromUrl, page: 1 },
        });
        const row = res?.data?.serve?.data?.[0];
        setOrder(row ? normalizeOrder(row) : null);
      } catch (err) {
        setOrder(null);
        setErrorMsg(
          err?.response?.data?.message || "Failed to load order detail"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionNumberFromUrl]);

  const currentStep = useMemo(
    () => (order ? getCurrentStep(order.statusKey) : 0),
    [order]
  );

  if (loading) return <div className="p-8">Loading…</div>;
  if (!order) return <div className="p-8">{errorMsg || "Order not found"}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/account/order-history")}
        className="text-sm text-gray-500 mb-4"
      >
        ← Back to My Order
      </button>

      <h1 className="text-2xl font-semibold mb-6">Order Tracking</h1>

      <div className="space-y-4">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 border rounded-lg p-3"
          >
            <div className="relative w-16 h-16 shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = getImageUrl(null);
                }}
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-gray-500">
                Variant: {item.variant}
              </p>
              <p className="text-xs text-gray-500">x{item.qty}</p>
            </div>

            <div className="font-medium">Rp {money(item.price)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
