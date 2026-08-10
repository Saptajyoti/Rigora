import { money } from '../lib/catalog';
export default function CartSummary({ totals }) {
  return (
    <aside className="rigora-glass rounded-xl p-5">
      <h2 className="font-semibold">Order summary</h2>
      <div className="mt-5 flex justify-between text-sm">
        <span className="text-zinc-400">Subtotal</span>
        <span>{money(totals.subtotal)}</span>
      </div>
      <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
        <span>Estimated total</span>
        <span>{money(totals.estimatedTotal)}</span>
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        Taxes and shipping are calculated at checkout.
      </p>
    </aside>
  );
}
