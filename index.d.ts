// TypeScript type definitions for steamcommunity
// Project: https://github.com/DoctorMcKay/node-steamcommunity
// Powered by impit (https://npmjs.com/package/impit) since v3.51.0

import { Impit } from 'impit';
import SteamID from 'steamid';
import { EventEmitter } from 'events';

// =============================================================================
// SteamCommunityOptions
// =============================================================================

export interface SteamCommunityOptions {
	/** Request timeout in milliseconds (default: 50000) */
	timeout?: number;
	/** Custom User-Agent header (default: latest Chrome UA from @doctormckay/user-agents) */
	userAgent?: string;
	/** Bind HTTP requests to a specific local IP/interface */
	localAddress?: string;
	/**
	 * Proxy URL for all HTTP requests.
	 * impit natively supports: http, https, socks4, socks5.
	 *
	 * @example 'http://user:pass@proxy.example.com:3128'
	 * @example 'socks5://user:pass@proxy.example.com:1080'
	 */
	proxy?: string;
	/**
	 * Inject a custom Impit instance (advanced).
	 * Use for custom TLS fingerprints, HTTP/3, or fine-grained control.
	 */
	impit?: Impit;
}

// =============================================================================
// Enums
// =============================================================================

export enum EResult {
	Invalid = 0, OK = 1, Fail = 2, NoConnection = 3,
	InvalidPassword = 5, LoggedInElsewhere = 6, InvalidProtocolVer = 7, InvalidParam = 8,
	FileNotFound = 9, Busy = 10, InvalidState = 11, InvalidName = 12, InvalidEmail = 13,
	DuplicateName = 14, AccessDenied = 15, Timeout = 16, Banned = 17,
	AccountNotFound = 18, InvalidSteamID = 19, ServiceUnavailable = 20, NotLoggedOn = 21,
	Pending = 22, EncryptionFailure = 23, InsufficientPrivilege = 24, LimitExceeded = 25,
	Revoked = 26, Expired = 27, AlreadyRedeemed = 28, DuplicateRequest = 29,
	AlreadyOwned = 30, IPNotFound = 31, PersistFailed = 32, LockingFailed = 33,
	LogonSessionReplaced = 34, ConnectFailed = 35, HandshakeFailed = 36, IOFailure = 37,
	RemoteDisconnect = 38, ShoppingCartNotFound = 39, Blocked = 40, Ignored = 41,
	NoMatch = 42, AccountDisabled = 43, ServiceReadOnly = 44, AccountNotFeatured = 45,
	AdministratorOK = 46, ContentVersion = 47, TryAnotherCM = 48, PasswordRequiredToKickSession = 49,
	AlreadyLoggedInElsewhere = 50, Suspended = 51, Cancelled = 52, DataCorruption = 53,
	DiskFull = 54, RemoteCallFailed = 55, PasswordUnset = 56, ExternalAccountUnlinked = 57,
	PSNTicketInvalid = 58, ExternalAccountAlreadyLinked = 59, RemoteFileConflict = 60,
	IllegalPassword = 61, SameAsPreviousValue = 62, AccountLogonDenied = 63, CannotUseOldPassword = 64,
	InvalidLoginAuthCode = 65, AccountLogonDeniedNoMail = 66, HardwareNotCapableOfIPT = 67,
	IPTInitError = 68, ParentalControlRestricted = 69, FacebookQueryError = 70, ExpiredLoginAuthCode = 71,
	IPLoginRestrictionFailed = 72, AccountLockedDown = 73, AccountLogonDeniedVerifiedEmailRequired = 74,
	NoMatchingURL = 75, BadResponse = 76, RequirePasswordReEntry = 77, ValueOutOfRange = 78,
	UnexpectedError = 79, Disabled = 80, InvalidCEGSubmission = 81, RestrictedDevice = 82,
	RegionLocked = 83, RateLimitExceeded = 84, AccountLoginDeniedNeedTwoFactor = 85, ItemDeleted = 86,
	AccountLoginDeniedThrottle = 87, TwoFactorCodeMismatch = 88, TwoFactorActivationCodeMismatch = 89,
	AccountAssociatedToMultiplePartners = 90, NotModified = 91, NoMobileDevice = 92, TimeNotSynced = 93,
	SMSCodeFailed = 94, AccountLimitExceeded = 95, AccountActivityLimitExceeded = 96,
	PhoneActivityLimitExceeded = 97, RefundToWallet = 98, EmailSendFailure = 99, NotSettled = 100,
	NeedCaptcha = 101, GSLTDenied = 102, GSOwnerDenied = 103, InvalidItemType = 104, IPBanned = 105,
	GSLTExpired = 106, InsufficientFunds = 107, TooManyPending = 108, NoSiteLicensesFound = 109,
	WGNetworkSendExceeded = 110, AccountNotFriends = 111, LimitedUserAccount = 112, CantRemoveItem = 113,
	AccountHasBeenDeleted = 114, AccountHasAnExistingUserCancelledLicense = 115, DeniedDueToCommunityCooldown = 116,
	NoLauncherSpecified = 117, MustAgreeToSSA = 118, ClientNoLongerSupported = 119,
}

export enum EConfirmationType { Trade = 2, MarketListing = 3 }

export enum EFriendRelationship {
	None = 0, Blocked = 1, RequestRecipient = 2, Friend = 3,
	RequestInitiator = 4, Ignored = 5, IgnoredFriend = 6, SuggestedFriend = 7,
}

export enum ESharedFileType { Screenshot = 0, Artwork = 1, Guide = 2 }

export enum PrivacyState { Private = 1, FriendsOnly = 2, Public = 3 }

export enum ChatState { Offline = 0, LoggingOn = 1, LogOnFailed = 2, LoggedOn = 3 }

export enum PersonaState {
	Offline = 0, Online = 1, Busy = 2, Away = 3, Snooze = 4,
	LookingToTrade = 5, LookingToPlay = 6, Invisible = 7,
}

export enum PersonaStateFlag {
	HasRichPresence = 1, InJoinableGame = 2, Golden = 4, RemotePlayTogether = 8,
	ClientTypeWeb = 256, ClientTypeMobile = 512, ClientTypeTenfoot = 1024, ClientTypeVR = 2048,
	LaunchTypeGamepad = 4096, LaunchTypeCompatTool = 8192,
}

// =============================================================================
// Callback types
// =============================================================================

export type Callback<T = void> = (err: Error | null, result?: T) => void;

export type HttpCallback = (err: Error | null, response: HttpResponse, body: string | Buffer | any) => void;

// =============================================================================
// Data types
// =============================================================================

export interface HttpResponse {
	statusCode: number;
	headers: Record<string, string>;
	body: string | Buffer | any;
	/** Final URL after redirects */
	url: string;
}

export interface LoginDetails {
	accountName: string;
	password: string;
	authCode?: string;
	twoFactorCode?: string;
	captchaGID?: string;
	captchaText?: string;
	disableMobile?: boolean;
}

export interface ConfirmationKey { time: number; key: string; tag?: string }

export interface ProfileEditSettings {
	name?: string;
	realName?: string;
	summary?: string;
	country?: string;
	state?: string;
	city?: string;
	customURL?: string;
	background?: string | Buffer;
	featuredBadge?: number;
	primaryGroup?: SteamID | string;
}

export interface PrivacySettings {
	profile?: PrivacyState | 1 | 2 | 3;
	comments?: PrivacyState | 1 | 2 | 3;
	inventory?: PrivacyState | 1 | 2 | 3;
	inventoryGifts?: boolean;
	gameDetails?: PrivacyState | 1 | 2 | 3;
	playtime?: boolean;
	friendsList?: PrivacyState | 1 | 2 | 3;
}

export interface Notifications {
	trades: number; gameTurns: number; moderatorMessages: number; comments: number;
	items: number; invites: number; gifts: number; chat: number;
	helpRequestReplies: number; accountAlerts: number;
}

export interface InventoryHistoryOptions {
	startTime?: number | Date;
	startTrade?: string;
	direction?: 'past' | 'future';
	resolveVanityURLs?: boolean;
}

export interface TradeHistoryEntry {
	date: Date;
	partnerName: string;
	partnerSteamID: SteamID | null;
	partnerVanityURL: string | null;
	itemsReceived: CEconItem[];
	itemsGiven: CEconItem[];
	onHold: boolean;
}

export interface InventoryHistoryResult {
	trades: TradeHistoryEntry[];
	firstTradeTime?: Date; firstTradeID?: string;
	lastTradeTime?: Date; lastTradeID?: string;
}

export interface TwoFactorSecretResponse {
	shared_secret: string; serial_number: string; revocation_code: string;
	uri: string; server_time: string; account_name: string; token_gid: string;
	identity_secret: string; secret_1: string; status: number;
	phone_number_hint?: string; confirm_type?: number;
}

export interface CreateApiKeyOptions {
	domain: string;
	requestID?: string;
	identitySecret?: string | Buffer;
}

export interface CreateApiKeyResponse {
	confirmationRequired: boolean;
	apiKey?: string;
	finalizeOptions?: CreateApiKeyOptions;
}

export interface MarketSearchOptions {
	appid: number;
	query?: string;
	searchDescriptions?: boolean;
	start?: number;
	count?: number;
	sortColumn?: string;
	sortDir?: string;
}

export interface HttpRequestOptions {
	uri?: string; url?: string;
	method?: string;
	headers?: Record<string, string>;
	/** URL-encoded form body */
	form?: Record<string, string | number>;
	/** Multipart form data (file uploads). File fields: {value: Buffer, options: {filename, contentType}} */
	formData?: Record<string, string | number | { value: Buffer; options: { filename: string; contentType: string } }>;
	/** Raw request body */
	body?: string | Buffer;
	/** Auto JSON-parse response body and set Accept header */
	json?: boolean;
	/** Query string parameters appended to URL */
	qs?: Record<string, string | number | undefined>;
	/** Set false to return 3xx response without following redirects */
	followRedirect?: boolean;
	/** Per-request timeout in ms */
	timeout?: number;
	/** Set to null for raw Buffer response (binary data) */
	encoding?: null;
	checkHttpError?: boolean;
	checkCommunityError?: boolean;
	checkTradeError?: boolean;
	checkJsonError?: boolean;
}

// =============================================================================
// Classes
// =============================================================================

export class CEconItem {
	appid: number; contextid: string; assetid: string; classid: string;
	instanceid: string; amount: number; pos: number; id: string;
	type: string; name: string; market_hash_name: string; market_name: string;
	market_fee_app: number; icon_url: string; icon_url_large: string;
	tradable: boolean; marketable: boolean; commodity: boolean;
	market_tradable_restriction: number; market_marketable_restriction: number;
	descriptions: any[]; tags: any[]; fraudwarnings: any[];

	getImageURL(): string;
	getLargeImageURL(): string;
	getTag(category: string): { internal_name: string; name: string; category: string; color?: string } | null;
}

export class CConfirmation {
	id: string;
	type: EConfirmationType;
	creator: string;
	key: string;
	title: string;
	receiving: string;
	sending: string;
	time: string;
	timestamp: Date;
	icon: string;
	offerID: string | null;

	respond(time: number, key: string | ConfirmationKey, accept: boolean, callback: Callback): void;
	getOfferID(time: number, key: string | ConfirmationKey, callback: (err: Error | null, offerID?: string) => void): void;
}

export class CMarketItem {
	_appid: number;
	_hashName: string;
	commodity: boolean;
	commodityID: string;
	lowestPrice: string;
	buyQuantity: number;
	highestBuyOrder: string;
	quantity: number;
	firstAsset: any;
	assets: any[];
	medianSalePrices: any[];

	updatePrice(currency: number, callback: Callback): void;
}

export class CMarketSearchResult {
	appid: number;
	market_hash_name: string;
	image: string;
	price: number;
	quantity: number;
}

export class CSteamGroup {
	steamID: SteamID;
	name: string; url: string; headline: string; summary: string;
	avatarHash: string;
	members: number; membersInChat: number; membersInGame: number; membersOnline: number;

	getAvatarURL(size?: string, protocol?: string): string;
	getMembers(addresses?: string[], callback?: (err: Error | null, members?: SteamID[]) => void): void;
	join(callback: Callback): void;
	leave(callback: Callback): void;
	getAllAnnouncements(time?: Date, callback?: (err: Error | null, announcements?: any[]) => void): void;
	postAnnouncement(headline: string, content: string, hidden?: boolean, callback?: Callback): void;
	editAnnouncement(announcementID: any, headline: string, content: string, callback?: Callback): void;
	deleteAnnouncement(announcementID: any, callback?: Callback): void;
	scheduleEvent(name: string, type: any, description: string, time: Date | null, server?: any, callback?: Callback): void;
	editEvent(id: any, name: string, type: any, description: string, time: Date | null, server?: any, callback?: Callback): void;
	deleteEvent(id: any, callback?: Callback): void;
	setPlayerOfTheWeek(steamID: SteamID | string, callback?: Callback): void;
	kick(steamID: SteamID | string, callback?: Callback): void;
	getHistory(page?: number, callback?: (err: Error | null, history?: any) => void): void;
	getAllComments(from: number, count: number, callback?: (err: Error | null, comments?: any[]) => void): void;
	deleteComment(cid: any, callback?: Callback): void;
	comment(message: string, callback?: Callback): void;
	getJoinRequests(callback?: (err: Error | null, requests?: SteamID[]) => void): void;
	respondToJoinRequests(steamIDs: SteamID | string | Array<SteamID | string>, approve: boolean, callback?: Callback): void;
	respondToAllJoinRequests(approve: boolean, callback?: Callback): void;
}

export class CSteamSharedFile {
	id: string;
	type: ESharedFileType;
	appID: number;
	owner: SteamID | null;
	fileSize: number;
	postDate: Date;
	resolution: string;
	uniqueVisitorsCount: number;
	favoritesCount: number;
	upvoteCount: number;
	guideNumRatings: number;
	isUpvoted: boolean;
	isDownvoted: boolean;

	deleteComment(cid: string, callback?: Callback): void;
	favorite(callback?: Callback): void;
	comment(message: string, callback?: Callback): void;
	subscribe(callback?: Callback): void;
	unfavorite(callback?: Callback): void;
	unsubscribe(callback?: Callback): void;
}

export class CSteamUser {
	steamID: SteamID;
	name: string;
	onlineState: string;
	stateMessage: string;
	privacyState: string;
	visibilityState: number;
	avatarHash: string;
	vacBanned: boolean;
	tradeBanState: string;
	isLimitedAccount: boolean;
	customURL: string | null;
	memberSince: string;
	location: string | null;
	realName: string | null;
	summary: string | null;
	groups: SteamID[] | null;
	primaryGroup: SteamID | null;

	getAvatarURL(size?: string, protocol?: string): string;
	addFriend(callback: Callback): void;
	acceptFriendRequest(callback: Callback): void;
	removeFriend(callback: Callback): void;
	blockCommunication(callback: Callback): void;
	unblockCommunication(callback: Callback): void;
	comment(message: string, callback: (err: Error | null, commentID?: string) => void): void;
	deleteComment(commentID: any, callback: Callback): void;
	getComments(options?: { start?: number; count?: number }, callback?: (err: Error | null, comments?: any[], totalCount?: number) => void): void;
	inviteToGroup(groupID: any, callback: Callback): void;
	follow(callback: Callback): void;
	unfollow(callback: Callback): void;
	getAliases(callback: (err: Error | null, aliases?: any[]) => void): void;
	getInventoryContexts(callback: (err: Error | null, data?: any) => void): void;
	/** @deprecated Use getInventoryContents instead */
	getInventory(appID: number, contextID: number, tradableOnly: boolean, callback: (err: Error | null, inventory?: CEconItem[], currency?: CEconItem[]) => void): void;
	getInventoryContents(appID: number, contextID: number, tradableOnly: boolean, language?: string, callback?: (err: Error | null, inventory?: CEconItem[], currency?: CEconItem[], totalCount?: number) => void): void;
	getProfileBackground(callback: (err: Error | null, url?: string | null) => void): void;
	sendImage(imageContentsBuffer: Buffer, options?: { spoiler?: boolean }, callback?: (err: Error | null, url?: string) => void): void;
}

// =============================================================================
// SteamCommunity
// =============================================================================

export class SteamCommunity extends EventEmitter {
	constructor(options?: SteamCommunityOptions | string);

	// --- Static enums ---
	static SteamID: typeof SteamID;
	static EResult: typeof EResult;
	static EConfirmationType: typeof EConfirmationType;
	static EFriendRelationship: typeof EFriendRelationship;
	static ESharedFileType: typeof ESharedFileType;
	static PrivacyState: typeof PrivacyState;
	static ChatState: typeof ChatState;
	static PersonaState: typeof PersonaState;
	static PersonaStateFlag: typeof PersonaStateFlag;

	// --- Instance properties ---
	steamID: SteamID | null;
	chatState: number;
	_impit: Impit;

	// === Auth ===
	/** @deprecated Use steam-user webSession + setCookies instead */
	login(details: LoginDetails, callback: (err: Error | null, sessionID?: string, cookies?: string[], steamguard?: string, oAuthToken?: string) => void): void;
	oAuthLogin(steamguard: string, token: string, callback: (err: Error | null, sessionID?: string, cookies?: string[]) => void): void;
	getClientLogonToken(callback: (err: Error | null, result?: { steamID: SteamID; accountName: string; webLogonToken: string }) => void): void;
	setCookies(cookies: string[]): void;
	getSessionID(host?: string): string;
	loggedIn(callback: (err: Error | null, loggedIn: boolean, familyView: boolean) => void): void;
	parentalUnlock(pin: string, callback: Callback): void;

	// === Profile ===
	setupProfile(callback: Callback): void;
	editProfile(settings: ProfileEditSettings, callback: Callback): void;
	profileSettings(settings: PrivacySettings, callback: Callback): void;
	uploadAvatar(image: Buffer | string, format?: string, callback?: (err: Error | null, url?: string) => void): void;
	postProfileStatus(statusText: string, options?: { appID?: number }, callback?: (err: Error | null, postID?: string) => void): void;
	deleteProfileStatus(postID: number, callback?: Callback): void;
	getTradeURL(callback: (err: Error | null, url?: string, token?: string) => void): void;
	changeTradeURL(callback: (err: Error | null, url?: string, token?: string) => void): void;
	clearPersonaNameHistory(callback: Callback): void;
	getFriendsList(callback: (err: Error | null, friends?: Record<string, EFriendRelationship>) => void): void;
	getNotifications(callback: (err: Error | null, notifications?: Notifications) => void): void;
	resetItemNotifications(callback: Callback): void;

	// === Users ===
	getSteamUser(id: SteamID | string, callback: (err: Error | null, user?: CSteamUser) => void): void;
	/** @deprecated Use getSteamUser + getInventoryContents */
	getUserInventory(steamID: SteamID | string, appID: number, contextID: number, tradableOnly: boolean, callback: (err: Error | null, inventory?: CEconItem[], currency?: CEconItem[]) => void): void;
	getUserInventoryContents(steamID: SteamID | string, appID: number, contextID: number, tradableOnly: boolean, language?: string, callback?: (err: Error | null, inventory?: CEconItem[], currency?: CEconItem[], totalCount?: number) => void): void;
	getUserInventoryContexts(userID?: SteamID | string, callback?: (err: Error | null, data?: any) => void): void;
	/** @deprecated Use GetTradeHistory API */
	getInventoryHistory(options: InventoryHistoryOptions | ((err: Error | null, result?: InventoryHistoryResult) => void), callback?: (err: Error | null, result?: InventoryHistoryResult) => void): void;

	// === Market ===
	getMarketApps(callback: (err: Error | null, apps?: Record<string, string>) => void): void;
	getMarketItem(appid: number, hashName: string, currency?: number, callback?: (err: Error | null, item?: CMarketItem) => void): void;
	marketSearch(options: string | MarketSearchOptions, callback: (err: Error | null, results?: CMarketSearchResult[]) => void): void;
	getGemValue(appid: number, assetid: number | string, callback: (err: Error | null, result?: { promptTitle: string; gemValue: number }) => void): void;
	turnItemIntoGems(appid: number, assetid: number | string, expectedGemsValue: number, callback: (err: Error | null, result?: { gemsReceived: number; totalGems: number }) => void): void;
	openBoosterPack(appid: number, assetid: number | string, callback: (err: Error | null, rgItems?: CEconItem[]) => void): void;
	getBoosterPackCatalog(callback: (err: Error | null, result?: { totalGems: number; tradableGems: number; untradableGems: number; catalog: any[] }) => void): void;
	createBoosterPack(appid: number, useUntradableGems?: boolean, callback?: (err: Error | null, result?: any) => void): void;
	getGiftDetails(giftID: string, callback: (err: Error | null, details?: { giftName: string; packageID: number; owned: boolean }) => void): void;
	redeemGift(giftID: string, callback: Callback): void;
	packGemSacks(assetid: any, desiredSackCount: number, callback: Callback): void;
	unpackGemSacks(assetid: any, sacksToUnpack: number, callback: Callback): void;

	// === Groups ===
	getSteamGroup(id: SteamID | string, callback: (err: Error | null, group?: CSteamGroup) => void): void;
	getGroupMembers(gid: any, callback: (err: Error | null, members?: SteamID[]) => void, members?: SteamID[], link?: string, addresses?: string[], addressIdx?: number): void;
	getGroupMembersEx(gid: any, addresses: string[], callback: (err: Error | null, members?: SteamID[]) => void): void;
	joinGroup(gid: SteamID | string, callback: Callback): void;
	leaveGroup(gid: SteamID | string, callback: Callback): void;

	// === Confirmations ===
	getConfirmations(time: number, key: string | ConfirmationKey, callback: (err: Error | null, confirmations?: CConfirmation[]) => void): void;
	getConfirmationOfferID(confID: number, time: number, key: string, callback: (err: Error | null, offerID?: string | null) => void): void;
	respondToConfirmation(confID: number | number[], confKey: string | string[], time: number, key: string | ConfirmationKey, accept: boolean, callback: Callback): void;
	acceptConfirmationForObject(identitySecret: string, objectID: number | string, callback: Callback): void;
	acceptAllConfirmations(time: number, confKey: string, allowKey: string, callback: (err: Error | null, confirmations?: CConfirmation[]) => void): void;
	startConfirmationChecker(pollInterval: number, identitySecret?: string | Buffer): void;
	stopConfirmationChecker(): void;
	checkConfirmations(): void;
	acknowledgeTradeProtection(callback: Callback): void;

	// === Two-Factor ===
	enableTwoFactor(callback: (err: Error | null, response?: TwoFactorSecretResponse) => void): void;
	finalizeTwoFactor(sharedSecret: string, activationCode: string, callback: Callback): void;
	disableTwoFactor(revocationCode: string, callback: (err: Error | null, result?: { status: EResult }) => void): void;

	// === WebAPI ===
	getWebApiKey(unused: any, callback: (err: Error | null, key?: string | null) => void): void;
	createWebApiKey(options: CreateApiKeyOptions, callback: (err: Error | null, response?: CreateApiKeyResponse) => void): void;
	/** @deprecated Always fails — use steam-session or getWebApiKey instead */
	getWebApiOauthToken(callback: (err: Error | null, token?: string) => void): void;
	setMobileAppAccessToken(token: string): void;

	// === Shared Files ===
	getSteamSharedFile(sharedFileId: string, callback: (err: Error | null, file?: CSteamSharedFile) => void): void;

	// === Help ===
	restorePackage(packageID: number | string, callback: Callback): void;
	removePackage(packageID: number | string, callback: Callback): void;

	// === Chat (deprecated — use steam-user) ===
	/** @deprecated Use steam-user for chat */
	chatLogon(interval?: number, uiMode?: string): void;
	/** @deprecated Use steam-user for chat */
	chatLogoff(): void;
	/** @deprecated Use steam-user for chat */
	chatMessage(recipient: SteamID | string, text: string, type?: string, callback?: Callback): void;

	// === User actions (forwarded from CSteamUser / CSteamGroup) ===
	addFriend(userID: SteamID | string, callback: Callback): void;
	acceptFriendRequest(userID: SteamID | string, callback: Callback): void;
	removeFriend(userID: SteamID | string, callback: Callback): void;
	blockCommunication(userID: SteamID | string, callback: Callback): void;
	unblockCommunication(userID: SteamID | string, callback: Callback): void;
	postUserComment(userID: SteamID | string, message: string, callback: (err: Error | null, commentID?: string) => void): void;
	deleteUserComment(userID: SteamID | string, commentID: any, callback: Callback): void;
	getUserComments(userID: SteamID | string, options?: { start?: number; count?: number }, callback?: (err: Error | null, comments?: any[], totalCount?: number) => void): void;
	inviteUserToGroup(userID: SteamID | string, groupID: any, callback: Callback): void;
	followUser(userID: SteamID | string, callback: Callback): void;
	unfollowUser(userID: SteamID | string, callback: Callback): void;
	getUserAliases(userID: SteamID | string, callback: (err: Error | null, aliases?: any[]) => void): void;
	getUserProfileBackground(userID: SteamID | string, callback: (err: Error | null, url?: string | null) => void): void;
	sendImageToUser(userID: SteamID | string, imageContentsBuffer: Buffer, options?: { spoiler?: boolean }, callback?: (err: Error | null, url?: string) => void): void;

	// === HTTP (powered by impit) ===
	httpRequest(uri: string | HttpRequestOptions, options?: HttpRequestOptions | HttpCallback, callback?: HttpCallback, source?: string): void;
	httpRequestGet(uri: string | HttpRequestOptions, options?: HttpRequestOptions | HttpCallback, callback?: HttpCallback, source?: string): void;
	httpRequestPost(uri: string | HttpRequestOptions, options?: HttpRequestOptions | HttpCallback, callback?: HttpCallback, source?: string): void;

	// === Events ===
	on(event: 'sessionExpired', listener: (err: Error) => void): this;
	on(event: 'debug', listener: (message: string) => void): this;
	on(event: 'confKeyNeeded', listener: (tag: string, callback: (err: Error | null, time?: number, key?: string) => void) => void): this;
	on(event: 'newConfirmation', listener: (conf: CConfirmation) => void): this;
	on(event: 'confirmationAccepted', listener: (conf: CConfirmation) => void): this;
	on(event: 'chatLoggedOn', listener: () => void): this;
	on(event: 'chatLogOnFailed', listener: (err: Error, fatal: boolean) => void): this;
	on(event: 'chatLoggedOff', listener: () => void): this;
	on(event: 'chatMessage', listener: (sender: SteamID, text: string) => void): this;
	on(event: 'chatTyping', listener: (sender: SteamID) => void): this;
	on(event: 'chatPersonaState', listener: (steamID: SteamID, persona: any) => void): this;
	on(event: 'postHttpRequest', listener: (requestID: number, source: string, options: HttpRequestOptions, error: Error | null, response: HttpResponse | null, body: any, flags: { hasCallback: boolean; httpError: any; communityError: any; tradeError: any; jsonError: any }) => void): this;
	on(event: string, listener: (...args: any[]) => void): this;

	emit(event: 'sessionExpired', err: Error): boolean;
	emit(event: 'debug', message: string): boolean;
	emit(event: 'confKeyNeeded', tag: string, callback: (err: Error | null, time?: number, key?: string) => void): boolean;
	emit(event: 'newConfirmation', conf: CConfirmation): boolean;
	emit(event: 'confirmationAccepted', conf: CConfirmation): boolean;
	emit(event: 'chatLoggedOn'): boolean;
	emit(event: 'chatLogOnFailed', err: Error, fatal: boolean): boolean;
	emit(event: 'chatLoggedOff'): boolean;
	emit(event: 'chatMessage', sender: SteamID, text: string): boolean;
	emit(event: 'chatTyping', sender: SteamID): boolean;
	emit(event: 'chatPersonaState', steamID: SteamID, persona: any): boolean;
	emit(event: 'postHttpRequest', requestID: number, source: string, options: HttpRequestOptions, error: Error | null, response: HttpResponse | null, body: any, flags: any): boolean;
	emit(event: string, ...args: any[]): boolean;
}

// =============================================================================
// Standalone Helpers (from components/helpers.js)
// =============================================================================

export function isSteamID(input: any): boolean;
export function decodeSteamTime(time: string): Date;
export function eresultError(eresult: number): Error | null;
export function decodeJwt(jwt: string): any;
export function resolveVanityURL(url: string, callback: (err: Error | null, result?: { vanityURL: string; steamID: string }) => void): void;
export function steamID(input: SteamID | string): SteamID;

// =============================================================================
// Module Export
// =============================================================================

declare const SteamCommunity: {
	new(options?: SteamCommunityOptions | string): InstanceType<typeof _SteamCommunity>;
	SteamID: typeof SteamID;
	EResult: typeof EResult;
	EConfirmationType: typeof EConfirmationType;
	EFriendRelationship: typeof EFriendRelationship;
	ESharedFileType: typeof ESharedFileType;
	PrivacyState: typeof PrivacyState;
	ChatState: typeof ChatState;
	PersonaState: typeof PersonaState;
	PersonaStateFlag: typeof PersonaStateFlag;
};

declare const _SteamCommunity: typeof import('./index').SteamCommunity;

export default SteamCommunity;
