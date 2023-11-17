export const authFieldsErrors = {
    email: [
        { type: 'required', message: 'Enter email address' },
        { type: 'pattern', message: 'Please enter a valid email address' }
    ],
    password: [
        { type: 'required', message: 'Enter password' },
        { type: 'minlength', message: 'Password cannot be less than 8 characters' }
    ],
    confirmPassword: [
        { type: 'misMatch', message: 'Password & confirm password didn\'t match' }]
};
export const categoryFormErrors = {
    name: [
        { type: 'required', message: 'name' },
    ],
    image: [
        { type: 'required', message: 'image' }
    ],
    parentId: [
        { type: 'required', message: 'parentId' }
    ]
}
export const subCategoryFormErrors = {
    name: [
        { type: 'required', message: 'name' },
    ],
    image: [
        { type: 'required', message: 'image' }
    ],
    parentId: [
        { type: 'required', message: 'parentId' }
    ]
}
export const productFormErrors = {
    name: [
        { type: 'required', message: 'name' },
    ],
    displayName: [
        { type: 'required', message: 'displayName' },
        { type: 'maxlength', message: 'displayNameMax' },
    ],
    categoryId: [
        { type: 'required', message: 'categoryId' },
    ],
    subCategoryId: [
        { type: 'required', message: 'subCategoryId' }
    ],
    brandName: [
        { type: 'required', message: 'brandName' },
    ],
    description: [
        { type: 'required', message: 'description' },
    ],
    origin: [
        { type: 'required', message: 'origin' },
    ],
    productType: [
        { type: 'required', message: 'productType' },
    ],
    image: [
        { type: 'required', message: 'image' },
    ],
    unitId: [
        { type: 'required', message: 'unitId' },
    ],
    quantity: [
        { type: 'required', message: 'quantity' },
    ],
    packagingId: [
        { type: 'required', message: 'packagingId' }
    ],
    price: [
        { type: 'required', message: 'price' },
        { type: 'pattern', message: 'pricePattern' },
    ],
    discountedPrice: [
        { type: 'required', message: 'discountedPrice' },
        { type: 'pattern', message: 'discountedPricePattern' },

    ],
};
export const productTypeForm = {
    name: [
        { type: 'required', message: 'Enter product type name' },
    ]
}
export const restaurantFormErrors = {
    name: [
        { type: 'required', message: 'Please select a restaurant' },
    ],
    creditLimit: [
        { type: 'required', message: 'Please enter the credit limit' },
    ],
    creditPeriod: [
        { type: 'required', message: 'Please enter the credit period' },
    ],
};
export const ticketFormErrors = {
    subject: [
        { type: 'required', message: 'subject' },
        { type: 'maxlength', message: 'subjectMax' }
    ],
    description: [
        { type: 'required', message: 'description' },
        { type: 'maxlength', message: 'descriptionMax' }
    ]
};

export const marketingErrors = {
    subject: [
        { type: 'required', message: 'subject' }
    ],
    name: [
        { type: 'required', message: 'name' }
    ],
    code: [
        { type: 'required', message: 'code' }
    ],
    description: [
        { type: 'required', message: 'description' },
        { type: 'maxlength', message: 'descriptionMax' }
    ],
    startDate: [
        { type: 'required', message: 'startDate' },
    ],
    endDate: [
        { type: 'required', message: 'endDate' },
    ],
    image: [
        { type: 'required', message: 'image' },
    ],
    maximumDiscount: [
        { type: 'required', message: 'maximumDiscount' },
    ],
    discountInPercentage: [
        { type: 'required', message: 'discountInPercent' },
    ],
    restaurants: [
        { type: 'required', message: 'restaurants' },
        { type: 'minlength', message: 'restaurantsMin' }
    ],
    reason: [
        { type: 'required', message: 'reason' },
    ]
};

export const profileFromErrors = {
    name: [
        { type: 'required', message: 'name' }
    ],
    email: [
        { type: 'required', message: 'email' },
        { type: 'pattern', message: 'emailPattern' },
        { type: 'email', message: 'emailValid' }
    ],
    currentPassword: [
        { type: 'required', message: 'currentPassword' },
        { type: 'minlength', message: 'currentPasswordMin' }
    ],
    staffPin: [
        { type: 'required', message: 'staffPin' },
    ],
    password: [
        { type: 'required', message: 'password' },
        { type: 'minlength', message: 'passwordMin' }
    ],
    confirmPassword: [
        { type: 'required', message: 'confirmPassword' },
        { type: 'misMatch', message: 'confirmPasswordMis' }
    ],
    role: [
        { type: 'required', message: 'role' }
    ],
    firstName: [
        { type: 'required', message: 'firstName' }
    ],
    lastName: [
        { type: 'required', message: 'lastName' }
    ],
    mobileNumber: [
        { type: 'required', message: 'mobileNumber' },
        { type: 'maxlength', message: 'mobileNumberMax' },
        { type: 'minlength', message: 'mobileNumberMin' }
    ],
    officePhoneNumber: [
        { type: 'required', message: 'officePhoneNumber' },
        { type: 'maxlength', message: 'officePhoneNumberMax' },
        { type: 'minlength', message: 'officePhoneNumberMin' }
    ],
    mobileCode: [
        { type: 'required', message: 'mobileCode' }
    ],
    officePhoneCountryCode: [
        { type: 'required', message: 'officePhoneCountryCode' }
    ],
    unitNo: [
        { type: 'required', message: 'unitNo' }
    ],
    floorNo: [
        { type: 'required', message: 'floorNo' }
    ],
    street: [
        { type: 'required', message: 'street' }
    ],
    area: [
        { type: 'required', message: 'area' }
    ],
    location: [
        { type: 'required', message: 'location' }
    ],
    locationPoint: [
        { type: 'required', message: 'locationPoint' }
    ],
    city: [
        { type: 'required', message: 'city' }
    ],
    countryName: [
        { type: 'required', message: 'countryName' }
    ],
    country: [
        { type: 'required', message: 'country' }
    ],
    contactPerson: [
        { type: 'required', message: 'contactPerson' },
        { type: 'minlength', message: 'contactPersonMin' }
    ],
    media: [
        { type: 'required', message: ' media' },
        { type: 'minlength', message: 'mediaMin' }
    ],
    deliveryLocation: [
        { type: 'required', message: 'deliveryLocation' },
        { type: 'minlength', message: 'deliveryLocationMin' }
    ],
    commission: [
        { type: 'required', message: 'commission' }
    ],
    designation: [
        { type: 'required', message: 'designation' }
    ],
    companyId: [
        { type: 'required', message: 'companyId' }
    ],
    language: [
        { type: 'required', message: 'language' }
    ],
    minOrder: [{ type: 'required', message: 'minOrder' }],
    workStartTime: [],
    workEndTime: [],
}
export const specialPriceErrors = {
    restaurantId: [
        { type: 'required', message: 'Please select restaurant name' }
    ],
    productId: [
        { type: 'required', message: 'Please select product' }
    ],
    specialPrice: [
        { type: 'required', message: 'Enter discount price' }
    ],
}

export const faqFormError = {
    question: [
        { type: 'required', message: 'Please enter the question' }
    ],
    answer: [
        { type: 'required', message: 'Please enter the answer' }
    ]
}
export const OPTIONS = {
    emailPattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[A-Za-z]{2,20}$',
    imageType: 'Please upload the file in jpeg, png format',
    excelType: 'Please upload the file in .csv, .xlsx format',
    documentType: 'Please upload the file in jpeg, png and pdf format',
    sizeLimit: 'Please upload the file that is less then 5mb',
    dimension: "Image dimension",
    maxLimit: 5
};

export const confirmMessages = {
    deleteTitle: 'Delete ',
    deleteDescription: 'Are you sure you want to delete',
    hideTitle: 'Request',
    hideDescription: 'Are you sure you want to ',
    stockTitle: 'Stock request',
    stockDescription: 'Are you sure you want to make this product ',
    updateTitle: 'Update ',
    updateDescription: 'Are you sure you want to update',

    crossButton: 'assets/icons/x-button.svg',
    blockButton: 'assets/icons/block-button.png',
    checkButton: 'assets/icons/check-tick.svg'
}

export const languages = ['English'];

export const creditValues = {
    period: [
        '10', '15', '20', '30', '45', '60'
    ],
    limit: [
        5000, 10000, 15000, 30000
    ]
}
export const monthsName = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
]

export const coordinates = {
    latitude: 29.2985,
    longitude: 42.5510
};
/** user roles */
export const userRoles = [
    { role: 'SYSTEM_USER', displayRole: 'System User', title:'systemUser'},
    { role: 'SYSTEM_OWNER', displayRole: 'System Admin' ,title:'systemAdmin'},
    { role: 'SYSTEM_MANAGER', displayRole: 'System Manager', title:'systemManager' }
];
export const onBoardingRoles = [
    { role: 'RESTAURANT_SUPER_ADMIN', displayRole: 'company',title:'' },
    { role: 'RESTAURANT_ADMIN', displayRole: 'restaurant', title: '' },
    { role: 'SUPPLIER', displayRole: 'supplier', title: '' }
];
export const restaurantRoles = [
    { displayRole: "User", role: "RESTAURANT_USER" },
    { displayRole: "Kitchen User", role: "RESTAURANT_KITCHEN_USER" },
    { displayRole: "Sub Kitchen User", role: "RESTAURANT_SUB_KITCHEN_USER" },
]
export const defaultStatus = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    APPROVED: "approved",
    UNAPPROVED: "unapproved",
    PENDING: "pending",
    DELETED: "deleted",
    REJECTED: "rejected",
};
/**
 * Payment status
 */
export const orderStatus = {
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    COMPLETE: 'complete',
    CANCELED: 'canceled',
    CLOSED: 'closed'
};
/* Order status */
export const deliveryStatus = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    DISPATCHED: 'dispatched',
    DELIVERED: 'delivered',
    COMPLETE: 'completed',
    REJECTED: 'rejected',
    RETURNED: 'returned',
    CLOSED: 'closed',
    PARTIALLY: 'partially',
    ACKNOWLEDGED: 'acknowledged',
    ACKNOWLEDGE: 'acknowledge'
};
/* ticket status */
export const ticketStatus = {
    CLOSED: 'closed',
    OPEN: 'open',
    IN_PROGRESS: 'inprogress',
};
/* Payment modes */
export const paymentModes = {
    CREDIT: 'credit',
    CASH: 'cash',
    CARD: 'card',
    WALLET: 'wallet'
};
export const permissionList = [
    "report", "payment", "request", "place_order", "market_list"
]
export const currency = {
    UAE: 'AED',
    SA: 'SR',
    KW:'KWD'
}
export const TAX = {
    UAE: 5,
    SA: 15,
    KW:0
}