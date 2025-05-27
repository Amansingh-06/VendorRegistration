// vendorConfig.js

export const BUCKET_NAMES = {
    VIDEO: 'videos',
    BANNER: 'banners',
    PAYMENT: 'payments-qr'
};

export const DEFAULTS = {
    NOTE: 'NA',
    TIME: 'NA',
    VIDEO_URL: 'NA',
    BANNER_URL: 'NA'
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

export const SUPABASE_TABLES = {
    TABLE: 'shops'
};

export const TOAST_MESSAGES = {
    UPLOAD_ERROR: 'Error uploading file',
    PUBLIC_URL_ERROR: 'Error getting public URL',
    REGISTER_SUCCESS: 'User registered successfully',
    REGISTER_FAILED: 'Failed to register vendor',
    UNEXPECTED_ERROR: 'Something went wrong'
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
  