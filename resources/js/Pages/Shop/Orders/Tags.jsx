import { QRCodeSVG } from 'qrcode.react';

export default function Tags({ order }) {
    return (
        <div className="p-8">
            <div className="mb-4 flex items-center justify-between print:hidden">
                <h1 className="text-xl font-semibold">Order #{order.id} — garment tags</h1>
                <button onClick={() => window.print()} className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
                    Print
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                {order.items.flatMap((item) =>
                    item.garment_tags.map((tag) => (
                        <div key={tag.id} className="flex flex-col items-center rounded border border-slate-300 p-4 text-center">
                            <QRCodeSVG value={tag.qr_code} size={128} />
                            <p className="mt-2 text-sm font-medium">{item.service?.name}</p>
                            <p className="text-xs text-slate-500">Order #{order.id} — Tag #{tag.id}</p>
                            <p className="mt-1 font-mono text-[10px] text-slate-400 break-all">{tag.qr_code}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Print page: standalone, no shell nav — nothing else on the page to distract during printing.
