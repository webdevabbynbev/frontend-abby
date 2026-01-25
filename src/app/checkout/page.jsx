"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios.js";
import { isNumericLike } from "@/utils/number";
import { calcWeightRounded } from "@/utils/checkoutWeight";
import { useCheckoutCartServer } from "@/app/hooks/useCheckoutCartServer";
import { useCartMutations } from "@/app/hooks/useCartMutations";
import { useAddresses } from "@/app/hooks/useAddresses";
import { useLocationNames } from "@/app/hooks/useLocationNames";
import { useShippingOptions } from "@/app/hooks/useShippingOptions";
import { useAuth } from "@/context/AuthContext";

export const dynamic = "force-dynamic";

import CheckoutCart from "@/components/checkout/CheckoutCart";
import CheckoutShipping from "@/components/checkout/CheckoutShipping";
import CheckoutPayment from "@/components/checkout/CheckoutPayment";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = !user;

  const { checkoutItems, subtotal, loadingCart, reloadCart } =
    useCheckoutCartServer();
  const { loadingItemId, handleUpdateQty, handleDelete } = useCartMutations({
    reloadCart,
  });

  const {
    addresses,
    selectedAddressId,
    selectedAddress,
    loadingAddr,
    reloadAddresses,
    selectAsMain,
  } = useAddresses({ enabled: !!user });

  const [guestRecipientName, setGuestRecipientName] = useState("");
  const [guestAddressLine, setGuestAddressLine] = useState("");
  const [guestArea, setGuestArea] = useState(null);

  const { provinceMap, cityMap } = useLocationNames(addresses);
  const weightRounded = useMemo(
    () => calcWeightRounded(checkoutItems),
    [checkoutItems],
  );

  const guestAddress = useMemo(() => {
    if (!guestArea && !guestAddressLine && !guestRecipientName) return null;
    return {
      address: guestAddressLine,
      pic_name: guestRecipientName,
      area_id: guestArea?.value ?? null,
      area_name: guestArea?.label ?? "",
      postal_code: guestArea?.data?.postalCode ?? "",
      district: guestArea?.data?.kecamatan ?? "",
      city: guestArea?.data?.kota ?? "",
      province: guestArea?.data?.provinsi ?? "",
    };
  }, [guestArea, guestAddressLine, guestRecipientName]);

  const selectedAddressResolved = isGuest
    ? guestAddress?.area_id
      ? guestAddress
      : null
    : selectedAddress;
  const addressKey = isGuest
    ? guestAddress?.area_id
      ? `guest:${guestAddress.area_id}`
      : null
    : selectedAddressId;

  const guestReadyForShipping = Boolean(guestAddress?.area_id);
  const guestReadyForPayment = Boolean(
    guestAddress?.area_id &&
    guestRecipientName.trim() &&
    guestAddressLine.trim(),
  );

  const {
    shippingAll,
    selectedShipping,
    setSelectedShipping,
    expandedCouriers,
    setExpandedCouriers,
    loadingShip,
    shippingError,
    shippingGroups,
    bestByCourier,
    courierKeys,
  } = useShippingOptions({
    selectedAddress: selectedAddressResolved,
    selectedAddressId: isGuest ? null : selectedAddressId,
    areaId: isGuest ? (guestAddress?.area_id ?? null) : null,
    addressKey,
    guestAddress: isGuest ? guestAddress : null,
    weightRounded,
    enabled:
      !loadingCart &&
      checkoutItems.length > 0 &&
      (isGuest ? guestReadyForShipping : !loadingAddr),
  });

  const [confirmedShipping, setConfirmedShipping] = useState(null);
  useEffect(
    () => setConfirmedShipping(null),
    [addressKey, weightRounded, checkoutItems.length],
  );

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);

  // voucher (disimpen di parent biar payload checkout kebaca)
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // persist voucher
  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout_voucher");
      if (raw) setSelectedVoucher(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (selectedVoucher)
        localStorage.setItem(
          "checkout_voucher",
          JSON.stringify(selectedVoucher),
        );
      else localStorage.removeItem("checkout_voucher");
    } catch {}
  }, [selectedVoucher]);

  const displayAddresses = useMemo(() => {
    return (Array.isArray(addresses) ? addresses : []).map((a) => {
      const cityVal = a?.city;
      const provVal = a?.province;

      const cityName =
        a?.cityName ||
        a?.city_name ||
        (typeof cityVal === "string" && !isNumericLike(cityVal)
          ? cityVal
          : cityMap[String(cityVal)] ||
            (isNumericLike(cityVal) ? String(cityVal) : ""));

      const provinceName =
        a?.provinceName ||
        a?.province_name ||
        provinceMap[String(provVal)] ||
        (isNumericLike(provVal) ? String(provVal) : "");

      return { ...a, _cityName: cityName, _provinceName: provinceName };
    });
  }, [addresses, cityMap, provinceMap]);

  const handlePayNow = async () => {
    if (isGuest) {
      if (!guestRecipientName.trim()) return alert("Nama penerima wajib diisi");
      if (!guestAddressLine.trim()) return alert("Alamat lengkap wajib diisi");
      if (!guestAddress?.area_id) return alert("Kecamatan wajib dipilih");
    } else if (!selectedAddressId) {
      return alert("Alamat belum dipilih");
    }
    if (!confirmedShipping) return alert("Pilih metode pengiriman dulu");
    if (!selectedPayment) return alert("Metode pembayaran belum dipilih");
    if (!checkoutItems.length) return alert("Item checkout kosong");

    try {
      setLoadingPay(true);

      const cartIds = checkoutItems.map((x) => x?.id).filter(Boolean);
      const voucherObj = selectedVoucher?.voucher ?? selectedVoucher;

      const payload = {
        cart_ids: cartIds,
        shipping_service_type: confirmedShipping.courier,
        shipping_service: confirmedShipping.service,
        shipping_price: confirmedShipping.price,
        shipping_etd: confirmedShipping.estimate ?? null,
        weight: weightRounded,
        is_protected: false,
        protection_fee: 0,
        voucher_id: voucherObj?.id || 0,
      };

      if (isGuest) {
        payload.address = guestAddressLine.trim();
        payload.pic_name = guestRecipientName.trim();
        payload.area_id = guestAddress?.area_id ?? null;
        payload.area_name = guestAddress?.area_name ?? "";
        payload.postal_code = guestAddress?.postal_code ?? "";
        payload.district = guestAddress?.district ?? "";
        payload.city = guestAddress?.city ?? "";
        payload.province = guestAddress?.province ?? "";
      } else {
        payload.user_address_id = selectedAddressId;
      }

      const res = await axios.post("/transaction", payload);
      const serve = res?.data?.serve;

      const token = serve?.ecommerce?.tokenMidtrans;
      const redirectUrl = serve?.ecommerce?.redirectUrl;
      const orderId =
        serve?.transactionNumber ||
        serve?.transaction_number ||
        serve?.transaction?.transactionNumber ||
        null;

      const goOrderHistory = () => {
        const q = orderId ? `?order_id=${encodeURIComponent(orderId)}` : "";
        router.push(`/account/order-history${q}`);
      };

      if (!token && !redirectUrl) {
        console.warn("Transaction response:", res?.data);
        alert("Gagal memulai pembayaran: token/redirect_url tidak ditemukan.");
        return;
      }

      if (token && typeof window !== "undefined" && window.snap?.pay) {
        window.snap.pay(token, {
          onSuccess: goOrderHistory,
          onPending: goOrderHistory,
          onError: () => alert("Pembayaran gagal"),
          onClose: () => {},
        });
        return;
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      alert(`Transaksi dibuat (${orderId || "-"}) tapi Snap belum ready.`);
    } catch (err) {
      console.error("create transaction error:", err?.response?.data || err);
      alert(err?.response?.data?.message || "Gagal membuat transaksi");
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="max-w-7xl mx-auto px-4 py-10 flex gap-10">
        {/* LEFT */}
        <div className="flex-1 space-y-6">
          <CheckoutCart
            checkoutItems={checkoutItems}
            loadingCart={loadingCart}
            loadingPay={loadingPay}
            loadingItemId={loadingItemId}
            onUpdateQty={(item, qty) => handleUpdateQty(item, qty)}
            onDelete={(item) => handleDelete(item)}
          />

          <CheckoutShipping
            displayAddresses={displayAddresses}
            loadingAddr={loadingAddr}
            selectedAddressId={selectedAddressId}
            onSelectMain={selectAsMain}
            onReloadAddresses={reloadAddresses}
            isGuest={isGuest}
            guestRecipientName={guestRecipientName}
            guestAddressLine={guestAddressLine}
            guestArea={guestArea}
            onGuestRecipientNameChange={setGuestRecipientName}
            onGuestAddressChange={setGuestAddressLine}
            weightRounded={weightRounded}
            shippingAllCount={shippingAll.length}
            loadingShip={loadingShip}
            shippingError={shippingError}
            courierKeys={courierKeys}
            expandedCouriers={expandedCouriers}
            setExpandedCouriers={setExpandedCouriers}
            shippingGroups={shippingGroups}
            bestByCourier={bestByCourier}
            selectedShipping={selectedShipping}
            confirmedShipping={confirmedShipping}
            onConfirmShipping={(opt) => {
              setConfirmedShipping(opt);
              setSelectedShipping(opt);
            }}
          />
        </div>

        {/* RIGHT */}
        <CheckoutPayment
          isGuest={isGuest}
          hasShippingAddress={
            isGuest ? guestReadyForPayment : Boolean(selectedAddressId)
          }
          subtotal={subtotal}
          checkoutCount={checkoutItems.length}
          confirmedShipping={confirmedShipping}
          loadingPay={loadingPay}
          loadingCart={loadingCart}
          loadingAddr={loadingAddr}
          loadingShip={loadingShip}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          selectedVoucher={selectedVoucher}
          setSelectedVoucher={setSelectedVoucher}
          onPayNow={handlePayNow}
        />
      </div>
    </>
  );
}
