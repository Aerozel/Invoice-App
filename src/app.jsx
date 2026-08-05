import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './style.css';

const PRODUCTS = [
  { label: 'Select a product...', value: 0 },
  { label: 'CF500', value: 175 }, { label: 'CF1000', value: 280 },
  { label: 'SR500', value: 140 }, { label: 'SR1000', value: 250 },
  { label: 'DC500', value: 180 }, { label: 'DC1000', value: 290 },
  { label: 'DC5000', value: 1250 }, { label: 'MC500', value: 120 },
  { label: 'MC1000', value: 190 }, { label: 'MC5000', value: 800 },
  { label: 'DT500', value: 180 }, { label: 'DT1000', value: 310 }, 
  { label: 'DT5000', value: 1500 }, { label: 'TC1000', value: 160 }, 
  { label: 'TC5000', value: 650 }, { label: 'DW1000', value: 140 }, 
  { label: 'DW5000', value: 400 }, { label: 'PFW1000', value: 175 }, 
  { label: 'PFW5000', value: 725 }, { label: 'FW1000', value: 150 }, 
  { label: 'FW5000', value: 600 }, { label: 'DT500', value: 180 },
  { label: 'HW500', value: 140 }, { label: 'HW1000', value: 220 }
];

export default function App() {
  // const [partyName, setPartyName] = useState('');
  // const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  // const [quantity, setQuantity] = useState('');
  // const [items, setItems] = useState([]);

  const [partyName, setPartyName] = useState('');
  const [cart, setCart] = useState({}); // Stores selections as { 'ProductName': quantity }
  
  const [discountPercent, setDiscountPercent] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Custom Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when tapping outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    generateNewInvoiceNumber();
  }, []);

  const generateNewInvoiceNumber = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const randomXXXX = String(Math.floor(1000 + Math.random() * 9000)); // Generates 1000 to 9999
    setInvoiceNumber(`${dd}${mm}${yy}-${randomXXXX}`);
  };

  // const addItem = () => {
  //   if (selectedProduct.value === 0 || !quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
  //     alert('Please select a valid product and enter a quantity greater than 0.');
  //     return;
  //   }
    
  //   const qty = parseInt(quantity);
  //   const newItem = {
  //     id: Date.now().toString(),
  //     name: selectedProduct.label,
  //     rate: selectedProduct.value,
  //     quantity: qty,
  //     total: selectedProduct.value * qty,
  //   };
    
  //   setItems([...items, newItem]);
  //   setQuantity(''); 
  //   setSelectedProduct(PRODUCTS[0]); 
  // };

  // const removeItem = (id) => {
  //   setItems(items.filter(item => item.id !== id));
  // };

  const handleProductSelect = (product) => {
    setCart(prev => {
      if (prev[product.label] !== undefined) return prev; 
      return { ...prev, [product.label]: '' }; // Start completely blank
    });
    setSearchTerm(''); // Clear search box after selection
    setIsDropdownOpen(true); // Keep dropdown open!
  };

  const removeItem = (label) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[label];
      return newCart;
    });
  };

  const handleQuantityChange = (label, val) => {
    // Allow empty string so user can delete the number
    const newQty = val === '' ? '' : parseInt(val, 10);
    setCart(prev => ({ ...prev, [label]: newQty }));
  };

  // Safely calculate totals even if quantity field is currently blank
  const items = Object.entries(cart).map(([label, qty]) => {
    const product = PRODUCTS.find(p => p.label === label);
    const safeQty = qty === '' ? 0 : qty;
    return {
      id: label,
      name: label,
      rate: product.value,
      quantity: qty,
      total: product.value * safeQty
    };
  });

  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = subTotal * (discountPercent / 100);
  const grandTotal = subTotal - discount;

  const generateAndSharePDF = async () => {
    if (!partyName.trim() || items.length === 0) {
      alert('Please enter a party name and add at least one item.');
      return;
    }

    const hasEmptyQuantities = items.some(item => item.quantity === '' || item.quantity <= 0);
    if (hasEmptyQuantities) {
      alert('Please enter a valid quantity for all selected products before generating.');
      return;
    }

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
            <span>Discount (${discountPercent}%):</span>
            <span style="color: #FF3B30;">- ₹${discount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; font-size: 1.2em; border-top: 2px solid #333;">
            <span>Actual Amount:</span>
            <span style="color: #34C759;">₹${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;

    // Clean up party name for safe file saving, and format as {party name}+{invoice number}.pdf
    const safePartyName = partyName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const fileName = `${safePartyName}+${invoiceNumber}.pdf`;
    
    const opt = {
      margin: 0.5,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(htmlContent).output('blob');
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Generate a new random invoice number for the next customer
      generateNewInvoiceNumber();

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoiceNumber}`,
          text: `Here is the invoice for ${partyName}`,
          files: [file]
        });
      } else {
        const fileUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // setPartyName('');
      // setItems([]);

      setPartyName('');
      setCart({});

    } catch (error) {
      console.error(error);
      alert('An error occurred while generating the PDF.');
    }
  };

  return (
    <div className="app-container">
      <h1 className="header-title">Invoice Generator</h1>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>Invoice No:</span>
        <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>{invoiceNumber}</span>
      </div>
      
      <input
        className="input-field"
        type="text"
        placeholder="Party Name"
        value={partyName}
        onChange={(e) => setPartyName(e.target.value)}
      />

      {/* <div className="input-group">
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
      </div> */}

      {/* Custom Searchable & Auto-open Dropdown */}
      <div className="input-group" style={{ marginTop: '20px', position: 'relative' }} ref={dropdownRef}>
        <input
          type="text"
          className="input-field"
          placeholder="Search & select products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
        
        {isDropdownOpen && (
          <ul style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            maxHeight: '220px', 
            overflowY: 'auto', 
            background: '#fff', 
            border: '1px solid #ccc', 
            borderRadius: '6px', 
            zIndex: 1000,
            listStyle: 'none',
            padding: 0,
            margin: '4px 0 0 0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {PRODUCTS.filter(p => p.value > 0 && p.label.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              PRODUCTS.filter(p => p.value > 0 && p.label.toLowerCase().includes(searchTerm.toLowerCase())).map((p, index) => {
                const isSelected = cart[p.label] !== undefined;
                return (
                  <li 
                    key={index} 
                    onClick={() => !isSelected && handleProductSelect(p)}
                    style={{ 
                      padding: '12px 15px', 
                      borderBottom: '1px solid #eee', 
                      cursor: isSelected ? 'not-allowed' : 'pointer', 
                      background: isSelected ? '#f5f5f5' : '#fff',
                      opacity: isSelected ? 0.6 : 1,
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontWeight: '500' }}>{p.label}</span>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {isSelected ? 'Added' : `₹${p.value}`}
                    </span>
                  </li>
                );
              })
            ) : (
              <li style={{ padding: '12px 15px', color: '#999', textAlign: 'center' }}>No matching products</li>
            )}
          </ul>
        )}
      </div>

      <hr className="divider" />

      <h2 className="section-title">Cart</h2>
      <div className="items-list">
        {items.length === 0 && <div className="empty-state">No items added yet. Select from the dropdown above.</div>}
        
        {items.map((item) => (
          <div key={item.id} className="item-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <div className="item-title">{item.name}</div>
              <div className="item-sub">Rate: ₹{item.rate}</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Qty</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.name, e.target.value)}
                  style={{ width: '55px', padding: '6px', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '70px' }}>
                <div className="item-title" style={{ marginBottom: '6px' }}>₹{item.total}</div>
                <button className="btn-remove" onClick={() => removeItem(item.name)} style={{ padding: '4px 8px', fontSize: '12px' }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-card">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row" style={{ alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Discount (
            <input 
              type="number" 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(e.target.value === '' ? 0 : parseFloat(e.target.value))}
              style={{ width: '45px', padding: '4px', margin: '0 6px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
            />
            %):
          </span>
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
