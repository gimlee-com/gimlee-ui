import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  "en-US": {
    translation: {
      "common": {
        "loading": "Loading...",
        "save": "Save",
        "cancel": "Cancel",
        "ok": "OK",
        "edit": "Edit",
        "view": "View",
        "delete": "Delete",
        "actions": "Actions",
        "status": "Status",
        "confirmations": "Confirmations",
        "memo": "Memo",
        "undo": "Undo",
        "redo": "Redo",
        "rotate": "Rotate",
        "editing": "Editing",
        "search": "Search",
        "reset": "Reset",
        "increment": "Increment",
        "decrement": "Decrement",
        "externalLinkWarning": "You are leaving Gimlee. We are not responsible for the content of external websites. Do you want to proceed?",
        "retry": "Retry"
      },
      "navbar": {
        "browseAds": "Browse Ads",
        "myAds": "Sales",
        "purchases": "Purchases",
        "profile": "Profile",
        "logout": "Logout",
        "login": "Login",
        "register": "Register",
        "theme": "Theme",
        "terms": "Terms of Service",
        "watchlist": "Watchlist",
        "admin": "Admin Panel",
        "about": "About",
        "contact": "Contact",
        "faq": "FAQ",
        "country": "Country",
        "selectCountry": "Select country"
      },
      "home": {
        "featuredAds": "Featured Ads",
        "disclaimer": {
          "title": "Experimental Application",
          "message": "Gimlee is currently in an experimental, work-in-progress phase. All transactions use testnet currencies (YCash and PirateChain) with mocked mining."
        }
      },
      "auth": {
        "loginTitle": "Login",
        "registerTitle": "Register",
        "username": "Username",
        "password": "Password",
        "confirmPassword": "Confirm Password",
        "email": "Email",
        "loggingIn": "Logging in...",
        "registering": "Registering...",
        "noAccount": "Don't have an account?",
        "termsAcknowledgment": "By registering, you agree to our <1>Terms of Service</1>.",
        "hasAccount": "Already have an account?",
        "loginRequired": "Almost there! Please log in to access the requested page. New to Gimlee? <1>Register here</1>.",
        "registrationSuccess": "Your account has been registered and the confirmation code was sent to email {{email}}. Please log in to complete registration.",
        "verifyTitle": "Verify Your Account",
        "verifyText": "Please enter the verification code sent to your email.",
        "verifyPlaceholder": "Verification code",
        "verifyButton": "Verify",
        "verifying": "Verifying...",
        "errors": {
          "loginFailed": "Login failed. Please check your credentials.",
          "generic": "An error occurred.",
          "required": "{{field}} is required",
          "minLength": "Must be at least {{count}} characters",
          "invalidEmail": "Please enter a valid email address",
          "passwordRequirements": "Password must be 8-64 characters and include at least one uppercase letter, one lowercase letter, and one digit",
          "passwordsDoNotMatch": "Passwords do not match",
          "usernameTaken": "Username is already taken",
          "emailTaken": "Email is already taken"
        },
        "countryOfResidence": "Country of Residence",
        "countryHint": "Detected from your location. You can change it.",
        "changePassword": {
          "title": "Change Password",
          "oldPassword": "Current Password",
          "newPassword": "New Password",
          "confirmPassword": "Confirm New Password",
          "submit": "Change Password",
          "success": "Password changed successfully.",
          "error": "Failed to change password. Please try again."
        }
      },
      "ads": {
        "browseTitle": "Browse Ads",
        "searchPlaceholder": "Search ads...",
        "noAdsFound": "No ads found matching your search.",
        "myAdsTitle": "My Ads",
        "createNew": "Create New Ad",
        "noAdsYet": "You have no ads yet.",
        "activate": "Activate",
        "deactivate": "Deactivate",
        "filters": "Filters",
        "advancedFilters": "Advanced Filters",
        "sorting": "Sorting",
        "sort": {
          "date": "Date",
          "price": "Price",
          "desc": "Descending",
          "asc": "Ascending"
        },
        "priceRange": "Price Range",
        "minPrice": "Min",
        "maxPrice": "Max",
        "applyFilters": "Apply Filters",
        "price": "Price",
        "title": "Title",
        "description": "Description",
        "location": "Location",
        "noDescription": "No description provided.",
        "noImages": "No images available",
        "editTitle": "Edit Ad",
        "enterTitlePrompt": "Enter a title for your new ad:",
        "city": "City",
        "cityPlaceholder": "Search for a city...",
        "category": "Category",
        "selectCategory": "Select Category",
        "changeCategory": "Change Category",
        "categorySearchPlaceholder": "Search categories...",
        "allIn": "All in {{category}}",
        "currency": "Currency",
        "media": "Media",
        "stock": "Stock",
        "uploadText": "Drag and drop files here or ",
        "selectFiles": "select them",
        "uploadFile": "Upload File",
        "takePhoto": "Take Photo",
        "saving": "Saving...",
        "failedToCreate": "Failed to create ad",
        "failedToActivate": "Failed to activate ad",
        "failedToDeactivate": "Failed to deactivate ad",
        "notFound": "Ad not found.",
        "mainPhoto": "Main Photo",
        "setAsMain": "Set as main",
        "status": {
          "sold": "Sold",
          "new": "New",
          "outOfStock": "Out of Stock"
        },
        "conditions": {
          "NEW": "New",
          "LIKE_NEW": "Like New",
          "GOOD": "Good",
          "FAIR": "Fair"
        },
        "onlyLeft": "Only {{count}} left!",
        "notEligibleTitle": "Action Required",
        "notEligibleMessage": "To activate your ad, you must first register a viewing key for at least one supported cryptocurrency. This allows the platform to verify payments securely without holding your funds.",
        "goToProfile": "Go to Profile Settings",
        "generalInfo": "General Information",
        "classificationLocation": "Classification & Location",
        "pricingStock": "Pricing & Stock",
        "titleGuidance": "Enter a clear, descriptive title to help buyers find your item.",
        "descriptionGuidance": "Describe your item in detail. Supports Markdown (bold, lists, links).",
        "priceGuidance": "Set a fair price for your item.",
        "stockGuidance": "How many items do you have available?",
        "imageProhibited": "External images are prohibited",
        "editPhoto": "Edit Photo",
        "aspectRatio": "Aspect Ratio",
        "zoom": "Zoom",
        "markdown": {
          "bold": "Bold",
          "italic": "Italic",
          "heading": "Heading",
          "link": "Link",
          "image": "Insert Image",
          "linkPrompt": "Enter URL:",
          "linkPlaceholder": "https://..."
        }
      },
      "sales": {
        "title": "Sales",
        "myAds": "My Ads",
        "myOrders": "My Sales",
        "orders": "Orders",
        "noOrders": "You have no sales yet.",
        "orderId": "Order ID",
        "buyer": "Buyer",
        "total": "Total",
        "date": "Date",
        "adStats": {
          "title": "Visit Statistics",
          "daily": "Today",
          "monthly": "This Month",
          "yearly": "This Year",
          "total": "All Time"
        }
      },
      "purchases": {
        "title": "Purchases",
        "myPurchases": "My Purchases",
        "noPurchases": "You have no purchases yet.",
        "seller": "Seller",
        "buyNow": "Buy Now",
        "quantity": "Quantity",
        "paymentTitle": "Complete Payment",
        "sendAmount": "Please send exactly",
        "toAddress": "to the following address",
        "memo": "Memo (required)",
        "statusAwaiting": "Awaiting payment...",
        "statusComplete": "Payment complete!",
        "statusFailedTimeout": "Payment timed out.",
        "statusFailedUnderpaid": "Payment underpaid.",
        "statusCancelled": "Purchase cancelled.",
        "cancelPurchase": "Cancel Purchase",
        "confirmCancel": "Are you sure you want to cancel this purchase?",
        "partialPaymentWarning": "Warning: You have already paid {{paid}}. Cancelling this purchase will result in permanent loss of these funds. Are you sure you want to proceed?",
        "volatilityWarning": "The price in {{currency}} is an estimate and may not be accurate due to market volatility.",
        "close": "Close",
        "timeLeft": "Time left: {{time}}",
        "paymentProgress": "Payment progress: {{paid}} / {{total}}",
        "storedPurchaseFound": "You have an active purchase. Click here to view it.",
        "pendingPurchaseExists": "You already have a pending purchase. Please complete it before starting a new one.",
        "items": "Items",
        "paymentInstructions": "Payment is currently being processed.",
        "viewPaymentInfo": "View Payment Info",
        "currencyFrozen": "This payment method is temporarily unavailable due to market volatility. Try another payment method.",
        "currencyNotAccepted": "This ad does not accept payment in {{currency}}.",
        "priceMismatch": "The price has changed since you loaded this page. Please review the updated prices and try again.",
        "insufficientStock": "Only {{count}} items available.",
        "selectAddress": "Select Delivery Address",
        "noAddressesForCountry": "You don't have any delivery addresses for your country.",
        "addAddress": "Add Delivery Address",
        "confirmAndPay": "Confirm & Pay",
        "deliveryTo": "Delivery to",
        "stepOf": "Step {{current}} of {{total}}",
        "addressCountryMismatch": "This address doesn't match your country of residence.",
        "countryOfResidenceRequired": "Please set your country of residence before purchasing.",
        "loadAddressesError": "Failed to load delivery addresses. Please try again."
      },
      "profile": {
        "title": "Profile & Settings",
        "regionalSettings": "Regional Settings",
        "language": "Language",
        "sellingAndPayments": "Selling & Payments",
        "paymentMonitoring": "Pirate Chain",
        "paymentMonitoringYec": "YCash",
        "paymentDesc": "To enable trustless payment verification and activate your ads, please provide your Pirate Chain Viewing Key (z-view key). This allows the platform to confirm when a buyer has paid you.",
        "paymentDescYec": "To enable trustless payment verification and activate your ads, please provide your YCash Viewing Key (z-view key). This allows the platform to confirm when a buyer has paid you.",
        "viewKeyPlaceholder": "Enter your zxview... key",
        "saveKey": "Save Key",
        "recentTransactions": "Recent Pirate Chain Transactions",
        "recentTransactionsYec": "Recent YCash Transactions",
        "showTransactions": "Show Recent Transactions",
        "hideTransactions": "Hide Recent Transactions",
        "noTransactions": "No transactions found.",
        "keyUpdated": "Viewing key updated successfully.",
        "preferencesUpdated": "Preferences updated successfully.",
        "failedToSaveLanguage": "Failed to save language preference.",
        "preferredCurrency": "Preferred Currency",
        "searchCurrency": "Search for a currency...",
        "failedToSaveCurrency": "Failed to save preferred currency.",
        "countryOfResidence": "Country of Residence",
        "searchCountry": "Search for a country...",
        "failedToSaveCountry": "Failed to save country of residence.",
        "theme": "Theme",
        "themes": {
          "light": "Light",
          "dark": "Dark",
          "dark-unicorn": "Dark Unicorn",
          "iron-age": "Iron Age"
        },
        "avatar": {
          "title": "Profile Photo",
          "change": "Change Avatar",
          "upload": "Upload",
          "uploadSuccess": "Avatar updated successfully.",
          "uploadError": "Failed to update avatar."
        },
        "deliveryAddresses": {
          "title": "Delivery Addresses",
          "addAddress": "Add Address",
          "name": "Address Label",
          "namePlaceholder": "e.g. Home, Office…",
          "fullName": "Full Name",
          "street": "Street Address",
          "city": "City",
          "postalCode": "Postal Code",
          "country": "Country",
          "phoneNumber": "Phone Number",
          "setAsDefault": "Set as default address",
          "save": "Save Address",
          "addSuccess": "Address added successfully.",
          "addError": "Failed to add address.",
          "noAddresses": "No delivery addresses yet.",
          "default": "Default",
          "maxReached": "Maximum number of addresses reached."
        }
      },
      "spaces": {
        "userAds": "{{username}}'s Ads",
        "viewSpace": "View Space"
      },
      "adDetails": {
        "seller": "Seller",
        "memberSince": "Member since {{date}}",
        "verified": "Verified",
        "popularity": "Popularity",
        "views": "{{count}} views",
        "watchers": "{{count}} watchers",
        "condition": "Condition",
        "shipping": "Shipping & Delivery",
        "deliveryEstimate": "Estimated delivery: {{estimate}}",
        "shipsFrom": "Ships from: {{origin}}",
        "specs": "Specifications",
        "otherAds": "More from this seller",
        "viewAll": "Display all",
        "questions": "Questions & Answers",
        "noQuestions": "No questions yet. Be the first to ask!",
        "askQuestion": "Ask a Question"
      },
      "questions": {
        "title": "Questions & Answers",
        "askQuestion": "Ask a Question",
        "loginToAsk": "Log in to ask a question",
        "questionPlaceholder": "What would you like to know about this item?",
        "submit": "Submit Question",
        "submitting": "Submitting...",
        "charLimit": "{{current}}/{{max}}",
        "yourPending": "Your Pending Questions",
        "unanswered": "Unanswered",
        "sortByUpvotes": "Most Upvoted",
        "sortByRecent": "Most Recent",
        "pinned": "Pinned",
        "sellerAnswer": "Seller",
        "communityAnswer": "Community",
        "reply": "Answer",
        "replying": "Submitting...",
        "answerPlaceholder": "Share your answer...",
        "submitAnswer": "Submit Answer",
        "upvote": "Upvote",
        "pin": "Pin",
        "unpin": "Unpin",
        "hide": "Hide",
        "report": "Report",
        "reportTitle": "Report Content",
        "reportPlaceholder": "Describe why this content violates guidelines...",
        "reportSubmit": "Submit Report",
        "reportSubmitting": "Submitting...",
        "reportSuccess": "Report submitted. Thank you.",
        "reportAlreadyReported": "You have already reported this content.",
        "hideConfirm": "Are you sure you want to hide this question? This action is logged for moderation review.",
        "noQuestions": "No questions yet. Be the first to ask!",
        "errors": {
          "loadFailed": "Failed to load questions.",
          "askFailed": "Failed to submit your question.",
          "answerFailed": "Failed to submit your answer.",
          "upvoteFailed": "Failed to toggle upvote.",
          "pinFailed": "Failed to toggle pin.",
          "pinLimitReached": "You can pin a maximum of 3 questions.",
          "hideFailed": "Failed to hide question.",
          "reportFailed": "Failed to submit report.",
          "ownAd": "You cannot ask questions on your own ad.",
          "limitReached": "You have reached the maximum number of pending questions for this ad.",
          "cooldown": "Please wait before asking another question.",
          "notPreviousBuyer": "Only previous buyers can submit community answers.",
          "answerAlreadyExists": "A seller answer already exists for this question.",
          "generic": "Something went wrong. Please try again."
        }
      },
      "watchlist": {
        "title": "My Watchlist",
        "empty": "You're not watching any ads yet.",
        "emptyHint": "Browse ads and click the heart icon to add them to your watchlist.",
        "added": "Ad added to watchlist",
        "removed": "Ad removed from watchlist",
        "loginRequired": "Log in to manage your watchlist"
      },
      "presence": {
        "online": "Online",
        "away": "Away",
        "busy": "Busy",
        "offline": "Offline",
        "customMessage": "Custom Status Message",
        "customMessagePlaceholder": "What's on your mind?",
        "updateStatus": "Update Status",
        "statusUpdated": "Presence status updated.",
        "failedToUpdate": "Failed to update presence status."
      },
      "chat": {
        "title": "Public Chat",
        "today": "Today",
        "yesterday": "Yesterday",
        "placeholder": "Type a message...",
        "send": "Send",
        "typingOne": "{{user}} is typing...",
        "typingTwo": "{{user1}} and {{user2}} are typing...",
        "typingMany": "Several people are typing...",
        "loadMore": "Load more messages",
        "newMessages_one": "{{count}} new message",
        "newMessages_other": "{{count}} new messages"
      },
      "volatility": {
        "banner": {
          "volatile": "⚠️ High volatility detected for {{currency}}. Protected ads may be temporarily frozen.",
          "stale": "⚠️ Exchange rate data for {{currency}} is outdated. Trading in {{currency}} is temporarily suspended for safety.",
          "cooldown": "{{currency}} is recovering. Trading expected to resume shortly."
        }
      },
      "pricing": {
        "mode": "Pricing Mode",
        "fixedCrypto": "Fixed Crypto Price",
        "fixedCryptoDesc": "I want to set an exact price in a cryptocurrency.",
        "pegged": "Pegged Price",
        "peggedDesc": "I want to set a price in a stable currency. Buyers pay the equivalent in crypto.",
        "settlementCurrencies": "Accepted Payment Methods",
        "settlementCurrenciesHint": "Select which cryptocurrencies buyers can pay with.",
        "referenceCurrency": "Price Currency",
        "volatilityProtection": "Volatility Protection",
        "volatilityProtectionDesc": "Your ad will be temporarily frozen if the crypto market drops sharply.",
        "multiCurrencyTip": "Tip: Accepting multiple currencies reduces the chance of your ad being fully suspended during market volatility.",
        "enableViewingKey": "Register a viewing key to enable",
        "payWith": "Pay with",
        "suspended": "Suspended",
        "temporarilyUnavailable": "Temporarily unavailable due to market conditions.",
        "allFrozen": "All payment methods temporarily suspended due to market volatility. Please check back soon.",
        "currencyFrozen": "Temporarily suspended",
        "partiallyFrozen": "Some payment methods are temporarily unavailable.",
        "fixedPrice": "Fixed price",
        "peggedPrice": "Pegged price",
        "fixedExplainer": "This is a fixed cryptocurrency price. You'll pay exactly this amount.",
        "peggedExplainer": "The seller set this price in {{currency}}. You'll pay the equivalent in your chosen cryptocurrency at the current market rate.",
        "tracksCurrency": "Price tracks {{currency}}",
        "frozenStatus": {
          "active": "Active",
          "partiallyFrozen": "Partially frozen",
          "fullyFrozen": "Fully frozen"
        }
      },
      "terms": {
        "title": "Terms of Service",
        "lastUpdated": "Last updated: February 2026"
      },
      "about": {
        "title": "About Gimlee",
        "subtitle": "A peer-to-peer marketplace that uses cryptocurrency for payments.",
        "mission": {
          "heading": "What Gimlee Is",
          "text": "Gimlee is an online marketplace where people buy and sell goods and services, paying with cryptocurrency. Transactions happen directly between users. Gimlee does not hold anyone's funds — payment verification is done using read-only viewing keys provided by sellers."
        },
        "features": {
          "heading": "How It Works",
          "p2p": {
            "title": "Direct Trading",
            "description": "Buyers and sellers transact directly. There is no intermediary holding funds or processing payments on their behalf."
          },
          "nonCustodial": {
            "title": "Non-Custodial Verification",
            "description": "Sellers share a read-only viewing key. This lets the platform confirm that a payment was received on the blockchain, without having access to the funds."
          },
          "privacy": {
            "title": "Privacy-Focused Payments",
            "description": "Payments use privacy-centric cryptocurrencies. Transaction details are visible only to the parties involved."
          }
        },
        "cryptos": {
          "heading": "Supported Cryptocurrencies",
          "text": "Gimlee currently supports PirateChain (ARRR). Support for Monero (XMR) and Firo (FIRO) is planned."
        }
      },
      "contact": {
        "title": "Contact Us",
        "subtitle": "Have a question, feedback, or need help? We'd love to hear from you.",
        "email": {
          "heading": "Email Us",
          "text": "For all inquiries, reach out to us at:",
          "address": "contact@gimlee.com",
          "responseTime": "We typically respond within 24–48 hours."
        }
      },
      "faq": {
        "title": "Frequently Asked Questions",
        "subtitle": "Find answers to the most common questions about Gimlee.",
        "questions": {
          "whatIsGimlee": {
            "q": "What is Gimlee?",
            "a": "Gimlee is a decentralized, peer-to-peer cryptocurrency marketplace. It connects buyers and sellers directly, allowing them to exchange goods and services using privacy-centric cryptocurrencies — without intermediaries."
          },
          "howPaymentsWork": {
            "q": "How do payments work?",
            "a": "Payments are made directly between buyer and seller on the blockchain. Gimlee never holds your funds. Instead, sellers provide a read-only viewing key that allows the platform to verify that the payment has been made."
          },
          "whatIsViewingKey": {
            "q": "What is a viewing key?",
            "a": "A viewing key is a read-only cryptographic key that allows Gimlee to monitor incoming transactions on the blockchain. It cannot be used to spend or move funds — it only proves that a payment was received."
          },
          "supportedCoins": {
            "q": "Which cryptocurrencies are supported?",
            "a": "Gimlee currently supports PirateChain (ARRR). We are actively working on adding support for Monero (XMR) and Firo (FIRO)."
          },
          "fees": {
            "q": "Are there any fees?",
            "a": "Gimlee does not charge transaction fees. The only costs involved are the standard blockchain network fees for the cryptocurrency you are using."
          },
          "accountSecurity": {
            "q": "How is my account secured?",
            "a": "Accounts are protected with industry-standard authentication. We recommend using a strong, unique password. Since Gimlee is non-custodial, your funds are always under your control in your own wallet."
          },
          "disputes": {
            "q": "What happens in case of a dispute?",
            "a": "Gimlee provides a reporting and help desk system. If you encounter an issue with a transaction, you can submit a report or open a support ticket, and our team will review the case."
          },
          "createSpace": {
            "q": "What are User Spaces?",
            "a": "User Spaces are personalized public profile pages where sellers can showcase their ads, build reputation, and establish a unique identity within the marketplace."
          }
        }
      },
      "footer": {
        "tagline": "Decentralized P2P marketplace.",
        "platform": "Platform",
        "legal": "Legal",
        "contact": "Contact",
        "openSource": "Gimlee is open source under the MIT license. Fork it, modify it, run your own instance.",
        "copyright": "© {{year}} Gimlee. All rights reserved."
      },
      "report": {
        "title": "Submit a Report",
        "submit": "Report",
        "reason": "Reason",
        "reasonPlaceholder": "Select a reason…",
        "reasonRequired": "Please select a reason.",
        "description": "Description",
        "descriptionPlaceholder": "Describe the issue in detail…",
        "descriptionRequired": "Description is required.",
        "descriptionMinLength": "Description must be at least {{count}} characters.",
        "success": "Report submitted successfully. Thank you!",
        "error": "Failed to submit report. Please try again.",
        "reasons": {
          "SPAM": "Spam",
          "FRAUD": "Fraud / Scam",
          "INAPPROPRIATE_CONTENT": "Inappropriate Content",
          "COUNTERFEIT": "Counterfeit Product",
          "HARASSMENT": "Harassment",
          "COPYRIGHT": "Copyright Violation",
          "WRONG_CATEGORY": "Wrong Category",
          "OTHER": "Other"
        },
        "myReports": "My Reports",
        "noReports": "You have no reports yet.",
        "status": {
          "OPEN": "Open",
          "IN_REVIEW": "In Review",
          "RESOLVED": "Resolved",
          "DISMISSED": "Dismissed"
        },
        "targetType": {
          "AD": "Ad",
          "USER": "User",
          "MESSAGE": "Message",
          "QUESTION": "Question",
          "ANSWER": "Answer"
        }
      },
      "tickets": {
        "myTickets": "My Tickets",
        "createTicket": "New Ticket",
        "subject": "Subject",
        "subjectPlaceholder": "Brief summary of your issue…",
        "subjectRequired": "Subject is required.",
        "category": "Category",
        "categoryPlaceholder": "Select a category…",
        "categoryRequired": "Please select a category.",
        "body": "Message",
        "bodyPlaceholder": "Describe your issue in detail…",
        "bodyRequired": "Message is required.",
        "bodyMinLength": "Message must be at least {{count}} characters.",
        "submitTicket": "Submit Ticket",
        "success": "Ticket created successfully.",
        "error": "Something went wrong. Please try again.",
        "noTickets": "You have no tickets yet.",
        "notFound": "Ticket not found.",
        "replySent": "Reply sent.",
        "messageCount_one": "{{count}} message",
        "messageCount_other": "{{count}} messages",
        "messageCount": "{{count}} messages"
      },
      "admin": {
        "title": "Admin Panel",
        "dashboard": "Dashboard",
        "forbidden": {
          "title": "Access Denied",
          "message": "You do not have the required permissions to access this section."
        },
        "categories": {
          "title": "Category Management",
          "name": "Name",
          "slug": "Slug",
          "parent": "Parent Category",
          "childCount": "Children",
          "popularity": "Active Ads",
          "displayOrder": "Display Order",
          "sourceType": "Source",
          "hidden": "Hidden",
          "deprecated": "Deprecated",
          "adminOverride": "Admin Override",
          "noCategories": "No categories found.",
          "rootLevel": "Root Level",
          "sourceGpt": "GPT",
          "sourceGml": "GML",
          "create": "Create Category",
          "createRoot": "Create Root Category",
          "edit": "Edit Category",
          "delete": "Delete Category",
          "move": "Move Category",
          "moveUp": "Move Up",
          "moveDown": "Move Down",
          "hide": "Hide",
          "show": "Show",
          "addChild": "Add Child",
          "search": "Search Categories",
          "searchPlaceholder": "Search categories...",
          "refresh": "Refresh",
          "confirmDelete": "Are you sure you want to delete \"{{name}}\"? This action cannot be undone.",
          "deleteWarning": "This category will be permanently deleted.",
          "hideWarning": "Hiding this category will deactivate {{count}} active ad(s) and notify affected sellers. This action cascades to all subcategories.",
          "hideConfirm": "Hide and Deactivate Ads",
          "showConfirm": "Show Category",
          "cannotDeleteGpt": "GPT-synced categories cannot be deleted. You can hide them instead.",
          "cannotDeleteHasChildren": "This category has child categories. Remove or move them first.",
          "cannotDeleteHasAds": "This category has ads assigned. Remove or reassign them first.",
          "slugDuplicate": "This slug is already used by a sibling category.",
          "created": "Category created successfully.",
          "updated": "Category updated successfully.",
          "deleted": "Category deleted successfully.",
          "moved": "Category moved successfully.",
          "reordered": "Category reordered successfully.",
          "visibilityChanged": "Category visibility updated.",
          "selectNewParent": "Select New Parent",
          "moveToRoot": "Move to Root",
          "circularParent": "Cannot move a category into its own subtree.",
          "alreadyAtBoundary": "Category is already at this position.",
          "form": {
            "createTitle": "Create Category",
            "editTitle": "Edit Category",
            "moveTitle": "Move Category",
            "nameLabel": "Name ({{lang}})",
            "namePlaceholder": "Enter category name",
            "slugLabel": "Slug ({{lang}})",
            "slugPlaceholder": "Enter slug override",
            "parentLabel": "Parent Category",
            "nameRequired": "Name is required",
            "nameMinLength": "Name must be at least {{count}} characters",
            "nameMaxLength": "Name must be at most {{count}} characters"
          },
          "detail": {
            "title": "Category Details",
            "translations": "Translations",
            "metadata": "Metadata",
            "language": "Language",
            "sourceId": "Source ID",
            "createdAt": "Created",
            "updatedAt": "Last Updated",
            "actions": "Actions",
            "noSelection": "Select a category to view its details.",
            "path": "Path"
          }
        },
        "users": {
          "title": "User Management",
          "description": "Manage users, view profiles, and handle bans",
          "search": "Search users...",
          "noUsers": "No users found.",
          "memberSince": "Member since",
          "lastLogin": "Last login",
          "never": "Never",
          "roles": "Roles",
          "email": "Email",
          "phone": "Phone",
          "language": "Language",
          "currency": "Preferred Currency",
          "presence": "Presence",
          "lastSeen": "Last Seen",
          "filters": {
            "status": "Status",
            "allStatuses": "All Statuses",
            "sort": "Sort by",
            "direction": "Direction",
            "ascending": "Ascending",
            "descending": "Descending",
            "sortFields": {
              "registeredAt": "Registration Date",
              "lastLogin": "Last Login",
              "username": "Username"
            }
          },
          "status": {
            "ACTIVE": "Active",
            "PENDING_VERIFICATION": "Pending Verification",
            "BANNED": "Banned",
            "SUSPENDED": "Suspended"
          },
          "detail": {
            "title": "User Details",
            "profile": "Profile",
            "statistics": "Statistics",
            "activeBan": "Active Ban",
            "banHistory": "Ban History",
            "noBanHistory": "No ban history for this user."
          },
          "stats": {
            "activeAds": "Active Ads",
            "totalAds": "Total Ads",
            "purchasesAsBuyer": "Purchases (Buyer)",
            "completedAsBuyer": "Completed (Buyer)",
            "purchasesAsSeller": "Sales (Seller)",
            "completedAsSeller": "Completed (Seller)"
          },
          "ban": {
            "banUser": "Ban User",
            "unbanUser": "Unban User",
            "reason": "Reason",
            "reasonPlaceholder": "Describe the reason for banning this user...",
            "reasonMinLength": "Reason must be at least {{count}} characters",
            "reasonMaxLength": "Reason must be at most {{count}} characters",
            "permanent": "Permanent",
            "temporary": "Temporary",
            "until": "Ban until",
            "bannedBy": "Banned by",
            "bannedAt": "Banned at",
            "bannedUntil": "Banned until",
            "unbannedBy": "Unbanned by",
            "unbannedAt": "Unbanned at",
            "active": "Active",
            "expired": "Expired",
            "lifted": "Lifted",
            "confirmBan": "Are you sure you want to ban {{username}}?",
            "confirmUnban": "Are you sure you want to unban {{username}}?",
            "banSuccess": "User has been banned successfully.",
            "unbanSuccess": "User has been unbanned successfully.",
            "cannotBanAdmin": "Cannot ban an administrator."
          }
        },
        "helpdesk": {
          "title": "Help Desk",
          "description": "Manage support tickets, respond to users, and resolve issues",
          "noTickets": "No tickets found.",
          "createdBy": "Created by",
          "assignee": "Assignee",
          "unassigned": "Unassigned",
          "lastMessage": "Last message",
          "messageCount": "{{count}} messages",
          "status": {
            "OPEN": "Open",
            "IN_PROGRESS": "In Progress",
            "AWAITING_USER": "Awaiting User",
            "RESOLVED": "Resolved",
            "CLOSED": "Closed"
          },
          "priority": {
            "LOW": "Low",
            "MEDIUM": "Medium",
            "HIGH": "High",
            "URGENT": "Urgent"
          },
          "category": {
            "ACCOUNT_ISSUE": "Account Issue",
            "PAYMENT_PROBLEM": "Payment Problem",
            "ORDER_DISPUTE": "Order Dispute",
            "TECHNICAL_BUG": "Technical Bug",
            "FEATURE_REQUEST": "Feature Request",
            "SAFETY_CONCERN": "Safety Concern",
            "OTHER": "Other"
          },
          "conversation": {
            "empty": "No messages in this ticket yet.",
            "role": {
              "USER": "User",
              "SUPPORT": "Support"
            }
          },
          "reply": {
            "label": "Reply",
            "placeholder": "Type your reply...",
            "required": "Reply body is required.",
            "submit": "Send Reply"
          },
          "assign": {
            "title": "Assign Ticket",
            "description": "Select a staff member to assign this ticket to.",
            "selectStaff": "Staff Member",
            "placeholder": "— Select —",
            "submit": "Assign"
          }
        },
        "reports": {
          "title": "Report Management",
          "description": "Review and resolve reports submitted by users",
          "noReports": "No reports found.",
          "siblingCount": "{{count}} reports for this item",
          "reportedBy": "Reported by",
          "card": {
            "unassigned": "Unassigned",
            "assignedTo": "Assigned to",
            "reportedContent": "Reported content",
            "onAd": "on Ad {{adId}}",
            "descriptionPreview": "Reason"
          },
          "filters": {
            "search": "Search reports...",
            "status": "Status",
            "allStatuses": "All Statuses",
            "targetType": "Target Type",
            "allTargetTypes": "All Types",
            "reason": "Reason",
            "allReasons": "All Reasons"
          },
          "status": {
            "OPEN": "Open",
            "IN_REVIEW": "In Review",
            "RESOLVED": "Resolved",
            "DISMISSED": "Dismissed"
          },
          "targetType": {
            "AD": "Ad",
            "USER": "User",
            "MESSAGE": "Message",
            "QUESTION": "Question",
            "ANSWER": "Answer"
          },
          "reason": {
            "SPAM": "Spam",
            "FRAUD": "Fraud",
            "INAPPROPRIATE_CONTENT": "Inappropriate Content",
            "COUNTERFEIT": "Counterfeit",
            "HARASSMENT": "Harassment",
            "COPYRIGHT": "Copyright",
            "WRONG_CATEGORY": "Wrong Category",
            "OTHER": "Other"
          },
          "resolution": {
            "CONTENT_REMOVED": "Content Removed",
            "USER_WARNED": "User Warned",
            "USER_BANNED": "User Banned",
            "NO_VIOLATION": "No Violation",
            "DUPLICATE": "Duplicate",
            "OTHER": "Other"
          },
          "timeline": {
            "title": "Timeline",
            "action": {
              "CREATED": "Report created",
              "ASSIGNED": "Assigned",
              "STATUS_CHANGED": "Status changed",
              "NOTE_ADDED": "Note added",
              "RESOLVED": "Resolved"
            }
          },
          "actionModal": {
            "title": "Resolve Report",
            "resolve": "Resolve",
            "dismiss": "Dismiss",
            "resolutionLabel": "Resolution",
            "internalNotes": "Internal Notes",
            "internalNotesPlaceholder": "Add optional internal notes...",
            "submit": "Confirm Resolution",
            "resolutionRequired": "Please select a resolution."
          }
        }
      },
      "ban": {
        "banner": {
          "message": "Your account has been restricted.",
          "reason": "Reason: {{reason}}",
          "permanent": "This restriction is permanent.",
          "temporary": "Time remaining:",
          "contactSupport": "If you believe this is an error, please contact support."
        },
        "restricted": {
          "message": "This action is not available while your account is restricted."
        }
      },
      "notifications": {
        "title": "Notifications",
        "empty": "You're all caught up!",
        "emptyCategory": "No notifications in this category.",
        "emptyUnread": "No unread notifications.",
        "markAllRead": "Mark all read",
        "viewAll": "View all notifications",
        "loadMore": "Load more",
        "showAllInCategory": "Show all in this category →",
        "unreadOnly": "Unread only",
        "categories": {
          "all": "All",
          "orders": "Orders",
          "messages": "Messages",
          "ads": "Ads",
          "qa": "Q&A",
          "support": "Support",
          "account": "Account"
        },
        "justNow": "Just now"
      }
    }
  },
  "pl-PL": {
    translation: {
      "common": {
        "loading": "Ładowanie...",
        "save": "Zapisz",
        "cancel": "Anuluj",
        "ok": "OK",
        "edit": "Edytuj",
        "view": "Zobacz",
        "delete": "Usuń",
        "actions": "Akcje",
        "status": "Status",
        "confirmations": "Potwierdzenia",
        "memo": "Memo",
        "undo": "Cofnij",
        "redo": "Ponów",
        "rotate": "Obróć",
        "editing": "Edycja",
        "search": "Szukaj",
        "reset": "Resetuj",
        "increment": "Zwiększ",
        "decrement": "Zmniejsz",
        "externalLinkWarning": "Opuszczasz Gimlee. Nie ponosimy odpowiedzialności za treści na zewnętrznych stronach. Czy chcesz kontynuować?",
        "retry": "Ponów"
      },
      "navbar": {
        "browseAds": "Przeglądaj ogłoszenia",
        "myAds": "Sprzedaż",
        "purchases": "Zakupy",
        "profile": "Profil",
        "logout": "Wyloguj",
        "login": "Zaloguj",
        "register": "Zarejestruj",
        "theme": "Motyw",
        "terms": "Regulamin",
        "watchlist": "Obserwowane",
        "admin": "Panel Admina",
        "about": "O nas",
        "contact": "Kontakt",
        "faq": "FAQ",
        "country": "Kraj",
        "selectCountry": "Wybierz kraj"
      },
      "home": {
        "featuredAds": "Wyróżnione ogłoszenia",
        "disclaimer": {
          "title": "Aplikacja Eksperymentalna",
          "message": "Gimlee jest obecnie w fazie eksperymentalnej i rozwojowej. Wszystkie transakcje wykorzystują waluty operujące na sieciach testowych YCash i PirateChain z symulowanym wydobyciem."
        }
      },
      "auth": {
        "loginTitle": "Logowanie",
        "registerTitle": "Rejestracja",
        "username": "Nazwa użytkownika",
        "password": "Hasło",
        "confirmPassword": "Potwierdź hasło",
        "email": "Email",
        "loggingIn": "Logowanie...",
        "registering": "Rejestracja...",
        "noAccount": "Nie masz konta?",
        "termsAcknowledgment": "Rejestrując się, akceptujesz nasz <1>Regulamin</1>.",
        "hasAccount": "Masz już konto?",
        "loginRequired": "Już prawie! Zaloguj się, aby uzyskać dostęp do wybranej strony. Pierwszy raz w Gimlee? <1>Zarejestruj się tutaj</1>.",
        "registrationSuccess": "Twoje konto zostało zarejestrowane, a kod potwierdzający został wysłany na adres {{email}}. Zaloguj się, aby dokończyć rejestrację.",
        "verifyTitle": "Zweryfikuj swoje konto",
        "verifyText": "Wprowadź kod weryfikacyjny wysłany na Twój e-mail.",
        "verifyPlaceholder": "Kod weryfikacyjny",
        "verifyButton": "Zweryfikuj",
        "verifying": "Weryfikacja...",
        "errors": {
          "loginFailed": "Logowanie nieudane. Sprawdź swoje dane.",
          "generic": "Wystąpił błąd.",
          "required": "{{field}} jest wymagane",
          "minLength": "Musi mieć co najmniej {{count}} znaków",
          "invalidEmail": "Wprowadź poprawny adres e-mail",
          "passwordRequirements": "Hasło musi mieć 8-64 znaki i zawierać co najmniej jedną wielką literę, jedną małą literę i jedną cyfrę",
          "passwordsDoNotMatch": "Hasła nie zgadzają się",
          "usernameTaken": "Nazwa użytkownika jest już zajęta",
          "emailTaken": "Email jest już zajęty"
        },
        "countryOfResidence": "Kraj zamieszkania",
        "countryHint": "Wykryty na podstawie Twojej lokalizacji. Możesz zmienić.",
        "changePassword": {
          "title": "Zmień hasło",
          "oldPassword": "Obecne hasło",
          "newPassword": "Nowe hasło",
          "confirmPassword": "Potwierdź nowe hasło",
          "submit": "Zmień hasło",
          "success": "Hasło zostało zmienione.",
          "error": "Nie udało się zmienić hasła. Spróbuj ponownie."
        }
      },
      "ads": {
        "browseTitle": "Przeglądaj ogłoszenia",
        "searchPlaceholder": "Szukaj ogłoszeń...",
        "noAdsFound": "Nie znaleziono ogłoszeń pasujących do wyszukiwania.",
        "myAdsTitle": "Moje ogłoszenia",
        "createNew": "Dodaj ogłoszenie",
        "noAdsYet": "Nie masz jeszcze żadnych ogłoszeń.",
        "activate": "Aktywuj",
        "deactivate": "Dezaktywuj",
        "filters": "Filtry",
        "advancedFilters": "Zaawansowane filtry",
        "sorting": "Sortowanie",
        "sort": {
          "date": "Data",
          "price": "Cena",
          "desc": "Malejąco",
          "asc": "Rosnąco"
        },
        "priceRange": "Zakres cen",
        "minPrice": "Od",
        "maxPrice": "Do",
        "applyFilters": "Zastosuj filtry",
        "price": "Cena",
        "title": "Tytuł",
        "description": "Opis",
        "location": "Lokalizacja",
        "noDescription": "Brak opisu.",
        "noImages": "Brak zdjęć",
        "editTitle": "Edytuj ogłoszenie",
        "enterTitlePrompt": "Wprowadź tytuł nowego ogłoszenia:",
        "city": "Miasto",
        "cityPlaceholder": "Szukaj miasta...",
        "category": "Kategoria",
        "selectCategory": "Wybierz kategorię",
        "changeCategory": "Zmień kategorię",
        "categorySearchPlaceholder": "Szukaj kategorii...",
        "allIn": "Wszystko w {{category}}",
        "currency": "Waluta",
        "media": "Media",
        "stock": "Stan magazynowy",
        "uploadText": "Przeciągnij i upuść pliki tutaj lub ",
        "selectFiles": "wybierz je",
        "uploadFile": "Wgraj plik",
        "takePhoto": "Zrób zdjęcie",
        "saving": "Zapisywanie...",
        "failedToCreate": "Nie udało się utworzyć ogłoszenia",
        "failedToActivate": "Nie udało się aktywować ogłoszenia",
        "failedToDeactivate": "Nie udało się dezaktywować ogłoszenia",
        "notFound": "Ogłoszenie nie znalezione.",
        "mainPhoto": "Główne zdjęcie",
        "setAsMain": "Ustaw jako główne",
        "status": {
          "sold": "Sprzedane",
          "new": "Nowe",
          "outOfStock": "Brak w magazynie"
        },
        "conditions": {
          "NEW": "Nowy",
          "LIKE_NEW": "Jak nowy",
          "GOOD": "Dobry",
          "FAIR": "Używany"
        },
        "onlyLeft": "Ostatnie {{count}} sztuk!",
        "notEligibleTitle": "Wymagane działanie",
        "notEligibleMessage": "Aby aktywować ogłoszenie, musisz najpierw zarejestrować klucz podglądu dla przynajmniej jednej obsługiwanej kryptowaluty. Pozwala to platformie na bezpieczną weryfikację płatności bez przejmowania Twoich środków.",
        "goToProfile": "Przejdź do ustawień profilu",
        "generalInfo": "Informacje ogólne",
        "classificationLocation": "Klasyfikacja i lokalizacja",
        "pricingStock": "Cena i stan magazynowy",
        "titleGuidance": "Wprowadź jasny, opisowy tytuł, który pomoże kupującym znaleźć Twój przedmiot.",
        "descriptionGuidance": "Opisz szczegółowo swój przedmiot. Obsługuje Markdown (pogrubienie, listy, linki).",
        "priceGuidance": "Ustal sprawiedliwą cenę za swój przedmiot.",
        "stockGuidance": "Ile sztuk masz dostępnych?",
        "imageProhibited": "Zewnętrzne obrazy są zabronione",
        "editPhoto": "Edytuj zdjęcie",
        "aspectRatio": "Proporcje",
        "zoom": "Powiększenie",
        "markdown": {
          "bold": "Pogrubienie",
          "italic": "Kursywa",
          "heading": "Nagłówek",
          "link": "Link",
          "image": "Wstaw obraz",
          "linkPrompt": "Wprowadź adres URL:",
          "linkPlaceholder": "https://..."
        }
      },
      "sales": {
        "title": "Sprzedaż",
        "myAds": "Moje ogłoszenia",
        "myOrders": "Moja sprzedaż",
        "orders": "Zamówienia",
        "noOrders": "Nie masz jeszcze żadnej sprzedaży.",
        "orderId": "ID zamówienia",
        "buyer": "Kupujący",
        "total": "Suma",
        "date": "Data",
        "adStats": {
          "title": "Statystyki odwiedzin",
          "daily": "Dzisiaj",
          "monthly": "Ten miesiąc",
          "yearly": "Ten rok",
          "total": "Ogółem"
        }
      },
      "purchases": {
        "title": "Zakupy",
        "myPurchases": "Moje zakupy",
        "noPurchases": "Nie masz jeszcze żadnych zakupów.",
        "seller": "Sprzedawca",
        "buyNow": "Kup teraz",
        "quantity": "Ilość",
        "paymentTitle": "Dokończ płatność",
        "sendAmount": "Proszę wyślij dokładnie",
        "toAddress": "na poniższy adres",
        "memo": "Memo (wymagane)",
        "statusAwaiting": "Oczekiwanie na płatność...",
        "statusComplete": "Płatność zakończona!",
        "statusFailedTimeout": "Upłynął limit czasu płatności.",
        "statusFailedUnderpaid": "Niedopłata płatności.",
        "statusCancelled": "Zakup anulowany.",
        "cancelPurchase": "Anuluj zakup",
        "confirmCancel": "Czy na pewno chcesz anulować ten zakup?",
        "partialPaymentWarning": "Uwaga: Zapłacono już {{paid}}. Anulowanie tego zakupu spowoduje trwałą utratę tych środków. Czy na pewno chcesz kontynuować?",
        "volatilityWarning": "Cena w {{currency}} jest szacunkowa i może nie być dokładna ze względu na zmienność rynku.",
        "close": "Zamknij",
        "timeLeft": "Pozostały czas: {{time}}",
        "paymentProgress": "Postęp płatności: {{paid}} / {{total}}",
        "storedPurchaseFound": "Masz aktywny zakup. Kliknij tutaj, aby go zobaczyć.",
        "pendingPurchaseExists": "Masz już oczekujący zakup. Dokończ go przed rozpoczęciem nowego.",
        "items": "Produkty",
        "paymentInstructions": "Płatność jest obecnie przetwarzana.",
        "viewPaymentInfo": "Pokaż dane do płatności",
        "currencyFrozen": "Ta metoda płatności jest tymczasowo niedostępna z powodu zmienności rynku. Spróbuj innej metody płatności.",
        "currencyNotAccepted": "To ogłoszenie nie akceptuje płatności w {{currency}}.",
        "priceMismatch": "Cena zmieniła się od momentu załadowania strony. Sprawdź zaktualizowane ceny i spróbuj ponownie.",
        "insufficientStock": "Dostępnych jest tylko {{count}} sztuk.",
        "selectAddress": "Wybierz adres dostawy",
        "noAddressesForCountry": "Nie masz żadnych adresów dostawy dla Twojego kraju.",
        "addAddress": "Dodaj adres dostawy",
        "confirmAndPay": "Potwierdź i zapłać",
        "deliveryTo": "Dostawa do",
        "stepOf": "Krok {{current}} z {{total}}",
        "addressCountryMismatch": "Ten adres nie pasuje do Twojego kraju zamieszkania.",
        "countryOfResidenceRequired": "Proszę ustawić kraj zamieszkania przed zakupem.",
        "loadAddressesError": "Nie udało się załadować adresów dostawy. Spróbuj ponownie."
      },
      "profile": {
        "title": "Profil i ustawienia",
        "regionalSettings": "Ustawienia regionalne",
        "language": "Język",
        "sellingAndPayments": "Sprzedaż i płatności",
        "paymentMonitoring": "Pirate Chain",
        "paymentMonitoringYec": "YCash",
        "paymentDesc": "Aby umożliwić bezpowierniczą weryfikację płatności i aktywować swoje ogłoszenia, podaj swój klucz podglądu Pirate Chain (z-view key). Pozwala to platformie potwierdzić, kiedy kupujący dokonał płatności.",
        "paymentDescYec": "Aby umożliwić bezpowierniczą weryfikację płatności i aktywować swoje ogłoszenia, podaj swój klucz podglądu YCash (z-view key). Pozwala to platformie potwierdzić, kiedy kupujący dokonał płatności.",
        "viewKeyPlaceholder": "Wprowadź klucz zxview...",
        "saveKey": "Zapisz klucz",
        "recentTransactions": "Ostatnie transakcje Pirate Chain",
        "recentTransactionsYec": "Ostatnie transakcje YCash",
        "showTransactions": "Pokaż ostatnie transakcje",
        "hideTransactions": "Ukryj ostatnie transakcje",
        "noTransactions": "Nie znaleziono transakcji.",
        "keyUpdated": "Klucz podglądu został zaktualizowany.",
        "preferencesUpdated": "Preferencje zostały zaktualizowane.",
        "failedToSaveLanguage": "Nie udało się zapisać preferencji języka.",
        "preferredCurrency": "Preferowana waluta",
        "searchCurrency": "Szukaj waluty...",
        "failedToSaveCurrency": "Nie udało się zapisać preferowanej waluty.",
        "countryOfResidence": "Kraj zamieszkania",
        "searchCountry": "Szukaj kraju...",
        "failedToSaveCountry": "Nie udało się zapisać kraju zamieszkania.",
        "theme": "Motyw",
        "themes": {
          "light": "Jasny",
          "dark": "Ciemny",
          "dark-unicorn": "Mroczny Jednorożec",
          "iron-age": "Epoka żelaza"
        },
        "avatar": {
          "title": "Zdjęcie profilowe",
          "change": "Zmień awatar",
          "upload": "Prześlij",
          "uploadSuccess": "Awatar został zaktualizowany.",
          "uploadError": "Nie udało się zaktualizować awatara."
        },
        "deliveryAddresses": {
          "title": "Adresy dostawy",
          "addAddress": "Dodaj adres",
          "name": "Etykieta adresu",
          "namePlaceholder": "np. Dom, Biuro…",
          "fullName": "Imię i nazwisko",
          "street": "Ulica",
          "city": "Miasto",
          "postalCode": "Kod pocztowy",
          "country": "Kraj",
          "phoneNumber": "Numer telefonu",
          "setAsDefault": "Ustaw jako domyślny adres",
          "save": "Zapisz adres",
          "addSuccess": "Adres został dodany.",
          "addError": "Nie udało się dodać adresu.",
          "noAddresses": "Brak adresów dostawy.",
          "default": "Domyślny",
          "maxReached": "Osiągnięto maksymalną liczbę adresów."
        }
      },
      "spaces": {
        "userAds": "Ogłoszenia użytkownika {{username}}",
        "viewSpace": "Pokaż profil"
      },
      "adDetails": {
        "seller": "Sprzedawca",
        "memberSince": "W serwisie od {{date}}",
        "verified": "Zweryfikowany",
        "popularity": "Popularność",
        "views": "{{count}} wyświetleń",
        "watchers": "{{count}} obserwujących",
        "condition": "Stan",
        "shipping": "Wysyłka i dostawa",
        "deliveryEstimate": "Przewidywana dostawa: {{estimate}}",
        "shipsFrom": "Wysyłka z: {{origin}}",
        "specs": "Specyfikacja",
        "otherAds": "Więcej od tego sprzedawcy",
        "viewAll": "Pokaż wszystkie",
        "questions": "Pytania i odpowiedzi",
        "noQuestions": "Brak pytań. Bądź pierwszy!",
        "askQuestion": "Zadaj pytanie"
      },
      "questions": {
        "title": "Pytania i odpowiedzi",
        "askQuestion": "Zadaj pytanie",
        "loginToAsk": "Zaloguj się, aby zadać pytanie",
        "questionPlaceholder": "Co chciałbyś wiedzieć o tym przedmiocie?",
        "submit": "Wyślij pytanie",
        "submitting": "Wysyłanie...",
        "charLimit": "{{current}}/{{max}}",
        "yourPending": "Twoje oczekujące pytania",
        "unanswered": "Bez odpowiedzi",
        "sortByUpvotes": "Najwyżej oceniane",
        "sortByRecent": "Najnowsze",
        "pinned": "Przypięte",
        "sellerAnswer": "Sprzedawca",
        "communityAnswer": "Społeczność",
        "reply": "Odpowiedz",
        "replying": "Wysyłanie...",
        "answerPlaceholder": "Podziel się swoją odpowiedzią...",
        "submitAnswer": "Wyślij odpowiedź",
        "upvote": "Głosuj za",
        "pin": "Przypnij",
        "unpin": "Odepnij",
        "hide": "Ukryj",
        "report": "Zgłoś",
        "reportTitle": "Zgłoś treść",
        "reportPlaceholder": "Opisz, dlaczego ta treść narusza zasady...",
        "reportSubmit": "Wyślij zgłoszenie",
        "reportSubmitting": "Wysyłanie...",
        "reportSuccess": "Zgłoszenie wysłane. Dziękujemy.",
        "reportAlreadyReported": "Ta treść została już przez Ciebie zgłoszona.",
        "hideConfirm": "Czy na pewno chcesz ukryć to pytanie? Ta akcja jest rejestrowana do przeglądu moderacji.",
        "noQuestions": "Brak pytań. Bądź pierwszy!",
        "errors": {
          "loadFailed": "Nie udało się załadować pytań.",
          "askFailed": "Nie udało się wysłać pytania.",
          "answerFailed": "Nie udało się wysłać odpowiedzi.",
          "upvoteFailed": "Nie udało się zmienić głosu.",
          "pinFailed": "Nie udało się zmienić przypięcia.",
          "pinLimitReached": "Możesz przypiąć maksymalnie 3 pytania.",
          "hideFailed": "Nie udało się ukryć pytania.",
          "reportFailed": "Nie udało się wysłać zgłoszenia.",
          "ownAd": "Nie możesz zadawać pytań na własnym ogłoszeniu.",
          "limitReached": "Osiągnięto maksymalną liczbę oczekujących pytań dla tego ogłoszenia.",
          "cooldown": "Proszę poczekać przed zadaniem kolejnego pytania.",
          "notPreviousBuyer": "Tylko poprzedni kupujący mogą udzielać odpowiedzi społecznościowych.",
          "answerAlreadyExists": "Odpowiedź sprzedawcy już istnieje dla tego pytania.",
          "generic": "Coś poszło nie tak. Spróbuj ponownie."
        }
      },
      "watchlist": {
        "title": "Moja lista obserwowanych",
        "empty": "Nie obserwujesz jeszcze żadnych ogłoszeń.",
        "emptyHint": "Przeglądaj ogłoszenia i kliknij ikonę serca, aby dodać je do listy obserwowanych.",
        "added": "Ogłoszenie dodane do obserwowanych",
        "removed": "Ogłoszenie usunięte z obserwowanych",
        "loginRequired": "Zaloguj się, aby zarządzać listą obserwowanych"
      },
      "presence": {
        "online": "Dostępny",
        "away": "Zaraz wracam",
        "busy": "Zajęty",
        "offline": "Niedostępny",
        "customMessage": "Własny opis statusu",
        "customMessagePlaceholder": "O czym myślisz?",
        "updateStatus": "Aktualizuj status",
        "statusUpdated": "Status dostępności został zaktualizowany.",
        "failedToUpdate": "Nie udało się zaktualizować statusu dostępności."
      },
      "chat": {
        "title": "Czat publiczny",
        "today": "Dzisiaj",
        "yesterday": "Wczoraj",
        "placeholder": "Napisz wiadomość...",
        "send": "Wyślij",
        "typingOne": "{{user}} pisze...",
        "typingTwo": "{{user1}} i {{user2}} piszą...",
        "typingMany": "Kilka osób pisze...",
        "loadMore": "Załaduj więcej wiadomości",
        "newMessages_one": "{{count}} nowa wiadomość",
        "newMessages_few": "{{count}} nowe wiadomości",
        "newMessages_many": "{{count}} nowych wiadomości"
      },
      "volatility": {
        "banner": {
          "volatile": "⚠️ Wykryto dużą zmienność dla {{currency}}. Chronione ogłoszenia mogą być tymczasowo zamrożone.",
          "stale": "⚠️ Dane kursów wymiany dla {{currency}} są nieaktualne. Handel w {{currency}} jest tymczasowo zawieszony dla bezpieczeństwa.",
          "cooldown": "{{currency}} odzyskuje stabilność. Handel powinien wkrótce zostać wznowiony."
        }
      },
      "pricing": {
        "mode": "Tryb wyceny",
        "fixedCrypto": "Stała cena krypto",
        "fixedCryptoDesc": "Chcę ustawić dokładną cenę w kryptowalucie.",
        "pegged": "Cena powiązana",
        "peggedDesc": "Chcę ustawić cenę w stabilnej walucie. Kupujący płacą równowartość w krypto.",
        "settlementCurrencies": "Akceptowane metody płatności",
        "settlementCurrenciesHint": "Wybierz, jakimi kryptowalutami kupujący mogą płacić.",
        "referenceCurrency": "Waluta ceny",
        "volatilityProtection": "Ochrona przed zmiennością",
        "volatilityProtectionDesc": "Twoje ogłoszenie zostanie tymczasowo zamrożone, jeśli rynek krypto gwałtownie spadnie.",
        "multiCurrencyTip": "Wskazówka: Akceptowanie wielu walut zmniejsza szansę na pełne zawieszenie ogłoszenia podczas zmienności rynku.",
        "enableViewingKey": "Zarejestruj klucz podglądu, aby włączyć",
        "payWith": "Zapłać za pomocą",
        "suspended": "Zawieszony",
        "temporarilyUnavailable": "Tymczasowo niedostępny z powodu warunków rynkowych.",
        "allFrozen": "Wszystkie metody płatności tymczasowo zawieszone z powodu zmienności rynku. Spróbuj ponownie później.",
        "currencyFrozen": "Tymczasowo zawieszone",
        "partiallyFrozen": "Niektóre metody płatności są tymczasowo niedostępne.",
        "fixedPrice": "Cena stała",
        "peggedPrice": "Cena powiązana",
        "fixedExplainer": "To jest stała cena w kryptowalucie. Zapłacisz dokładnie tę kwotę.",
        "peggedExplainer": "Sprzedawca ustalił cenę w {{currency}}. Zapłacisz równowartość w wybranej kryptowalucie po aktualnym kursie rynkowym.",
        "tracksCurrency": "Cena śledzi {{currency}}",
        "frozenStatus": {
          "active": "Aktywny",
          "partiallyFrozen": "Częściowo zamrożony",
          "fullyFrozen": "Całkowicie zamrożony"
        }
      },
      "terms": {
        "title": "Regulamin",
        "lastUpdated": "Ostatnia aktualizacja: luty 2026"
      },
      "about": {
        "title": "O Gimlee",
        "subtitle": "Rynek peer-to-peer wykorzystujący kryptowaluty do płatności.",
        "mission": {
          "heading": "Czym jest Gimlee",
          "text": "Gimlee to internetowy rynek, na którym ludzie kupują i sprzedają towary oraz usługi, płacąc kryptowalutami. Transakcje odbywają się bezpośrednio między użytkownikami. Gimlee nie przechowuje niczyich środków — weryfikacja płatności odbywa się za pomocą kluczy widoku udostępnianych przez sprzedających."
        },
        "features": {
          "heading": "Jak to działa",
          "p2p": {
            "title": "Bezpośredni handel",
            "description": "Kupujący i sprzedający dokonują transakcji bezpośrednio. Nie ma pośrednika, który przechowuje środki lub przetwarza płatności w ich imieniu."
          },
          "nonCustodial": {
            "title": "Weryfikacja bez powiernictwa",
            "description": "Sprzedający udostępniają klucz widoku (tylko do odczytu). Pozwala to platformie potwierdzić, że płatność została odebrana na blockchainie, bez dostępu do środków."
          },
          "privacy": {
            "title": "Płatności z naciskiem na prywatność",
            "description": "Płatności wykorzystują kryptowaluty nastawione na prywatność. Szczegóły transakcji są widoczne tylko dla zaangażowanych stron."
          }
        },
        "cryptos": {
          "heading": "Obsługiwane kryptowaluty",
          "text": "Gimlee obecnie obsługuje PirateChain (ARRR). Planowane jest wsparcie dla Monero (XMR) i Firo (FIRO)."
        }
      },
      "contact": {
        "title": "Kontakt",
        "subtitle": "Masz pytanie, opinię lub potrzebujesz pomocy? Chętnie Ci pomożemy.",
        "email": {
          "heading": "Napisz do nas",
          "text": "W przypadku wszelkich pytań skontaktuj się z nami pod adresem:",
          "address": "contact@gimlee.com",
          "responseTime": "Zazwyczaj odpowiadamy w ciągu 24–48 godzin."
        }
      },
      "faq": {
        "title": "Najczęściej zadawane pytania",
        "subtitle": "Znajdź odpowiedzi na najczęstsze pytania dotyczące Gimlee.",
        "questions": {
          "whatIsGimlee": {
            "q": "Czym jest Gimlee?",
            "a": "Gimlee to zdecentralizowany rynek kryptowalutowy typu peer-to-peer. Łączy kupujących i sprzedających bezpośrednio, umożliwiając wymianę towarów i usług za pomocą kryptowalut nastawionych na prywatność — bez pośredników."
          },
          "howPaymentsWork": {
            "q": "Jak działają płatności?",
            "a": "Płatności realizowane są bezpośrednio między kupującym a sprzedającym na blockchainie. Gimlee nigdy nie trzyma Twoich środków. Zamiast tego sprzedający udostępniają klucz widoku, który pozwala platformie zweryfikować, że płatność została dokonana."
          },
          "whatIsViewingKey": {
            "q": "Czym jest klucz widoku?",
            "a": "Klucz widoku to kryptograficzny klucz tylko do odczytu, który pozwala Gimlee monitorować przychodzące transakcje na blockchainie. Nie może być użyty do wydawania lub przenoszenia środków — jedynie potwierdza, że płatność została odebrana."
          },
          "supportedCoins": {
            "q": "Jakie kryptowaluty są obsługiwane?",
            "a": "Gimlee obecnie obsługuje PirateChain (ARRR). Aktywnie pracujemy nad dodaniem wsparcia dla Monero (XMR) i Firo (FIRO)."
          },
          "fees": {
            "q": "Czy pobierane są jakieś opłaty?",
            "a": "Gimlee nie pobiera opłat transakcyjnych. Jedyne koszty to standardowe opłaty sieciowe blockchaina dla używanej kryptowaluty."
          },
          "accountSecurity": {
            "q": "Jak zabezpieczone jest moje konto?",
            "a": "Konta są chronione standardowym uwierzytelnianiem branżowym. Zalecamy używanie silnego, unikalnego hasła. Ponieważ Gimlee jest non-custodial, Twoje środki zawsze pozostają pod Twoją kontrolą w Twoim własnym portfelu."
          },
          "disputes": {
            "q": "Co się dzieje w przypadku sporu?",
            "a": "Gimlee zapewnia system zgłoszeń i pomoc techniczną. Jeśli napotkasz problem z transakcją, możesz złożyć zgłoszenie lub otworzyć zgłoszenie pomocy, a nasz zespół rozpatrzy sprawę."
          },
          "createSpace": {
            "q": "Czym są Przestrzenie Użytkownika?",
            "a": "Przestrzenie Użytkownika to spersonalizowane publiczne strony profilowe, na których sprzedający mogą prezentować swoje ogłoszenia, budować reputację i tworzyć unikalną tożsamość na rynku."
          }
        }
      },
      "footer": {
        "tagline": "Zdecentralizowany rynek P2P.",
        "platform": "Platforma",
        "legal": "Prawne",
        "contact": "Kontakt",
        "openSource": "Gimlee jest open source na licencji MIT. Forkuj, modyfikuj, uruchom własną instancję.",
        "copyright": "© {{year}} Gimlee. Wszelkie prawa zastrzeżone."
      },
      "report": {
        "title": "Zgłoś naruszenie",
        "submit": "Zgłoś",
        "reason": "Powód",
        "reasonPlaceholder": "Wybierz powód…",
        "reasonRequired": "Proszę wybrać powód.",
        "description": "Opis",
        "descriptionPlaceholder": "Opisz szczegółowo problem…",
        "descriptionRequired": "Opis jest wymagany.",
        "descriptionMinLength": "Opis musi mieć co najmniej {{count}} znaków.",
        "success": "Zgłoszenie zostało wysłane. Dziękujemy!",
        "error": "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
        "reasons": {
          "SPAM": "Spam",
          "FRAUD": "Oszustwo",
          "INAPPROPRIATE_CONTENT": "Nieodpowiednia treść",
          "COUNTERFEIT": "Podróbka",
          "HARASSMENT": "Nękanie",
          "COPYRIGHT": "Naruszenie praw autorskich",
          "WRONG_CATEGORY": "Błędna kategoria",
          "OTHER": "Inne"
        },
        "myReports": "Moje zgłoszenia",
        "noReports": "Nie masz jeszcze żadnych zgłoszeń.",
        "status": {
          "OPEN": "Otwarte",
          "IN_REVIEW": "W trakcie przeglądu",
          "RESOLVED": "Rozwiązane",
          "DISMISSED": "Odrzucone"
        },
        "targetType": {
          "AD": "Ogłoszenie",
          "USER": "Użytkownik",
          "MESSAGE": "Wiadomość",
          "QUESTION": "Pytanie",
          "ANSWER": "Odpowiedź"
        }
      },
      "tickets": {
        "myTickets": "Moje zgłoszenia",
        "createTicket": "Nowe zgłoszenie",
        "subject": "Temat",
        "subjectPlaceholder": "Krótki opis problemu…",
        "subjectRequired": "Temat jest wymagany.",
        "category": "Kategoria",
        "categoryPlaceholder": "Wybierz kategorię…",
        "categoryRequired": "Proszę wybrać kategorię.",
        "body": "Wiadomość",
        "bodyPlaceholder": "Opisz szczegółowo swój problem…",
        "bodyRequired": "Wiadomość jest wymagana.",
        "bodyMinLength": "Wiadomość musi mieć co najmniej {{count}} znaków.",
        "submitTicket": "Wyślij zgłoszenie",
        "success": "Zgłoszenie zostało utworzone.",
        "error": "Coś poszło nie tak. Spróbuj ponownie.",
        "noTickets": "Nie masz jeszcze żadnych zgłoszeń.",
        "notFound": "Nie znaleziono zgłoszenia.",
        "replySent": "Odpowiedź wysłana.",
        "messageCount_one": "{{count}} wiadomość",
        "messageCount_few": "{{count}} wiadomości",
        "messageCount_many": "{{count}} wiadomości",
        "messageCount_other": "{{count}} wiadomości",
        "messageCount": "{{count}} wiadomości"
      },
      "admin": {
        "title": "Panel Administracyjny",
        "dashboard": "Pulpit",
        "forbidden": {
          "title": "Brak Dostępu",
          "message": "Nie masz wymaganych uprawnień, aby uzyskać dostęp do tej sekcji."
        },
        "categories": {
          "title": "Zarządzanie Kategoriami",
          "name": "Nazwa",
          "slug": "Slug",
          "parent": "Kategoria nadrzędna",
          "childCount": "Podkategorie",
          "popularity": "Aktywne ogłoszenia",
          "displayOrder": "Kolejność wyświetlania",
          "sourceType": "Źródło",
          "hidden": "Ukryta",
          "deprecated": "Przestarzała",
          "adminOverride": "Nadpisane przez admina",
          "noCategories": "Nie znaleziono kategorii.",
          "rootLevel": "Poziom główny",
          "sourceGpt": "GPT",
          "sourceGml": "GML",
          "create": "Utwórz kategorię",
          "createRoot": "Utwórz kategorię główną",
          "edit": "Edytuj kategorię",
          "delete": "Usuń kategorię",
          "move": "Przenieś kategorię",
          "moveUp": "Przesuń w górę",
          "moveDown": "Przesuń w dół",
          "hide": "Ukryj",
          "show": "Pokaż",
          "addChild": "Dodaj podkategorię",
          "search": "Szukaj kategorii",
          "searchPlaceholder": "Szukaj kategorii...",
          "refresh": "Odśwież",
          "confirmDelete": "Czy na pewno chcesz usunąć \"{{name}}\"? Tej operacji nie można cofnąć.",
          "deleteWarning": "Ta kategoria zostanie trwale usunięta.",
          "hideWarning": "Ukrycie tej kategorii spowoduje dezaktywację {{count}} aktywnych ogłoszeń i powiadomienie sprzedawców. Operacja obejmuje wszystkie podkategorie.",
          "hideConfirm": "Ukryj i dezaktywuj ogłoszenia",
          "showConfirm": "Pokaż kategorię",
          "cannotDeleteGpt": "Kategorie zsynchronizowane z GPT nie mogą być usunięte. Możesz je ukryć.",
          "cannotDeleteHasChildren": "Ta kategoria ma podkategorie. Najpierw je usuń lub przenieś.",
          "cannotDeleteHasAds": "Ta kategoria ma przypisane ogłoszenia. Najpierw je usuń lub przenieś.",
          "slugDuplicate": "Ten slug jest już używany przez kategorię na tym samym poziomie.",
          "created": "Kategoria została utworzona.",
          "updated": "Kategoria została zaktualizowana.",
          "deleted": "Kategoria została usunięta.",
          "moved": "Kategoria została przeniesiona.",
          "reordered": "Kolejność kategorii została zmieniona.",
          "visibilityChanged": "Widoczność kategorii została zmieniona.",
          "selectNewParent": "Wybierz nową kategorię nadrzędną",
          "moveToRoot": "Przenieś na poziom główny",
          "circularParent": "Nie można przenieść kategorii do jej własnego poddrzewa.",
          "alreadyAtBoundary": "Kategoria jest już na tej pozycji.",
          "form": {
            "createTitle": "Utwórz kategorię",
            "editTitle": "Edytuj kategorię",
            "moveTitle": "Przenieś kategorię",
            "nameLabel": "Nazwa ({{lang}})",
            "namePlaceholder": "Wprowadź nazwę kategorii",
            "slugLabel": "Slug ({{lang}})",
            "slugPlaceholder": "Wprowadź nadpisanie sluga",
            "parentLabel": "Kategoria nadrzędna",
            "nameRequired": "Nazwa jest wymagana",
            "nameMinLength": "Nazwa musi mieć co najmniej {{count}} znaków",
            "nameMaxLength": "Nazwa może mieć maksymalnie {{count}} znaków"
          },
          "detail": {
            "title": "Szczegóły kategorii",
            "translations": "Tłumaczenia",
            "metadata": "Metadane",
            "language": "Język",
            "sourceId": "ID źródła",
            "createdAt": "Utworzono",
            "updatedAt": "Ostatnia aktualizacja",
            "actions": "Akcje",
            "noSelection": "Wybierz kategorię, aby zobaczyć jej szczegóły.",
            "path": "Ścieżka"
          }
        },
        "users": {
          "title": "Zarządzanie Użytkownikami",
          "description": "Zarządzaj użytkownikami, przeglądaj profile i obsługuj blokady",
          "search": "Szukaj użytkowników...",
          "noUsers": "Nie znaleziono użytkowników.",
          "memberSince": "Członek od",
          "lastLogin": "Ostatnie logowanie",
          "never": "Nigdy",
          "roles": "Role",
          "email": "Email",
          "phone": "Telefon",
          "language": "Język",
          "currency": "Preferowana waluta",
          "presence": "Obecność",
          "lastSeen": "Ostatnio widziany",
          "filters": {
            "status": "Status",
            "allStatuses": "Wszystkie statusy",
            "sort": "Sortuj według",
            "direction": "Kierunek",
            "ascending": "Rosnąco",
            "descending": "Malejąco",
            "sortFields": {
              "registeredAt": "Data rejestracji",
              "lastLogin": "Ostatnie logowanie",
              "username": "Nazwa użytkownika"
            }
          },
          "status": {
            "ACTIVE": "Aktywny",
            "PENDING_VERIFICATION": "Oczekuje na weryfikację",
            "BANNED": "Zablokowany",
            "SUSPENDED": "Zawieszony"
          },
          "detail": {
            "title": "Szczegóły użytkownika",
            "profile": "Profil",
            "statistics": "Statystyki",
            "activeBan": "Aktywna blokada",
            "banHistory": "Historia blokad",
            "noBanHistory": "Brak historii blokad dla tego użytkownika."
          },
          "stats": {
            "activeAds": "Aktywne ogłoszenia",
            "totalAds": "Wszystkie ogłoszenia",
            "purchasesAsBuyer": "Zakupy (kupujący)",
            "completedAsBuyer": "Zrealizowane (kupujący)",
            "purchasesAsSeller": "Sprzedaże (sprzedawca)",
            "completedAsSeller": "Zrealizowane (sprzedawca)"
          },
          "ban": {
            "banUser": "Zablokuj użytkownika",
            "unbanUser": "Odblokuj użytkownika",
            "reason": "Powód",
            "reasonPlaceholder": "Opisz powód zablokowania tego użytkownika...",
            "reasonMinLength": "Powód musi mieć co najmniej {{count}} znaków",
            "reasonMaxLength": "Powód może mieć maksymalnie {{count}} znaków",
            "permanent": "Permanentna",
            "temporary": "Tymczasowa",
            "until": "Zablokowany do",
            "bannedBy": "Zablokowany przez",
            "bannedAt": "Zablokowany dnia",
            "bannedUntil": "Zablokowany do",
            "unbannedBy": "Odblokowany przez",
            "unbannedAt": "Odblokowany dnia",
            "active": "Aktywna",
            "expired": "Wygasła",
            "lifted": "Zniesiona",
            "confirmBan": "Czy na pewno chcesz zablokować użytkownika {{username}}?",
            "confirmUnban": "Czy na pewno chcesz odblokować użytkownika {{username}}?",
            "banSuccess": "Użytkownik został zablokowany.",
            "unbanSuccess": "Użytkownik został odblokowany.",
            "cannotBanAdmin": "Nie można zablokować administratora."
          }
        },
        "helpdesk": {
          "title": "Pomoc Techniczna",
          "description": "Zarządzaj zgłoszeniami wsparcia, odpowiadaj użytkownikom i rozwiązuj problemy",
          "noTickets": "Nie znaleziono zgłoszeń.",
          "createdBy": "Utworzone przez",
          "assignee": "Przypisany",
          "unassigned": "Nieprzypisany",
          "lastMessage": "Ostatnia wiadomość",
          "messageCount": "{{count}} wiadomości",
          "status": {
            "OPEN": "Otwarte",
            "IN_PROGRESS": "W toku",
            "AWAITING_USER": "Oczekuje na użytkownika",
            "RESOLVED": "Rozwiązane",
            "CLOSED": "Zamknięte"
          },
          "priority": {
            "LOW": "Niski",
            "MEDIUM": "Średni",
            "HIGH": "Wysoki",
            "URGENT": "Pilny"
          },
          "category": {
            "ACCOUNT_ISSUE": "Problem z kontem",
            "PAYMENT_PROBLEM": "Problem z płatnością",
            "ORDER_DISPUTE": "Spór o zamówienie",
            "TECHNICAL_BUG": "Błąd techniczny",
            "FEATURE_REQUEST": "Propozycja funkcji",
            "SAFETY_CONCERN": "Kwestia bezpieczeństwa",
            "OTHER": "Inne"
          },
          "conversation": {
            "empty": "Brak wiadomości w tym zgłoszeniu.",
            "role": {
              "USER": "Użytkownik",
              "SUPPORT": "Wsparcie"
            }
          },
          "reply": {
            "label": "Odpowiedź",
            "placeholder": "Wpisz odpowiedź...",
            "required": "Treść odpowiedzi jest wymagana.",
            "submit": "Wyślij odpowiedź"
          },
          "assign": {
            "title": "Przypisz zgłoszenie",
            "description": "Wybierz członka zespołu, do którego chcesz przypisać to zgłoszenie.",
            "selectStaff": "Członek zespołu",
            "placeholder": "— Wybierz —",
            "submit": "Przypisz"
          }
        },
        "reports": {
          "title": "Zarządzanie Zgłoszeniami",
          "description": "Przeglądaj i rozwiązuj zgłoszenia przesłane przez użytkowników",
          "noReports": "Nie znaleziono zgłoszeń.",
          "siblingCount": "{{count}} zgłoszeń dla tego elementu",
          "reportedBy": "Zgłoszone przez",
          "card": {
            "unassigned": "Nieprzypisane",
            "assignedTo": "Przypisano do",
            "reportedContent": "Zgłoszona treść",
            "onAd": "w ogłoszeniu {{adId}}",
            "descriptionPreview": "Powód"
          },
          "filters": {
            "search": "Szukaj zgłoszeń...",
            "status": "Status",
            "allStatuses": "Wszystkie statusy",
            "targetType": "Typ obiektu",
            "allTargetTypes": "Wszystkie typy",
            "reason": "Powód",
            "allReasons": "Wszystkie powody"
          },
          "status": {
            "OPEN": "Otwarte",
            "IN_REVIEW": "W trakcie przeglądu",
            "RESOLVED": "Rozwiązane",
            "DISMISSED": "Odrzucone"
          },
          "targetType": {
            "AD": "Ogłoszenie",
            "USER": "Użytkownik",
            "MESSAGE": "Wiadomość",
            "QUESTION": "Pytanie",
            "ANSWER": "Odpowiedź"
          },
          "reason": {
            "SPAM": "Spam",
            "FRAUD": "Oszustwo",
            "INAPPROPRIATE_CONTENT": "Nieodpowiednia treść",
            "COUNTERFEIT": "Podróbka",
            "HARASSMENT": "Nękanie",
            "COPYRIGHT": "Prawa autorskie",
            "WRONG_CATEGORY": "Zła kategoria",
            "OTHER": "Inne"
          },
          "resolution": {
            "CONTENT_REMOVED": "Treść usunięta",
            "USER_WARNED": "Użytkownik ostrzeżony",
            "USER_BANNED": "Użytkownik zablokowany",
            "NO_VIOLATION": "Brak naruszenia",
            "DUPLICATE": "Duplikat",
            "OTHER": "Inne"
          },
          "timeline": {
            "title": "Oś czasu",
            "action": {
              "CREATED": "Zgłoszenie utworzone",
              "ASSIGNED": "Przypisane",
              "STATUS_CHANGED": "Zmiana statusu",
              "NOTE_ADDED": "Dodano notatkę",
              "RESOLVED": "Rozwiązane"
            }
          },
          "actionModal": {
            "title": "Rozwiąż zgłoszenie",
            "resolve": "Rozwiąż",
            "dismiss": "Odrzuć",
            "resolutionLabel": "Rozwiązanie",
            "internalNotes": "Notatki wewnętrzne",
            "internalNotesPlaceholder": "Dodaj opcjonalne notatki wewnętrzne...",
            "submit": "Potwierdź rozwiązanie",
            "resolutionRequired": "Proszę wybrać rozwiązanie."
          }
        }
      },
      "ban": {
        "banner": {
          "message": "Twoje konto zostało ograniczone.",
          "reason": "Powód: {{reason}}",
          "permanent": "To ograniczenie jest permanentne.",
          "temporary": "Pozostały czas:",
          "contactSupport": "Jeśli uważasz, że to błąd, skontaktuj się z pomocą techniczną."
        },
        "restricted": {
          "message": "Ta akcja jest niedostępna, gdy Twoje konto jest ograniczone."
        }
      },
      "notifications": {
        "title": "Powiadomienia",
        "empty": "Brak nowych powiadomień!",
        "emptyCategory": "Brak powiadomień w tej kategorii.",
        "emptyUnread": "Brak nieprzeczytanych powiadomień.",
        "markAllRead": "Oznacz wszystkie jako przeczytane",
        "viewAll": "Zobacz wszystkie powiadomienia",
        "loadMore": "Załaduj więcej",
        "showAllInCategory": "Pokaż wszystkie w tej kategorii →",
        "unreadOnly": "Tylko nieprzeczytane",
        "categories": {
          "all": "Wszystkie",
          "orders": "Zamówienia",
          "messages": "Wiadomości",
          "ads": "Ogłoszenia",
          "qa": "Pytania i odpowiedzi",
          "support": "Wsparcie",
          "account": "Konto"
        },
        "justNow": "Przed chwilą"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;