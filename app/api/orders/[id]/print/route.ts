import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { authenticateUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Authenticate admin user
    const user = await authenticateUser(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = params.id;
    console.log('Looking for order with ID:', orderId);
    
    const order = await Order.findById(orderId).lean();
    console.log('Order found:', order ? 'Yes' : 'No');
    console.log('Delivery remarks:', order?.deliveryRemarks || 'No remarks');

    if (!order) {
      console.log('Order not found with ID:', orderId);
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Generate print-friendly HTML for Pakistan delivery
    console.log('Generating print HTML for order:', order.orderNumber);
    const printHtml = generatePakistanDeliveryPrint(order);
    console.log('Print HTML generated successfully');

    return new NextResponse(printHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error generating print document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate print document' },
      { status: 500 }
    );
  }
}

function generatePakistanDeliveryPrint(order: any): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : process.env.NEXTAUTH_URL) || 'https://zauperfumes.com';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Label - ${order.orderNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            background: white;
            padding: 15px;
        }
        
        .print-button {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1000;
            font-size: 12px;
        }
        
        .no-print {
            display: none;
        }
        
        @media print {
            .no-print {
                display: none !important;
            }
            
            body {
                padding: 10px;
                font-size: 10px;
            }
            
            .label-container {
                max-width: none;
                margin: 0;
            }
        }
        
        .label-container {
            max-width: 400px;
            margin: 0 auto;
            border: 3px solid #000;
            padding: 15px;
            background: white;
        }
        
        .header-section {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        
        .company-logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 8px;
            display: block;
        }
        
        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .company-address {
            font-size: 10px;
            color: #333;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .ship-to {
            background: #000;
            color: white;
            padding: 5px 8px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
            display: inline-block;
        }
        
        .from-label {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .address-info {
            font-size: 11px;
            line-height: 1.4;
        }
        
        .address-info div {
            margin-bottom: 2px;
        }
        
        .order-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: 10px;
        }
        
        .detail-label {
            font-weight: bold;
        }
        
        .detail-value {
            font-family: 'Courier New', monospace;
        }
        
        .remarks-section {
            margin-bottom: 15px;
        }
        
        .remarks-label {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .remarks-content {
            font-size: 10px;
            min-height: 20px;
            border: 1px solid #ccc;
            padding: 5px;
            background: #f9f9f9;
        }
        
        .order-number-section {
            text-align: center;
            margin: 15px 0;
        }
        
        .tracking-number {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
        }
        
        .footer {
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 8px;
            margin-top: 10px;
        }
        
        .total-amount {
            background: #f0f0f0;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin: 10px 0;
            border: 2px solid #000;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print Label</button>
    
    <div class="label-container">
        <!-- Header -->
        <div class="header-section">
            <img src="${baseUrl}/ZAU_PERFUMES%20LOGO.png" alt="ZAU Perfumes" class="company-logo" />
            <div class="company-name">ZAU PERFUMES</div>
            <div class="company-address">123 Luxury Perfume Plaza, Karachi, Sindh 75500</div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Ship To -->
            <div>
                <div class="ship-to">SHIP TO:</div>
                <div class="address-info">
                    <div><strong>${order.guestInfo.firstName} ${order.guestInfo.lastName}</strong></div>
                    <div>${order.guestInfo.address}</div>
                    <div>${order.guestInfo.city}, ${order.guestInfo.zipCode}</div>
                    <div>${order.guestInfo.country}</div>
                    <div><strong>Phone:</strong> ${order.guestInfo.phone}</div>
                </div>
            </div>
            
            <!-- From -->
            <div>
                <div class="from-label">FROM:</div>
                <div class="address-info">
                    <div><strong>ZAU Perfumes</strong></div>
                    <div>123 Luxury Perfume Plaza</div>
                    <div>Karachi, Sindh 75500</div>
                    <div>Pakistan</div>
                    <div><strong>Phone:</strong> +92 300 1234567</div>
                </div>
            </div>
        </div>
        
        <!-- Order Details -->
        <div class="order-details">
            <div>
                <div class="detail-row">
                    <span class="detail-label">ORDER ID:</span>
                    <span class="detail-value">${order.orderNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">WEIGHT:</span>
                    <span class="detail-value">${order.items.length * 0.5} KG</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">DIMENSIONS:</span>
                    <span class="detail-value">15cm x 10cm x 8cm</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">SHIPPING DATE:</span>
                    <span class="detail-value">${formatDate(new Date(order.createdAt))}</span>
                </div>
            </div>
            <div>
                <div class="remarks-section">
                    <div class="remarks-label">REMARKS:</div>
                    <div class="remarks-content">
                        ${order.deliveryRemarks || 'NO REMARKS'}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Total Amount -->
        <div class="total-amount">
            COLLECT: PKR ${order.pricing.total.toFixed(2)}
        </div>
        
        <!-- Order Number Section -->
        <div class="order-number-section">
            <div class="tracking-number">ORDER: ${order.orderNumber}</div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div>Thank you for choosing ZAU Perfumes!</div>
            <div>Email: hello@zauperfumes.com.pk | Web: zauperfumes.com</div>
        </div>
    </div>
</body>
</html>
  `;
}