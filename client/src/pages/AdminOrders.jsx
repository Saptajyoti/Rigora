import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SiteHeader from '../components/SiteHeader';
import { api } from '../lib/api';
import { money } from '../lib/catalog';
import { updateOrderStatus } from '../store/orderSlice';
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.orders.loading);
  const refresh = useCallback(
    () =>
      api
        .get('/orders/admin/all', { params: { status, search } })
        .then(({ data }) => setOrders(data.orders)),
    [status, search],
  );
  useEffect(() => {
    refresh().catch(() => setOrders([]));
  }, [refresh]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="text-3xl font-semibold">Order management</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order ID"
            className="input"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="input"
          >
            <option value="">All statuses</option>
            {[
              'pending',
              'confirmed',
              'processing',
              'shipped',
              'delivered',
              'cancelled',
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <button
            onClick={refresh}
            className="rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-zinc-950"
          >
            Search
          </button>
        </div>
        <div className="mt-6 overflow-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr>
                <th className="p-4">Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-white/10">
                  <td className="p-4">{order._id.slice(-8)}</td>
                  <td>
                    {order.user?.firstName} {order.user?.lastName}
                    <br />
                    <span className="text-zinc-500">{order.user?.email}</span>
                  </td>
                  <td>{money(order.grandTotal)}</td>
                  <td>
                    <select
                      value={order.orderStatus}
                      disabled={loading}
                      onChange={async (event) => {
                        await dispatch(
                          updateOrderStatus({
                            id: order._id,
                            orderStatus: event.target.value,
                          }),
                        );
                        refresh();
                      }}
                      className="bg-transparent"
                    >
                      <option>{order.orderStatus}</option>
                      {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
                        .filter((value) => value !== order.orderStatus)
                        .map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={order.paymentStatus}
                      onChange={async (event) => {
                        await dispatch(
                          updateOrderStatus({
                            id: order._id,
                            paymentStatus: event.target.value,
                          }),
                        );
                        refresh();
                      }}
                      className="bg-transparent"
                    >
                      <option>pending</option>
                      <option>paid</option>
                      <option>failed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
