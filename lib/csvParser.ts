import { parse } from 'csv-parse';
import { ShopifyProduct } from './types';

const REQUIRED_HEADERS = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Variant SKU',
  'Variant Grams',
  'Variant Inventory Qty',
  'Variant Price',
  'Image Src',
  'Status'
];

export async function parseCSV(file: File): Promise<ShopifyProduct[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      
      parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (error, output) => {
        if (error) {
          reject(new Error('Failed to parse CSV file. Please ensure it\'s a valid Shopify products export file.'));
          return;
        }

        // Check if file is empty
        if (!output || output.length === 0) {
          reject(new Error('The CSV file appears to be empty.'));
          return;
        }

        // Validate headers
        const headers = Object.keys(output[0]);
        const missingHeaders = REQUIRED_HEADERS.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}. Please ensure you're using a Shopify products export file.`));
          return;
        }

        resolve(output as ShopifyProduct[]);
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file. Please try again.'));
    };
    
    reader.readAsText(file);
  });
}