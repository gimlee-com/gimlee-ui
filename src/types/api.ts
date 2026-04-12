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
  country: string;
  district?: string;
  adm1?: string;
  adm2?: string;
}

export interface LocationWithCityDetailsDto {
  city?: CityDetailsDto;
  point?: Point;
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
  settlementCurrencies: string[];
  volatilityProtection: boolean;
  frozenCurrencies: string[];
  isBuyable: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  location?: LocationWithCityDetailsDto;
  categoryId?: number;
  mediaPaths?: string[];
  mainPhotoPath?: string;
  stock: number;
  lockedStock: number;
  availableStock: number;
  createdAt: string;
  updatedAt: string;
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
}

export interface VerifyUserRequestDto {
  code: string;
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

export interface CitySuggestion {
  city: CityDetailsDto;
  score: number;
}

export interface PirateChainTransaction {
  txid: string;
  memo?: string;
  amount: number;
  confirmations: number;
  zAddress: string;
}

export type YCashTransaction = PirateChainTransaction;

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

export type PurchaseStatus = 'AWAITING_PAYMENT' | 'COMPLETE' | 'FAILED_PAYMENT_TIMEOUT' | 'FAILED_PAYMENT_UNDERPAID' | 'CANCELLED';

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

export interface SellerInfoDto {
  id: string;
  username: string;
}

export interface SalesOrderItemDto {
  adId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface BuyerInfoDto {
  id: string;
  username: string;
}

export interface SalesOrderDto {
  id: string;
  status: PurchaseStatus;
  paymentStatus: string;
  createdAt: string;
  totalAmount: number;
  currency: string;
  items: SalesOrderItemDto[];
  buyer: BuyerInfoDto;
}

export interface PageSalesOrderDto {
  content: SalesOrderDto[];
  page: PageMetadata;
}

export interface PurchaseHistoryDto {
  id: string;
  status: PurchaseStatus;
  paymentStatus: string;
  createdAt: string;
  totalAmount: number;
  currency: string;
  items: SalesOrderItemDto[];
  seller: SellerInfoDto;
}

export interface PagePurchaseHistoryDto {
  content: PurchaseHistoryDto[];
  page: PageMetadata;
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
