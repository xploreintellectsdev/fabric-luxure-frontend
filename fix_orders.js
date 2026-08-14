const fs = require('fs');
let lines = fs.readFileSync('app/((withOutHeadFoot))/admin/orders/page.tsx', 'utf8').split('\n');

// 1. Keep lines up to 999
let cleanLines = lines.slice(0, 1000);

// 2. Append the correct Print-Only Invoice Container and close the component
const rest = `      {/* PRINT-ONLY INVOICE CONTAINER */}
      {selectedOrder && (
        <div className="hidden print:block printable-invoice-container text-black bg-white font-sans text-[15px] p-8">
          {/* Header section */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-wide uppercase text-slate-800">Fabric Luxure</h1>
              <p className="text-slate-500 mt-1">Premium fabrics & Custom tailoring</p>
              <p className="text-slate-500">support@fabricluxure.com | www.fabricluxure.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest">Invoice</h2>
              <p className="text-slate-500 mt-1">Invoice ID: <span className="font-semibold text-slate-800">{selectedOrder.order_number}</span></p>
              <p className="text-slate-500">Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
              <p className="text-slate-500">Payment Status: <span className="font-semibold uppercase text-slate-800">{selectedOrder.payment_status}</span></p>
            </div>
          </div>

          {/* Billing & Shipping Section */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">Customer Details</h3>
              <p className="font-semibold text-slate-800">{selectedOrder.address?.fullName || "N/A"}</p>
              <p className="text-slate-600">Email: {selectedOrder.customer_email || "N/A"}</p>
              <p className="text-slate-600">Phone: {selectedOrder.address?.mobile || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">Delivery Address</h3>
              {selectedOrder.address ? (
                <div className="text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">{selectedOrder.address.fullName}</p>
                  <p>{selectedOrder.address.houseBuilding}</p>
                  <p>{selectedOrder.address.streetLocality}</p>
                  {selectedOrder.address.landmark && <p className="text-slate-400">Landmark: {selectedOrder.address.landmark}</p>}
                  <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.postalCode}</p>
                </div>
              ) : (
                <p className="text-slate-400 italic">No delivery address details.</p>
              )}
            </div>
          </div>

          {/* MAIN TABLE CONTAINER */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[12px] font-bold">
                  <th className="py-3 px-4 w-[25%]">Item Description</th>
                  <th className="py-3 px-4 w-[45%]">Specifications</th>
                  <th className="py-3 px-4 text-center w-[10%]">Qty</th>
                  <th className="py-3 px-4 text-right w-[10%]">Price</th>
                  <th className="py-3 px-4 text-right w-[10%]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedOrder.products.map((item, idx) => (
                  <tr key={idx} className="text-slate-800 text-[14px]">
                    <td className="py-3 px-4 border-r border-slate-200">
                      <div className="font-semibold">{item.product_name}</div>
                    </td>
                    <td className="py-3 px-4 border-r border-slate-200">
                      <div className="flex flex-col gap-1 text-[13px] text-slate-600">
                        {item.fit_style && <div><span className="font-medium">Fit:</span> {item.fit_style}</div>}
                        {item.selected_size && <div><span className="font-medium">Size:</span> {item.selected_size}</div>}
                        {item.selected_length && <div><span className="font-medium">Length:</span> {item.selected_length}</div>}
                        {item.selected_sleeve && <div><span className="font-medium">Sleeve:</span> {item.selected_sleeve}</div>}
                        {item.custom_measurement && <div><span className="font-medium">Custom:</span> {item.custom_measurement}</div>}
                        {item.monogram && (
                          <div className="mt-1 pt-1 border-t border-slate-200">
                            <span className="font-semibold block">Monogram Details:</span>
                            <div>Text: {item.monogram.text}</div>
                            <div>Placement: {item.monogram.placement}</div>
                            <div>Color: {item.monogram.color}</div>
                            <div>Font: {item.monogram.font}</div>
                            <div>Price: ₹{item.monogram.price.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center border-r border-slate-200">{item.quantity}</td>
                    <td className="py-3 px-4 text-right border-r border-slate-200">₹{item.price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-semibold">₹{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation breakdown */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 border-t border-slate-200 pt-3 text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-bold">Included</span>
              </div>
              <div className="flex justify-between">
                <span>Stitching Charge</span>
                <span>₹{selectedOrder.stitching_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{selectedOrder.shipping_amount === 0 ? "FREE" : \`₹\${selectedOrder.shipping_amount}\`}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-[15px] border-t border-slate-200 pt-2 mt-2">
                <span>Grand Total</span>
                <span>₹{selectedOrder.grand_total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Invoice footer message */}
          <div className="text-center text-slate-500 border-t border-slate-200 pt-6 mt-12 text-[13px]">
            <p>Thank you for shopping with Fabric Luxure!</p>
            <p>This is a computer generated invoice and does not require signature.</p>
          </div>
        </div>
      )}
    </div>
  );
}
`;

cleanLines.push(rest);
fs.writeFileSync('app/((withOutHeadFoot))/admin/orders/page.tsx', cleanLines.join('\n'));
