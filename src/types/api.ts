export type CurrencyType = 'FIAT' | 'CRYPTO';

export interface CurrencyDto {
  code: string;
  name: string;
  type: CurrencyType;
  decimalPlaces: number;
}

export type Currency = string;

export interface CurrencyAmountDto {
  amount: number;
  currency: Currency;
}

export interface Point {
  latitude: number;
  longitude: number;
}

export interface LocationDto {
  cityId?: string;
  point?: Point;
}

export interface CityDetailsDto {
  id: string;
  name: string;
  countryCode: string;
  adminDivision?: string;
  region?: string;
  district?: string;
}

export interface LocationWithCityDetailsDto {
  city?: CityDetailsDto;
  point?: [number, number];
}

export interface CountryDto {
  code: string;
  name: string;
}

export type PricingMode = 'FIXED_CRYPTO' | 'PEGGED';

// Seller view — returned by /sales/ads endpoints
export interface AdDto {
  id: string;
  userId: string;
  title: string;
  description?: string;
  pricingMode: PricingMode;
  price?: CurrencyAmountDto;
  fixedPrices?: CurrencyAmountDto[];
  settlementCurrencies: string[];
  volatilityProtection: boolean;
  frozenCurrencies: string[];
  isBuyable: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  location?: LocationWithCityDetailsDto;
  categoryId?: number;
  categoryPath?: CategoryPathElementDto[];
  mediaPaths?: string[];
  mainPhotoPath?: string;
  stock: number;
  lockedStock: number;
  availableStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface PreferredPricesDto {
  currency: string;
  prices: Record<string, number>;
}

// Buyer discovery preview — returned by /ads/ search
export interface AdDiscoveryPreviewDto {
  id: string;
  title: string;
  pricingMode?: PricingMode;
  price?: CurrencyAmountDto;
  settlementCurrencies?: string[];
  settlementPrices?: CurrencyAmountDto[];
  preferredPrice?: CurrencyAmountDto;
  preferredPrices?: PreferredPricesDto;
  mainPhotoPath?: string;
  categoryId?: number;
  categoryPath?: CategoryPathElementDto[];
  location?: LocationWithCityDetailsDto;
  frozenCurrencies?: string[];
  isBuyable?: boolean;
  isWatched?: boolean;
}

/** @deprecated Use AdDiscoveryPreviewDto for buyer views, AdDto for seller views */
export interface AdPreviewDto {
  id: string;
  title: string;
  price?: CurrencyAmountDto;
  preferredPrice?: CurrencyAmountDto;
  mainPhotoPath?: string;
  location?: LocationWithCityDetailsDto;
  status?: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'DELETED';
  createdAt?: string;
  stock?: number;
  availableStock?: number;
}

export interface CategoryPathElementDto {
  id: number;
  name: string;
}

export interface CategoryTreeDto {
  id: number;
  name: string;
  slug: string;
  hasChildren: boolean;
  children?: CategoryTreeDto[];
}

export interface CategorySuggestionDto {
  id: number;
  path: CategoryPathElementDto[];
  displayPath: string;
}

export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';

export interface AdAttributeDto {
  label: string;
  value: string;
}

export interface ShippingDetailsDto {
  methods: string[];
  estimatedDelivery?: string;
  origin?: string;
}

export interface AdStatsDto {
  viewsCount: number;
  watchersCount: number;
  lastPurchasedAt?: string;
}

// Buyer discovery details — returned by /ads/{id}
export interface AdDiscoveryDetailsDto {
  id: string;
  title: string;
  description?: string;
  location?: LocationWithCityDetailsDto;
  pricingMode?: PricingMode;
  price?: CurrencyAmountDto;
  settlementCurrencies?: string[];
  settlementPrices?: CurrencyAmountDto[];
  preferredPrice?: CurrencyAmountDto;
  preferredPrices?: PreferredPricesDto;
  categoryId?: number;
  categoryPath?: CategoryPathElementDto[];
  mediaPaths?: string[];
  mainPhotoPath?: string;
  availableStock?: number;
  user?: UserSpaceDetailsDto;
  otherAds?: AdDiscoveryPreviewDto[];
  stats?: AdDiscoveryStatsDto;
  frozenCurrencies?: string[];
  isBuyable?: boolean;
  isWatched?: boolean;
  userCanPurchase?: boolean;
}

export interface AdDiscoveryStatsDto {
  viewsCount: number;
  watchersCount?: number;
  lastPurchasedAt?: string;
}

/** @deprecated Use AdDiscoveryDetailsDto for buyer views, AdDto for seller views */
export interface AdDetailsDto {
  id: string;
  title: string;
  description?: string;
  location?: LocationWithCityDetailsDto;
  price?: CurrencyAmountDto;
  preferredPrice?: CurrencyAmountDto;
  categoryId?: number;
  categoryPath?: CategoryPathElementDto[];
  mediaPaths?: string[];
  mainPhotoPath?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'DELETED';
  user?: UserSpaceDetailsDto;
  createdAt?: string;
  updatedAt?: string;
  stock?: number;
  availableStock?: number;
  lockedStock?: number;
  otherAds?: AdPreviewDto[];
  
  // Mocked fields for overhaul
  condition?: ItemCondition;
  attributes?: AdAttributeDto[];
  shipping?: ShippingDetailsDto;
  stats?: AdStatsDto;
  isFavorite?: boolean;
  userCanPurchase?: boolean;
}

export interface CreateAdRequestDto {
  title: string;
}

export interface UpdateAdRequestDto {
  title?: string;
  description?: string;
  pricingMode?: PricingMode;
  price?: number;
  priceCurrency?: string;
  fixedPrices?: Record<string, number>;
  settlementCurrencies?: string[];
  volatilityProtection?: boolean;
  location?: LocationDto;
  mediaPaths?: string[];
  mainPhotoPath?: string;
  stock?: number;
  categoryId?: number;
}

export interface RegisterRequestDto {
  username: string;
  password?: string;
  email: string;
  countryOfResidence?: string;
}

export interface LoginRequestDto {
  username: string;
  password?: string;
  deviceId?: string;
}

export interface VerifyUserRequestDto {
  code: string;
  deviceId?: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
  deviceId: string;
}

export interface LogoutRequestDto {
  refreshToken: string;
}

export interface CurrencyInfoDto {
  code: string;
  name: string;
}

export interface AllowedCurrenciesDto {
  settlementCurrencies: CurrencyInfoDto[];
  referenceCurrencies: CurrencyInfoDto[];
}

export interface VolatilityStatusDto {
  currency: string;
  isVolatile: boolean;
  isStale: boolean;
  startTime?: string;
  cooldownEndsAt?: string;
  currentDropPct?: number;
  maxPriceInWindow?: number;
}

export interface AvailabilityStatusResponseDto {
  available: boolean;
}

export interface MediaUploadResponseDto {
  id: string;
  filename: string;
  extension: string;
  dateTime: string;
  path: string;
  xsThumbPath: string;
  smThumbPath: string;
  mdThumbPath: string;
}

export interface CitySuggestionDto {
  id: string;
  name: string;
  countryCode: string;
  region?: string;
  district?: string;
  population?: number;
  latitude?: number;
  longitude?: number;
}

export interface CityDto {
  id: string;
  name: string;
  countryCode: string;
  adminDivision?: string;
  region?: string;
  district?: string;
  population?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface PirateChainTransaction {
  txid: string;
  memo?: string;
  amount: number;
  confirmations: number;
  zAddress: string;
}

export type YCashTransaction = PirateChainTransaction;

export interface CryptoTransactionDto {
  txid: string;
  amount: number;
  confirmations: number;
  currency: string;
  timestamp: string;
  memo?: string;
  address: string;
  explorerUrl?: string;
}

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PageAdPreviewDto {
  content: AdPreviewDto[];
  page: PageMetadata;
}

export interface PageAdDiscoveryPreviewDto {
  content: AdDiscoveryPreviewDto[];
  page: PageMetadata;
}

export interface PageAdDto {
  content: AdDto[];
  page: PageMetadata;
}

export interface FieldErrorDto {
  field: string;
  message: string;
}

export interface StatusResponseDto {
  success: boolean;
  status: string;
  message?: string;
  data?: unknown;
  fieldErrors?: FieldErrorDto[];
}

export interface IdentityVerificationResponse {
  success: boolean;
  status?: string;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface UserPreferencesDto {
  language: string;
  preferredCurrency: string;
  countryOfResidence?: string;
}

export interface UpdateUserPreferencesRequestDto {
  language?: string;
  preferredCurrency?: string;
  countryOfResidence?: string;
}

export interface FetchAdsRequestDto {
  t?: string;
  cty?: string;
  cat?: number;
  x?: number;
  y?: number;
  r?: number;
  minp?: number;
  maxp?: number;
  by?: 'CREATED_DATE' | 'PRICE';
  dir?: 'ASC' | 'DESC';
  p?: number;
}

export type PurchaseStatus = 'CREATED' | 'AWAITING_PAYMENT' | 'COMPLETE' | 'FAILED_PAYMENT_TIMEOUT' | 'FAILED_PAYMENT_UNDERPAID' | 'CANCELLED';

export type StatsPeriod = 'DAILY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';

export type PurchaseSortField = 'DATE' | 'AMOUNT';

export type SortDirection = 'ASC' | 'DESC';

export interface PurchaseItemRequestDto {
  adId: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseRequestDto {
  items: PurchaseItemRequestDto[];
  currency: Currency;
  deliveryAddressId: string;
}

export interface PaymentDetailsDto {
  address: string;
  amount: number;
  paidAmount: number;
  memo: string;
  deadline: string;
  qrCodeUri: string;
}

export interface PurchaseResponseDto {
  purchaseId: string;
  status: PurchaseStatus;
  payment: PaymentDetailsDto;
  currency: Currency;
}

export interface PurchaseStatusResponseDto {
  purchaseId: string;
  status: PurchaseStatus;
  paymentStatus: string;
  paymentDeadline?: string;
  totalAmount?: number;
  paidAmount?: number;
}

// --- User summary (replaces BuyerInfoDto / SellerInfoDto) ---

export interface UserSummaryDto {
  username: string;
  avatarUrl?: string;
}

/** @deprecated Use UserSummaryDto */
export interface SellerInfoDto {
  id: string;
  username: string;
}

/** @deprecated Use UserSummaryDto */
export interface BuyerInfoDto {
  id: string;
  username: string;
}

// --- Order item DTOs ---

export interface SalesOrderItemDto {
  adId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderItemDetailDto {
  adId: string;
  title: string;
  thumbnailPath?: string;
  quantity: number;
  unitPrice: number;
}

// --- Status history ---

export interface StatusChangeDto {
  status: string;
  timestamp: string;
}

// --- Payment summary ---

export interface PaymentSummaryDto {
  amount: number;
  paidAmount: number;
  address: string;
  memo: string;
  deadline: string;
  qrCodeUri: string;
}

// --- Delivery address snapshot ---

export interface DeliveryAddressSnapshotDto {
  name: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

// --- Sales stats ---

export interface SalesStatsDto {
  revenue: CurrencyAmountDto[];
  activeOrdersCount: number;
  completedOrdersCount: number;
  totalAdsCount: number;
  activeAdsCount: number;
  period: StatsPeriod;
}

// --- Sales ad with stats ---

export interface SalesAdDto extends AdDto {
  viewsCount: number;
  ordersCount: number;
}

export interface PageSalesAdDto {
  content: SalesAdDto[];
  page: PageMetadata;
}

// --- Sales order (list view, enhanced) ---

export interface SalesOrderDto {
  id: string;
  status: PurchaseStatus;
  paymentStatus?: string;
  createdAt: string;
  totalAmount: number;
  currency: string;
  items: SalesOrderItemDto[];
  buyer: UserSummaryDto;
  primaryThumbnailPath?: string;
  itemCount: number;
  deliveryAddress?: DeliveryAddressSnapshotDto;
}

export interface PageSalesOrderDto {
  content: SalesOrderDto[];
  page: PageMetadata;
}

// --- Sales order detail ---

export interface SalesOrderDetailDto {
  id: string;
  buyer: UserSummaryDto;
  items: OrderItemDetailDto[];
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus?: string;
  deliveryAddress?: DeliveryAddressSnapshotDto;
  statusHistory: StatusChangeDto[];
  cryptoTransactions: CryptoTransactionDto[];
  createdAt: string;
}

// --- Purchase history (list view, enhanced) ---

export interface PurchaseHistoryDto {
  id: string;
  status: PurchaseStatus;
  paymentStatus?: string;
  createdAt: string;
  totalAmount: number;
  currency: string;
  items: SalesOrderItemDto[];
  seller: UserSummaryDto;
  primaryThumbnailPath?: string;
  itemCount: number;
  deliveryAddress?: DeliveryAddressSnapshotDto;
}

export interface PagePurchaseHistoryDto {
  content: PurchaseHistoryDto[];
  page: PageMetadata;
}

// --- Purchase detail ---

export interface PurchaseDetailDto {
  id: string;
  seller: UserSummaryDto;
  items: OrderItemDetailDto[];
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus?: string;
  deliveryAddress?: DeliveryAddressSnapshotDto;
  payment?: PaymentSummaryDto;
  statusHistory: StatusChangeDto[];
  cryptoTransactions: CryptoTransactionDto[];
  createdAt: string;
}

export interface UserSpaceDetailsDto {
  userId: string;
  username: string;
  avatarUrl?: string;
  presence?: UserPresenceDto;
  memberSince?: number;
}

export interface UserSpaceDto {
  user: UserSpaceDetailsDto;
  ads: PageAdPreviewDto;
  presence?: UserPresenceDto;
}

export interface UserProfileDto {
  userId: string;
  avatarUrl: string;
  updatedAt: number;
}

export type PresenceStatus = 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';

export interface UserPresenceDto {
  userId: string;
  lastSeenAt: number;
  status: PresenceStatus;
  customStatus?: string;
}

export interface UpdateUserPresenceRequestDto {
  status: PresenceStatus;
  customStatus?: string;
}

export interface SessionInitResponseDto {
  accessToken: string;
  userProfile: UserProfileDto | null;
  preferredCurrency?: string;
  countryOfResidence?: string;
  publicChatId?: string;
  /** Whether the user is currently banned (from banStatus decorator) */
  banned?: boolean;
  /** Admin-provided ban reason (epoch micros timestamps) */
  banReason?: string;
  /** When the ban was applied — epoch microseconds */
  bannedAt?: number;
  /** When the ban expires — epoch microseconds (null/undefined = permanent) */
  bannedUntil?: number | null;
}

export interface ExchangeRateDto {
  baseCurrency: Currency;
  quoteCurrency: Currency;
  rate: number;
  updatedAt: string;
  source: string;
  isVolatile: boolean;
}

export interface ConversionStepDto {
  baseCurrency: Currency;
  quoteCurrency: Currency;
  rate: number;
  sourceExchangeRate: ExchangeRateDto;
}

export interface ConversionResultDto {
  targetAmount: number;
  from: Currency;
  to: Currency;
  steps: ConversionStepDto[];
  updatedAt: string;
  isVolatile: boolean;
}

// Change Password
export interface ChangePasswordRequestDto {
  oldPassword: string;
  newPassword: string;
}

// Delivery Addresses
export interface DeliveryAddressDto {
  id: string;
  name: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface AddDeliveryAddressRequestDto {
  name: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
}

// Avatar
export interface UpdateAvatarRequestDto {
  avatarUrl: string;
}

// Ad Visit Stats
export interface AdVisitStatsDto {
  daily: Record<string, number>;
  monthly: number;
  yearly: number;
  total: number;
}

// Conversations
export interface ConversationListResponseDto {
  conversations: import('../chat/types').ConversationDto[];
  hasMore: boolean;
}
