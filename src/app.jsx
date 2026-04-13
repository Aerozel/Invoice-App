import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import './style.css';

const PRODUCTS = [
  { label: 'Select a product...', value: 0 },
  { label: 'CF500', value: 175 }, { label: 'CF1000', value: 280 },
  { label: 'SR500', value: 140 }, { label: 'SR1000', value: 250 },
  { label: 'DC500', value: 180 }, { label: 'DC1000', value: 290 },
  { label: 'DC5000', value: 1250 }, { label: 'MC500', value: 120 },
  { label: 'MC1000', value: 190 }, { label: 'MC5000', value: 800 },
  { label: 'DT1000', value: 310 }, { label: 'DT5000', value: 1500 },
  { label: 'TC1000', value: 160 }, { label: 'TC5000', value: 650 },
  { label: 'DW1000', value: 140 }, { label: 'DW5000', value: 400 },
  { label: 'PFW1000', value: 175 }, { label: 'PFW5000', value: 750 },
  { label: 'FW1000', value: 150 }, { label: 'FW5000', value: 600 },
];

export default function App() {
  const [partyName, setPartyName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [quantity, setQuantity] = useState('');
  const [items, setItems] = useState([]);
  const [invoiceCounter, setInvoiceCounter] = useState(1);

  useEffect(() => {
    loadInvoiceCounter();
  }, []);

  const loadInvoiceCounter = () => {
    const now = new Date();
    const currentMonthYear = `${now.getMonth() + 1}-${now.getFullYear()}`;
    const savedData = localStorage.getItem('invoice_data');
    
    if (savedData) {
      const { monthYear, counter } = JSON.parse(savedData);
      if (monthYear === currentMonthYear) {
        setInvoiceCounter(counter);
      } else {
        setInvoiceCounter(1);
        localStorage.setItem('invoice_data', JSON.stringify({ monthYear: currentMonthYear, counter: 1 }));
      }
    } else {
      localStorage.setItem('invoice_data', JSON.stringify({ monthYear: currentMonthYear, counter: 1 }));
    }
  };

  const getFormattedInvoiceNumber = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const xxxx = String(invoiceCounter).padStart(4, '0');
    return `${mm}/${yyyy}/${xxxx}`;
  };

  const addItem = () => {
    if (selectedProduct.value === 0 || !quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      alert('Please select a valid product and enter a quantity greater than 0.');
      return;
    }
    
    const qty = parseInt(quantity);
    const newItem = {
      id: Date.now().toString(),
      name: selectedProduct.label,
      rate: selectedProduct.value,
      quantity: qty,
      total: selectedProduct.value * qty,
    };
    
    setItems([...items, newItem]);
    setQuantity(''); 
    setSelectedProduct(PRODUCTS[0]); 
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = subTotal * 0.20;
  const grandTotal = subTotal - discount;

  const generateAndSharePDF = async () => {
    if (!partyName.trim() || items.length === 0) {
      alert('Please enter a party name and add at least one item.');
      return;
    }

    const invoiceNumber = getFormattedInvoiceNumber();
    const dateStr = new Date().toLocaleDateString();

    const htmlContent = `
      <div style="font-family: 'Helvetica', sans-serif; padding: 30px; color: #333; max-width: 800px; margin: auto;">
        <h1 style="text-align: center; color: #111; border-bottom: 2px solid #333; padding-bottom: 10px;">TAX INVOICE</h1>
        <div style="display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 30px;">
          <div>
            <p><strong>Billed To:</strong><br/>${partyName}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Item</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Rate</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">₹${item.rate}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">₹${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 30px; width: 50%; float: right;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>Subtotal:</span>
            <span>₹${subTotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>Discount (20%):</span>
            <span style="color: #FF3B30;">- ₹${discount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; font-size: 1.2em; border-top: 2px solid #333;">
            <span>Actual Amount:</span>
            <span style="color: #34C759;">₹${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;

    const fileName = `Invoice_${invoiceNumber.replace(/\//g, '-')}.pdf`;
    const opt = {
      margin: 0.5,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      // Generate PDF as a blob
      const pdfBlob = await html2pdf().set(opt).from(htmlContent).output('blob');
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Increment Counter
      const newCounter = invoiceCounter + 1;
      setInvoiceCounter(newCounter);
      const now = new Date();
      const currentMonthYear = `${now.getMonth() + 1}-${now.getFullYear()}`;
      localStorage.setItem('invoice_data', JSON.stringify({ monthYear: currentMonthYear, counter: newCounter }));

      // Web Share API for Mobile Browsers (WhatsApp integration)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoiceNumber}`,
          text: `Here is the invoice for ${partyName}`,
          files: [file]
        });
      } else {
        // Fallback for Desktop: Auto-download the file
        const fileUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Reset form
      setPartyName('');
      setItems([]);

    } catch (error) {
      console.error(error);
      alert('An error occurred while generating the PDF.');
    }
  };

  return (
    <div className="app-container">
      <h1 className="header-title">Invoice Generator</h1>
      
      <input
        className="input-field"
        type="text"
        placeholder="Party Name"
        value={partyName}
        onChange={(e) => setPartyName(e.target.value)}
      />

      <div className="input-group">
        <select 
          className="input-field select-field"
          value={selectedProduct.label}
          onChange={(e) => {
            const prod = PRODUCTS.find(p => p.label === e.target.value);
            setSelectedProduct(prod);
          }}
        >
          {PRODUCTS.map((p, index) => (
            <option key={index} value={p.label}>
              {p.value > 0 ? `${p.label} (₹${p.value})` : p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="add-row">
        <input
          className="input-field qty-field"
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
        <button className="btn btn-primary" onClick={addItem}>+ Add</button>
      </div>

      <hr className="divider" />

      <h2 className="section-title">Cart</h2>
      <div className="items-list">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <div>
              <div className="item-title">{item.name}</div>
              <div className="item-sub">Qty: {item.quantity} x ₹{item.rate}</div>
            </div>
            <div className="item-right">
              <div className="item-title">₹{item.total}</div>
              <button className="btn-remove" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="empty-state">No items added yet.</div>}
      </div>

      <div className="summary-card">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Discount (20%):</span>
          <span className="discount-text">- ₹{discount.toFixed(2)}</span>
        </div>
        <div className="summary-row grand-total">
          <span>Actual Amount:</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <button className="btn btn-success" onClick={generateAndSharePDF}>
        Generate PDF & Share
      </button>
    </div>
  );
}