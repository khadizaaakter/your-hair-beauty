import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: { finalY: number };
    }
}

interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
    variant?: string;
}

interface InvoiceStoreInfo {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    secondaryPhone?: string;
    address: string;
    website: string;
    logoUrl?: string;
}

interface InvoiceData {
    orderId: string;
    orderDate: string;
    orderStatus?: string;
    paymentStatus?: string;
    paymentReference?: string;
    currency?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    items: InvoiceItem[];
    subtotal: number;
    discount?: number;
    shipping?: number;
    total: number;
    store?: Partial<InvoiceStoreInfo>;
}

const DEFAULT_STORE: InvoiceStoreInfo = {
    name: 'Your Hair & Beauty',
    tagline: 'Afro, Caribbean and European Beauty Essentials',
    email: 'info@yourhairbeauty.co.uk',
    phone: '+44 20 8318 0999',
    secondaryPhone: '',
    address: '37 Lewis Grove, Lewisham, London SE13 6BG',
    website: 'https://yourhairbeauty.co.uk',
    logoUrl: '/logo.png',
};

function formatMoney(value: number, currency = 'GBP'): string {
    try {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency} ${value.toFixed(2)}`;
    }
}

function formatAddress(address: unknown): string {
    if (!address) return '';

    if (typeof address === 'string') {
        return address;
    }

    if (typeof address === 'object') {
        const addr = address as Record<string, string | undefined>;
        const lines = [
            [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim(),
            addr.address1 || addr.address || addr.street,
            addr.address2,
            addr.address3,
            [addr.city, addr.state].filter(Boolean).join(', ').trim(),
            [addr.postcode || addr.zip, addr.country].filter(Boolean).join(', ').trim(),
        ]
            .map((line) => (line || '').trim())
            .filter(Boolean);

        return lines.join('\n');
    }

    return '';
}

function titleCase(input: string | undefined): string {
    if (!input) return 'N/A';
    return input
        .replace(/_/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

async function loadImageAsDataUrl(url?: string): Promise<string | null> {
    if (!url || typeof window === 'undefined') return null;

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(null);
                    return;
                }
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

export async function generateInvoice(data: InvoiceData): Promise<void> {
    const doc = new jsPDF();
    const store: InvoiceStoreInfo = { ...DEFAULT_STORE, ...(data.store || {}) };
    const currency = data.currency || 'GBP';

    const primaryColor: [number, number, number] = [236, 72, 153];
    const darkColor: [number, number, number] = [15, 23, 42];
    const mutedColor: [number, number, number] = [100, 116, 139];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 220, 36, 'F');

    const logoDataUrl = await loadImageAsDataUrl(store.logoUrl);
    if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 14, 8, 14, 14);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(store.name, logoDataUrl ? 32 : 14, 17);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(store.tagline, logoDataUrl ? 32 : 14, 24);

    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.text('INVOICE', 196, 20, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(`Invoice Date: ${data.orderDate}`, 196, 28, { align: 'right' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Store Details', 14, 48);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(store.address, 14, 54);
    doc.text(`Phone: ${store.phone}`, 14, 66);
    if (store.secondaryPhone) {
        doc.text(`Alt Phone: ${store.secondaryPhone}`, 14, 72);
    }
    doc.text(`Email: ${store.email}`, 14, store.secondaryPhone ? 78 : 72);
    doc.text(`Website: ${store.website}`, 14, store.secondaryPhone ? 84 : 78);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    doc.text('Customer', 108, 48);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(data.customerName || 'Customer', 108, 54);
    doc.text(data.customerEmail || 'N/A', 108, 60);
    if (data.customerPhone) {
        doc.text(data.customerPhone, 108, 66);
    }
    if (data.customerAddress) {
        const addressLines = doc.splitTextToSize(data.customerAddress, 84);
        doc.text(addressLines, 108, data.customerPhone ? 72 : 66);
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 90, 196, 90);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.text(`Order ID: ${data.orderId}`, 14, 98);
    doc.text(`Order Status: ${titleCase(data.orderStatus)}`, 14, 104);
    doc.text(`Payment Status: ${titleCase(data.paymentStatus)}`, 14, 110);
    if (data.paymentReference) {
        doc.text(`Payment Ref: ${data.paymentReference}`, 14, 116);
    }

    const tableRows = data.items.map((item) => [
        item.name,
        item.variant || '-',
        String(item.quantity),
        formatMoney(item.price, currency),
        formatMoney(item.quantity * item.price, currency),
    ]);

    autoTable(doc, {
        startY: data.paymentReference ? 124 : 120,
        head: [['Product', 'Variant', 'Qty', 'Unit Price', 'Line Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            textColor: darkColor,
            fontSize: 8.5,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            0: { cellWidth: 66 },
            1: { cellWidth: 35 },
            2: { cellWidth: 16, halign: 'center' },
            3: { cellWidth: 34, halign: 'right' },
            4: { cellWidth: 34, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable?.finalY || 170;
    const totalsX = 128;
    let totalsY = finalY + 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.text('Subtotal:', totalsX, totalsY);
    doc.setTextColor(...darkColor);
    doc.text(formatMoney(data.subtotal, currency), 196, totalsY, { align: 'right' });

    if (data.discount && data.discount > 0) {
        totalsY += 6;
        doc.setTextColor(...mutedColor);
        doc.text('Discount:', totalsX, totalsY);
        doc.setTextColor(22, 163, 74);
        doc.text(`-${formatMoney(data.discount, currency)}`, 196, totalsY, { align: 'right' });
    }

    if (data.shipping !== undefined) {
        totalsY += 6;
        doc.setTextColor(...mutedColor);
        doc.text('Shipping:', totalsX, totalsY);
        doc.setTextColor(...darkColor);
        doc.text(data.shipping === 0 ? 'FREE' : formatMoney(data.shipping, currency), 196, totalsY, { align: 'right' });
    }

    totalsY += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(totalsX, totalsY, 196, totalsY);

    totalsY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...darkColor);
    doc.text('Grand Total:', totalsX, totalsY);
    doc.setTextColor(...primaryColor);
    doc.text(formatMoney(data.total, currency), 196, totalsY, { align: 'right' });

    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 25, 196, pageHeight - 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text(`Thank you for shopping with ${store.name}.`, 14, pageHeight - 18);
    doc.text(`Support: ${store.email} | ${store.phone}`, 14, pageHeight - 13);

    doc.save(`Invoice-${data.orderId}.pdf`);
}

function parseMaybeJson(value: unknown): unknown {
    if (!value) return null;
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export async function generateInvoiceFromOrder(order: {
    id: string | number;
    date?: string;
    created_at?: string;
    total?: number;
    total_amount?: number;
    subtotal?: number;
    discount?: number;
    discount_amount?: number;
    shipping?: number;
    shipping_amount?: number;
    status?: string;
    payment_status?: string;
    worldpay_order_code?: string;
    currency?: string;
    items: Array<{
        name?: string;
        product_name?: string;
        variant_name?: string;
        variant_value?: string;
        selected_variants?: Array<{ name: string; value: string }>;
        quantity: number;
        price: number;
    }>;
    customerName?: string;
    user_name?: string;
    customerEmail?: string;
    user_email?: string;
    customerPhone?: string;
    customerAddress?: string | Record<string, string>;
    shipping_address?: string | Record<string, string>;
}): Promise<void> {
    const orderId = typeof order.id === 'number' ? `ORD-${order.id}` : String(order.id);
    const orderDateRaw = order.date || order.created_at || new Date().toISOString();
    const formattedDate = new Date(orderDateRaw).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const normalizedShipping = parseMaybeJson(order.shipping_address);
    const normalizedCustomerAddress = order.customerAddress || normalizedShipping || '';
    const addressText = formatAddress(normalizedCustomerAddress);

    const items: InvoiceItem[] = (order.items || []).map((item) => {
        const selectedVariantsText = Array.isArray(item.selected_variants) && item.selected_variants.length > 0
            ? item.selected_variants
                .map((variant) => `${variant.name}: ${variant.value}`)
                .join(' | ')
            : '';
        const variant = selectedVariantsText || [item.variant_name, item.variant_value].filter(Boolean).join(': ');
        return {
            name: item.name || item.product_name || 'Product',
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0),
            variant: variant || undefined,
        };
    });

    const subtotal = Number(
        order.subtotal ??
        items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
    const discount = Number(order.discount ?? order.discount_amount ?? 0);
    const shipping = Number(order.shipping ?? order.shipping_amount ?? 0);
    const total = Number(order.total ?? order.total_amount ?? subtotal - discount + shipping);

    await generateInvoice({
        orderId,
        orderDate: formattedDate,
        orderStatus: order.status,
        paymentStatus: order.payment_status,
        paymentReference: order.worldpay_order_code,
        currency: order.currency || 'GBP',
        customerName: order.customerName || order.user_name || 'Customer',
        customerEmail: order.customerEmail || order.user_email || '',
        customerPhone: order.customerPhone || (typeof normalizedShipping === 'object' && normalizedShipping ? (normalizedShipping as any).phone : undefined),
        customerAddress: addressText,
        items,
        subtotal,
        discount,
        shipping,
        total,
    });
}
