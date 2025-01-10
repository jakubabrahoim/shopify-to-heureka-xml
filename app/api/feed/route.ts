import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShopifyProduct, HeurekaProduct } from '@/lib/types';
import { convertToHeurekaFormat } from '@/lib/convertToHeurekaFormat';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function removeVendorFromItemId(itemId: string): string {
  // ITEM_ID must be max 36 characters long
  const vendors = ['afnan', 'al-wataniah', 'armaf', 'fragrance-world', 'french-avenue', 'aromatix-x-french-avenue', 'hugo-boss', 'khadlaj', 'lattafa', 'paris-corner', 'paris-corner-north-stag', 'rayhaan', 'zimaya'];

  for (const vendor of vendors) {
    if (itemId.startsWith(vendor)) {
      const newItemId = itemId.replace(vendor, '').trim().slice(1);
      console.log(`Removed vendor from title: ${itemId} -> ${newItemId}`);
      return newItemId;
    }
  }

  return '';
}

function generateXML(products: HeurekaProduct[]): string {
  if (!products || products.length === 0) {
    throw new Error('No products available for XML generation');
  }

  const items = products.map(product => `
    <SHOPITEM>
      <ITEM_ID>${escapeXml(removeVendorFromItemId(product.ITEM_ID))}</ITEM_ID>
      <PRODUCTNAME>${escapeXml(product.PRODUCTNAME)}</PRODUCTNAME>
      <DESCRIPTION>${escapeXml(product.DESCRIPTION)}</DESCRIPTION>
      <MANUFACTURER>${escapeXml(product.MANUFACTURER)}</MANUFACTURER>
      <CATEGORYTEXT>
        ${escapeXml(product.CATEGORYTEXT)}
      </CATEGORYTEXT>
      <URL>${escapeXml(product.URL)}</URL>
      <IMGURL>${escapeXml(product.IMGURL)}</IMGURL>
      <PRICE_VAT>${escapeXml(product.PRICE_VAT)}</PRICE_VAT>
      ${Object.entries(product.DELIVERY).map(([key, value]) => `
        <DELIVERY>
          <DELIVERY_ID>${escapeXml(value.DELIVERY_ID)}</DELIVERY_ID>
          <DELIVERY_PRICE>${value.DELIVERY_PRICE}</DELIVERY_PRICE>
        </DELIVERY>
      `).join('')}
      ${product.ITEMGROUP_ID ? `<ITEMGROUP_ID>${escapeXml(product.ITEMGROUP_ID)}</ITEMGROUP_ID>` : ''}
      ${product.PARAM ? product.PARAM.map(param => `
        <PARAM>
          <PARAM_NAME>${escapeXml(param.PARAM_NAME)}</PARAM_NAME>
          <VAL>${escapeXml(param.VAL)}</VAL>
        </PARAM>
      `).join('') : ''}
    </SHOPITEM>
  `).join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<SHOP xmlns="http://www.heureka.sk/ns/offer/1.0">
  ${items}
</SHOP>`;
}

// Store products in memory (note: this will reset on server restart)
let uploadedProducts: ShopifyProduct[] = [];

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Invalid request: products array is required' },
        { status: 400 }
      );
    }

    const baseUrl = 'https://vzorkyparfemov.eu';

    uploadedProducts = products;
    const heurekaProducts = convertToHeurekaFormat(products, baseUrl);
    const xml = generateXML(heurekaProducts);

    return NextResponse.json({ xml });
  } catch (error) {
    console.error('Error processing products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process products' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!uploadedProducts || uploadedProducts.length === 0) {
      return NextResponse.json(
        { error: 'No products have been uploaded yet. Please upload a CSV file first.' },
        { status: 404 }
      );
    }

    const baseUrl = 'https://vzorkyparfemov.eu';
    const heurekaProducts = convertToHeurekaFormat(uploadedProducts, baseUrl);
    const xml = generateXML(heurekaProducts);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating XML feed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate XML feed' },
      { status: 500 }
    );
  }
}