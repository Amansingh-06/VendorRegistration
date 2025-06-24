// vendorConfig.js

export const BUCKET_NAMES = {
    VIDEO: 'videos',
    BANNER: 'banners',
    PAYMENT: 'payments-qr',
    ITEM_IMG:'items'
};

export const DEFAULTS = {
    NOTE: 'NA',
    TIME: "00:00:00",
    VIDEO_URL: 'NA',
    BANNER_URL: './defaultuserImage.jpg'
};

export const FORM_FIELDS = {
    NAME: 'name',
    SHOP_NAME: 'shopName',
    STREET: 'street',
    CITY: 'city',
    STATE: 'state',
    PINCODE: 'pincode',
    CUISINES: 'cuisines',
    NOTE: 'note'
};

export const truncateLetters = (text, charLimit = 30) => {
    if (!text) return '';
    return text.length > charLimit ? text.slice(0, charLimit) + '...' : text;
};
  
  
  


export const VENDOR_DATA_KEYS = {
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
    U_ID:'u_id'
};

export const SELECTED_COLUMN = {
    ALL:"*"
}

export const ORDER_STATUS = {
    PENDING: "pending",
    ACCEPT_LABLE: "Accept Order",
    ACCEPTED: "accepted",
    PREPARING_LABEL: "Start Preparing",
    PREPARED_LABEL: "Mark as Prepared",
    PREPARED: "prepared",
    PREPARING: "preparing",
    ON_THE_WAY: "on the way",
    ACCEPTED_COLOR: 'bg-blue-500',
    PREPARED_COLOR: 'bg-green-500',
    PREPARING_COLOR: 'bg-yellow-500'

}
  

export const SUPABASE_TABLES = {
    VENDOR: 'vendor_request',
    ITEM_CATEGORY_BY_VENDOR: 'category_created_by_vendor',
    ITEM: 'item',
    ITEM_CATEGORY: "item_category",
    ORDERS:'orders'
};
export const ITEM_CATEGORY_FIELD = {
    C_ID: "c_id",
    NAME:"name"
}

export const TOAST_MESSAGES = {
  
};

export const TIME_CLOCK_CONFIG = {
    TITLE: 'Set Time',
    SELECTED_TIME_LABEL: 'Selected Time:',
    SET_BUTTON_LABEL: 'Set Time',
    AM: 'AM',
    PM: 'PM',
    CLOCK_DIMENSIONS: {
        WIDTH: '300px',
        HEIGHT: '300px',
    },
    MODAL_STYLE: {
        MAX_WIDTH: 'max-w-md',
        SMALL_WIDTH: 'sm:max-w-sm',
    },
    CLOSE_BUTTON: {
        LABEL: '×',
        CLASSNAME: 'absolute top-2 right-4 text-3xl text-gray-500 hover:text-black',
    },
};
  

export const TIME_FORMAT = 'hh:mm A';
  



export const MESSAGES = {
    FETCH_FAIL: 'Failed to fetch categories',
    EMPTY_CATEGORY: "Category can't be empty",
    CATEGORY_EXISTS: 'Category already exists',
    CATEGORY_ADDED: 'Category added successfully',
    CATEGORY_ADD_FAIL: 'Failed to add category',
    CHECK_FAIL: 'Error checking category',
    FORM_SUCCESS: 'Item submitted successfully!',
    UPLOAD_ERROR: 'Error uploading file',
    PUBLIC_URL_ERROR: 'Error getting public URL',
    REGISTER_SUCCESS: 'User registered successfully',
    REGISTER_FAILED: 'Failed to register vendor',
    UNEXPECTED_ERROR: 'Something went wrong',
    ITEM_CATEGORY_EXISTS: 'Item category already exists',
    ITEM_REGISTER_SUCCESS: 'Item registered successfully',
    ITEM_INSERT_FAILED: 'Failed to insert item',
    SESSION_NOT_UPDATED:'"User session not updated with registration info"'
};

  
export const formatToCapital = (text) => text.trim().toUpperCase();

//ORDER FILTER BUTTON
export const FILTER_BUTTON = {
    ALL: "All",
    ACCEPTED: "Accepted",
    PREPARED: "Prepared",
    PREPARING: "Preparing",
    ON_THE_WAY: "On The Way",
    DELIVERED: "Delivered",
    COLOR:"bg-green"
}

//BOTTOM NAV(FOOTER)

import { FiClipboard, FiShoppingCart, FiUser } from "react-icons/fi";
import { PiMoneyWavyDuotone } from "react-icons/pi"
export const navItems = [
    { id: "Home", icon: FiClipboard, label: "Home", path: "/home" },
    { id: "Manage Items", icon: FiShoppingCart, label: "Manage Items", path: "/manage-items" },
    { id: "Earning", icon: PiMoneyWavyDuotone, label: "Earning", path: "/earning" },
    { id: "Profile", icon: FiUser, label: "Profile", path: "/profile" }
];



// ITEM Field keys
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

// ITEM Default values
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
  