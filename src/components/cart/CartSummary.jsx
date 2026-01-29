import { Button } from "@/components";
import { formatToRupiah } from "@/utils";

export default function CartSummary({
  selectedCount,
  displaySubtotal,
  loadingCheckout,
  onCheckout,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20">
      <h2 className="text-lg font-bold text-neutral-900 mb-6">
        Ringkasan Belanja
      </h2>
      <div className="space-y-3 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Produk dipilih</span>
          <span className="font-semibold text-neutral-900">
            {selectedCount} item
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-semibold text-neutral-900">
            {formatToRupiah(displaySubtotal)}
          </span>
        </div>
      </div>
      <Button
        variant="primary"
        size="md"
        className="w-full mt-6"
        disabled={!selectedCount || loadingCheckout}
        onClick={onCheckout}
      >
        {loadingCheckout ? "Memproses..." : `Checkout (${selectedCount})`}
      </Button>
    </div>
  );
}
