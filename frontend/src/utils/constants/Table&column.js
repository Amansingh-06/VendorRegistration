export const SUPABASE_TABLES = {
    ORDERS: "orders",
    ORDER_ITEM: "order_item",
    USERS: "user",
    TRANSACTIONS: "transaction",
    VENDOR: "vendor_request",
    ITEM_CATEGORY_BY_VENDOR: "category_created_by_vendor",
    ITEM: "item",
    ITEM_CATEGORY: "item_category",
    ADMIN_LOGS:'admin_logs'
}

export const ITEM_CATEGORY_FIELD = {
    C_ID: "c_id",
    NAME:"name"
}

export const ITEM_CATEGORY_BY_VENDOR_FIELD = {
    TITLE: 'title',
    VENDOR_ID: 'vendor_id',
    CAT_ID:'cat_id',
}

export const VENDOR_FIELD = {
        VENDOR_NAME: 'v_name',
    SHOP_NAME: 'shop_name',
    STREET: 'street',
    CITY: 'city',
    STATE: 'state',
    PINCODE: 'pincode',
    SHIFT1_START: 'shift1_opening_time',
    SHIFT1_CLOSE: 'shift1_closing_time',
    SHIFT2_START: 'shift2_opening_time',
    SHIFT2_CLOSE: 'shift2_closing_time',
    CUISINES: 'categories_available',
    VIDEO_URL: 'video_url',
    BANNER_URL: 'banner_url',
    PAYMENT_QR_URL: 'payment_url',
    NOTE: 'note_from_vendor',
    V_ID: "v_id",
    U_ID: 'u_id',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    MOBILE_NO:'mobile_number'
}

export const BUCKET_NAMES = {
    VIDEO: "videos",
    BANNER: "banners",
    PAYMENT: "payments-qr",
    ITEM_IMG:'items'
}

export const REGISTRATION_INPUT = {
      NAME: 'name',
    SHOP_NAME: 'shopName',
    STREET: 'street',
    CITY: 'city',
    STATE: 'state',
    PINCODE: 'pincode',
    CUISINES: 'cuisines',
    NOTE: 'note',
    STARTTIME1: 'startTime1',
    STARTTIME2:'startTime2',
    ENDTIME1: 'endTime1',
    ENDTIME2:'endTime2'
}

export const SELECTED_COLUMN = {
    ALL:"*"
}

export const ITEM_FIELDS = {
    ID: "item_id",
    NAME: "item_name",
    CUISINE: "item_cuisine",
    QUANTITY: "item_quantity",
    PRICE: "item_price",
    PREP_TIME: "prep_time",
    VEG: "veg",
    CATEGORY: "item_category",
    IMG_URL: "img_url",
    VENDOR_ID: "vendor_id",
    IS_DELETED:"is_deleted"
};
export const ITEM_DEFAULTS = {
    NAME: "NA",
    CUISINE: "NA",
    QUANTITY: "NA",
    PRICE: -1,
    PREP_TIME: -1,
    VEG: false,
    CATEGORY: "NA",
    IMG_URL: "NA",
};


