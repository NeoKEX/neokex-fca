declare module 'neokex-fca' {
  export interface Credentials {
    email?: string;
    password?: string;
    appState?: AppState;
  }

  export type AppState = 
    | Array<{ key: string; value: string } | { name: string; value: string }>
    | string
    | { [key: string]: string };

  export interface Options {
    selfListen?: boolean;
    selfListenEvent?: any;
    listenEvents?: boolean;
    listenTyping?: boolean;
    updatePresence?: boolean;
    forceLogin?: boolean;
    autoMarkDelivery?: boolean;
    autoMarkRead?: boolean;
    autoReconnect?: boolean;
    online?: boolean;
    emitReady?: boolean;
    userAgent?: string;
    randomUserAgent?: boolean;
    proxy?: string;
    bypassRegion?: string;
    pageID?: string;
    logging?: boolean;
  }

  export interface MessageInfo {
    threadID: string;
    messageID: string;
    timestamp: number;
  }

  export interface Message {
    body?: string;
    attachment?: any | any[];
    url?: string;
    sticker?: string;
    emoji?: string;
    emojiSize?: 'small' | 'medium' | 'large';
    mentions?: Array<{
      tag: string;
      id: string;
      fromIndex?: number;
    }>;
    location?: {
      latitude: number;
      longitude: number;
      current?: boolean;
    };
  }

  export interface MessageEvent {
    type: 'message';
    senderName: string;
    senderID: string;
    participantNames: string[];
    participantIDs: string[];
    body: string;
    threadID: string;
    threadName: string;
    location: any | null;
    messageID: string;
    attachments: Attachment[];
    timestamp: number;
    tags: any[];
    reactions: any[];
    isUnread: boolean;
    isGroup: boolean;
    pageID?: string;
  }

  export interface TypingEvent {
    type: 'typ';
    isTyping: boolean;
    from: string;
    threadID: string;
    fromMobile: boolean;
    userID: string;
  }

  export interface ReadReceiptEvent {
    type: 'read_receipt';
    reader: string;
    time: number;
    threadID: string;
  }

  export interface ReadEvent {
    type: 'read';
    threadID: string;
    time: number;
  }

  export interface PresenceEvent {
    type: 'presence';
    timestamp: number;
    userID: string;
    statuses: number;
  }

  export interface EventEvent {
    type: 'event';
    logMessageType: string;
    logMessageData: any;
    logMessageBody: string;
    threadID: string;
    senderID: string;
    timestamp: number;
  }

  export type Event = MessageEvent | TypingEvent | ReadReceiptEvent | ReadEvent | PresenceEvent | EventEvent;

  export interface Attachment {
    type: string;
    ID: string;
    url?: string;
    filename?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }

  export interface ThreadInfo {
    threadID: string;
    participants: string[];
    participantIDs: string[];
    name: string;
    nicknames: { [userID: string]: string };
    snippet: string;
    snippetSender: string;
    unreadCount: number;
    messageCount: number;
    imageSrc: string;
    timestamp: number;
    muteUntil: number;
    isGroup: boolean;
    isArchived: boolean;
    canReply: boolean;
    lastMessageTimestamp: number;
    lastReadTimestamp: number;
    emoji: string;
    color: string;
    adminIDs: string[];
    threadType: number;
  }

  export interface UserInfo {
    id: string;
    name: string;
    firstName: string;
    vanity: string;
    thumbSrc: string;
    profileUrl: string;
    gender: string;
    type: string;
    isFriend: boolean;
    isBirthday: boolean;
  }

  export interface SearchResult {
    messageID: string;
    threadID: string;
    authorID: string;
    body: string;
    timestamp: number;
    attachments: Attachment[];
  }

  export interface ForwardResult {
    threadID: string;
    success: boolean;
    error?: string;
    messageID?: string;
  }

  export interface BulkSendResult {
    threadID: string;
    success: boolean;
    error?: string;
    messageID?: string;
    timestamp?: number;
  }

  export interface Poll {
    success: boolean;
    pollID: string;
    threadID: string;
    question: string;
    options: string[];
  }

  export interface PollVote {
    success: boolean;
    pollID: string;
    optionID: number;
    voted: boolean;
  }

  export interface DownloadResult {
    success: boolean;
    path?: string;
    data?: Buffer;
    size: number;
  }

  export interface UnreadCountResult {
    threadID?: string;
    unreadCount?: number;
    threadName?: string;
    totalUnreadCount?: number;
    unreadThreadsCount?: number;
    threads?: Array<{
      threadID: string;
      threadName: string;
      unreadCount: number;
    }>;
  }

  export interface ScheduledMessage {
    scheduleId: string;
    scheduledTime: number;
    cancel: () => boolean;
  }

  export interface ScheduledMessageInfo {
    scheduleId: string;
    threadID: string;
    scheduledTime: number;
    createdAt: number;
    message: string;
  }

  export interface AttachmentMetadata {
    url: string;
    mediaType?: string;
    contentType?: string;
    fileSize?: number;
    fileSizeFormatted?: string;
    fileExtension?: string;
    lastModified?: string | null;
    etag?: string | null;
    isAccessible: boolean;
    error?: string;
    statusCode?: number;
  }

  export interface ScheduleMessageAPI {
    schedule(
      message: string | Message,
      threadID: string,
      scheduledTime: number,
      replyToMessage?: string
    ): ScheduledMessage;
    list(): ScheduledMessageInfo[];
    cancel(scheduleId: string): boolean;
    cancelAll(): number;
  }

  export interface API {
    getCurrentUserID(): string;
    getOptions(key?: string): any;
    setOptions(options: Options): void;
    getAppState(): AppState;

    sendMessage(
      message: string | Message,
      threadID: string,
      callback?: (err: any, info: MessageInfo) => void
    ): Promise<MessageInfo>;

    sendMessage(
      message: string | Message,
      threadID: string,
      replyToMessage: string,
      callback?: (err: any, info: MessageInfo) => void
    ): Promise<MessageInfo>;

    editMessage(
      newMessage: string,
      messageID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    unsendMessage(
      messageID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    forwardMessage(
      messageID: string,
      threadIDs: string | string[],
      callback?: (err: any, results: ForwardResult[]) => void
    ): Promise<ForwardResult[]>;

    searchMessages(
      query: string,
      threadID?: string,
      limit?: number,
      callback?: (err: any, results: SearchResult[]) => void
    ): Promise<SearchResult[]>;

    bulkSendMessage(
      message: string | Message,
      threadIDs: string[],
      delay?: number,
      callback?: (err: any, results: BulkSendResult[]) => void
    ): Promise<BulkSendResult[]>;

    createPoll(
      threadID: string,
      question: string,
      options: string[],
      callback?: (err: any, poll: Poll) => void
    ): Promise<Poll>;

    votePoll(
      pollID: string,
      optionID: number,
      addVote?: boolean,
      callback?: (err: any, result: PollVote) => void
    ): Promise<PollVote>;

    sendTypingIndicator(
      threadID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    markAsDelivered(
      messageID: string,
      threadID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    markAsRead(
      messageID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    markAsReadAll(
      callback?: (err: any) => void
    ): Promise<void>;

    markAsSeen(
      threadID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    setMessageReaction(
      reaction: string,
      messageID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    getThreadInfo(
      threadID: string,
      callback?: (err: any, info: ThreadInfo) => void
    ): Promise<ThreadInfo>;

    getThreadList(
      limit: number,
      timestamp: number | null,
      tags: string[],
      callback?: (err: any, threads: ThreadInfo[]) => void
    ): Promise<ThreadInfo[]>;

    getThreadHistory(
      threadID: string,
      amount: number,
      timestamp: number | null,
      callback?: (err: any, messages: MessageEvent[]) => void
    ): Promise<MessageEvent[]>;

    getUnreadCount(
      threadID?: string,
      callback?: (err: any, result: UnreadCountResult) => void
    ): Promise<UnreadCountResult>;

    scheduleMessage: ScheduleMessageAPI;

    getAttachmentMetadata(
      attachmentUrl: string,
      callback?: (err: any, metadata: AttachmentMetadata) => void
    ): Promise<AttachmentMetadata>;

    archiveThread(
      threadID: string,
      archive?: boolean,
      callback?: (err: any) => void
    ): Promise<{ success: boolean; threadID: string; archived: boolean }>;

    muteThread(
      threadID: string,
      muteSeconds?: number,
      callback?: (err: any) => void
    ): Promise<{ success: boolean; threadID: string; muteSeconds: number }>;

    gcname(
      newName: string,
      threadID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    gcmember(
      action: 'add' | 'remove',
      threadID: string,
      userIDs: string | string[],
      callback?: (err: any) => void
    ): Promise<void>;

    nickname(
      nickname: string,
      threadID: string,
      userID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    theme(
      color: string,
      threadID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    emoji(
      emoji: string,
      threadID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    getUserInfo(
      userID: string | string[],
      callback?: (err: any, info: { [userID: string]: UserInfo }) => void
    ): Promise<{ [userID: string]: UserInfo }>;

    getBlockedUsers(
      callback?: (err: any, blockedIDs: string[]) => void
    ): Promise<string[]>;

    downloadAttachment(
      attachmentURL: string,
      savePath?: string | null,
      callback?: (err: any, result: DownloadResult) => void
    ): Promise<DownloadResult>;

    comment(
      text: string,
      postID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    follow(
      userID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    share(
      url: string,
      threadID: string,
      callback?: (err: any) => void
    ): Promise<void>;

    story(
      message: string,
      callback?: (err: any) => void
    ): Promise<void>;

    logout(
      callback?: (err: any) => void
    ): Promise<void>;

    listenMqtt(
      callback: (err: any, event?: Event) => void
    ): () => void;

    httpGet(
      url: string,
      callback?: (err: any, response: any) => void
    ): Promise<any>;

    httpPost(
      url: string,
      data: any,
      callback?: (err: any, response: any) => void
    ): Promise<any>;

    ctx: any;
    defaultFuncs: any;
    globalOptions: Options;
  }

  export function login(
    credentials: Credentials,
    callback: (err: any, api?: API) => void
  ): void;

  export function login(
    credentials: Credentials,
    options: Options,
    callback: (err: any, api?: API) => void
  ): void;
}
