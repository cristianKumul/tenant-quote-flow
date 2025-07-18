import jsPDF from 'jspdf';
import { Quote, Customer } from '../types';
import { formatCurrency } from './currency';

export const generateQuotePDF = (quote: Quote, customer?: Customer) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', 20, 30);
  
  // Quote details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote Number: ${quote.quoteNumber}`, 20, 50);
  doc.text(`Date: ${quote.createdAt.toLocaleDateString()}`, 20, 60);
  doc.text(`Status: ${quote.status}`, 20, 70);
  
  // Customer information
  if (customer || quote.customerName) {
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, 90);
    doc.setFont('helvetica', 'normal');
    
    let yPos = 100;
    if (customer) {
      doc.text(customer.name, 20, yPos);
      if (customer.company) {
        yPos += 10;
        doc.text(customer.company, 20, yPos);
      }
      if (customer.email) {
        yPos += 10;
        doc.text(customer.email, 20, yPos);
      }
      if (customer.address) {
        yPos += 10;
        doc.text(customer.address, 20, yPos);
      }
    } else {
      doc.text(quote.customerName || 'Anonymous Customer', 20, yPos);
    }
  }
  
  // Items table header
  const tableStartY = customer || quote.customerName ? 140 : 100;
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 20, tableStartY);
  doc.text('QTY', 100, tableStartY);
  doc.text('UNIT PRICE', 130, tableStartY);
  doc.text('TOTAL', 170, tableStartY);
  
  // Draw line under header
  doc.line(20, tableStartY + 5, 190, tableStartY + 5);
  
  // Items
  doc.setFont('helvetica', 'normal');
  let currentY = tableStartY + 15;
  
  quote.items.forEach((item) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 30;
    }
    
    doc.text(item.productName, 20, currentY);
    doc.text(item.description, 20, currentY + 8);
    doc.text(item.quantity.toString(), 100, currentY);
    doc.text(formatCurrency(item.unitPrice), 130, currentY);
    doc.text(formatCurrency(item.totalPrice), 170, currentY);
    
    currentY += 20;
  });
  
  // Totals
  currentY += 10;
  doc.line(130, currentY, 190, currentY);
  currentY += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('SUBTOTAL:', 130, currentY);
  doc.text(formatCurrency(quote.subtotal), 170, currentY);
  
  currentY += 10;
  doc.text('TOTAL:', 130, currentY);
  doc.text(formatCurrency(quote.total), 170, currentY);
  
  // Notes
  if (quote.notes) {
    currentY += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    
    // Split notes into lines if too long
    const splitNotes = doc.splitTextToSize(quote.notes, 170);
    doc.text(splitNotes, 20, currentY + 10);
  }
  
  // Save the PDF
  doc.save(`quote-${quote.quoteNumber}.pdf`);
};