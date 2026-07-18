import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const BookingContext = createContext(null);

/** Holds in-progress state across the booking wizard's screens (FR-CUS booking flow). */
export function BookingProvider({ children }) {
    const [items, setItems] = useState([]); // [{ service_id, name, unit, price, qty }]
    const [addressId, setAddressId] = useState(null);
    const [timeSlotId, setTimeSlotId] = useState(null);
    const [note, setNote] = useState('');

    const reset = useCallback(() => {
        setItems([]);
        setAddressId(null);
        setTimeSlotId(null);
        setNote('');
    }, []);

    const setQty = useCallback((service, qty) => {
        setItems((current) => {
            const withoutService = current.filter((i) => i.service_id !== service.id);
            if (qty <= 0) return withoutService;
            return [...withoutService, {
                service_id: service.id,
                name: service.name,
                unit: service.unit,
                price: service.price,
                qty,
            }];
        });
    }, []);

    /** Prefill the basket from a past order (FR-CUS reorder), skipping slot/address so they're chosen fresh. */
    const startReorder = useCallback((order) => {
        setItems(order.items.map((item) => ({
            service_id: item.service.id,
            name: item.service.name,
            unit: item.service.unit,
            price: Number(item.unit_price),
            qty: Number(item.qty),
        })));
        setAddressId(order.address?.id ?? null);
        setTimeSlotId(null);
        setNote('');
    }, []);

    const value = useMemo(() => ({
        items, setQty, addressId, setAddressId, timeSlotId, setTimeSlotId, note, setNote, reset, startReorder,
    }), [items, setQty, addressId, timeSlotId, note, reset, startReorder]);

    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (!context) throw new Error('useBooking must be used within BookingProvider');
    return context;
}
