export interface ShopifyProduct {
  Handle: string;
  Title: string;
  'Body (HTML)': string;
  Vendor: string;
  Type: string;
  Tags: string;
  Published: boolean;
  'Option1 Name': string;
  'Option1 Value': string;
  'Variant SKU': string;
  'Variant Grams': number;
  'Variant Inventory Qty': number;
  'Variant Price': string;
  'Image Src': string;
  Status: string;
}

export interface HeurekaProduct {
  ITEM_ID: string;
  PRODUCTNAME: string;
  DESCRIPTION: string;
  MANUFACTURER: string;
  CATEGORYTEXT: {
    CATEGORY_ID: number;
    CATEGORY_NAME: string;
    CATEGORY_FULLNAME: string;
  };
  URL: string;
  IMGURL: string;
  PRICE_VAT: string;
  DELIVERY_DATE: number;
  DELIVERY: {
    [key: number]: {
      DELIVERY_ID: string;
      DELIVERY_PRICE: number;
    };
  };
  ITEMGROUP_ID?: string;
  PARAM?: Array<{
    PARAM_NAME: string;
    VAL: string;
  }>;
}

declare global {
  var uploadedProducts: ShopifyProduct[];
}