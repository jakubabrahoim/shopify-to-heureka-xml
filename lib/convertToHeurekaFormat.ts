import { ShopifyProduct, HeurekaProduct } from './types';

function stripHtml(html: string): string {
  if (!html) {
    return '';
  }

  const stripped = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  return stripped;
}

function sanitizePrice(price: string): string {
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice)) {
    throw new Error('Invalid price format');
  }
  return numericPrice.toFixed(2);
}

function getDeliveryDate(inventoryQty: number): number {
  return inventoryQty > 0 ? 0 : 7; // 0 = in stock, 7 = ships within 7 days
}

// function getDeliveryStatus(inventoryQty: number): string {
//   return '';
// }

export function convertToHeurekaFormat(
  products: ShopifyProduct[],
  baseUrl: string
): HeurekaProduct[] {
  if (!products || products.length === 0) {
    throw new Error('No products provided for conversion');
  }

  if (!baseUrl) {
    throw new Error('Base URL is required for product URLs');
  }

  return products
    .filter((product) => product.Published && product.Status === 'active')
    .map((product, index) => {
      try {
        const variantId = product['Variant SKU'] || product.Handle;
        if (!variantId) {
          throw new Error(`Product at index ${index} has no SKU or handle`);
        }

        const price = sanitizePrice(product['Variant Price']);

        const heurekaProduct: HeurekaProduct = {
          ITEM_ID: variantId,
          PRODUCTNAME: `${product.Title} ${product['Option1 Value']}`.trim(),
          DESCRIPTION: stripHtml(product['Body (HTML)']),
          MANUFACTURER: product.Vendor || 'Unknown',
          CATEGORYTEXT: {
            CATEGORY_ID: 1652,
            CATEGORY_NAME: 'Parfumy',
            CATEGORY_FULLNAME: 'Heureka.sk | Kozmetika a parfumy | Parfumy'
          },
          URL: `${baseUrl}/products/${product.Handle}`,
          IMGURL: product['Image Src'] || '',
          PRICE_VAT: price,
          DELIVERY_DATE: getDeliveryDate(Number(product['Variant Inventory Qty'])),
          DELIVERY: {
            1: {
              DELIVERY_ID: 'PACKETA',
              DELIVERY_PRICE: 3.5
            },
            2: {
              DELIVERY_ID: 'PACKETA_DOMOV',
              DELIVERY_PRICE: 5
            }
          },
        };

        if (product['Option1 Name']) {
          heurekaProduct.ITEMGROUP_ID = product.Handle;
          heurekaProduct.PARAM = [
            {
              PARAM_NAME: product['Option1 Name'],
              VAL: product['Option1 Value']
            }
          ];
        }

        return heurekaProduct;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Failed to convert product "${product.Title}": ${error.message}`);
        }
        throw new Error(`Failed to convert product "${product.Title}": Unknown error`);
      }
    });
}