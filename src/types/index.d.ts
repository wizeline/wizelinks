/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}

declare module '*.csv' {
  const content: string;
  export = content;
}

type ShortLinkEntry = {
  shortLink: string;
  description: string;
  link: string;
  tags: string[];
};

type DomainEntry = {
  domain: string;
  description: string;
};

type URLFilter = chrome.events.UrlFilter[];
type SearchHandler = {
  urlFilter: URLFilter;
  getSearchTerm: (url: URL) => string;
};

type LinkHandler = {
  urlFilter: URLFilter;
  getLink: (url: URL) => Promise<ShortLinkEntry>;
};

declare namespace Message {
  type BaseMessage<Action, Data> = {
    action: Action;
    data: Data;
  };
  type BaseMessageResponse<Response> = Response;
  type MessageHandlerConfig<Action = any, MessageBody = any, Response = any> = {
    handler: (
      message: BaseMessage<Action, MessageBody>,
      sendResponse: (response: BaseMessageResponse<Response>) => void
    ) => void;
    getMessage: (messageBody: MessageBody) => BaseMessage<Action, MessageBody>;
  };
}
// TODO: Move types to /messages/types.d.ts?
type MessageHandlersMap<Handlers extends Record<string, Message.MessageHandlerConfig>> = {
  [Key in keyof Handlers]: Handlers[Key]['handler'];
};
type MessageCreatorsMap<Handlers extends Record<string, Message.MessageHandlerConfig>> = {
  [Key in keyof Handlers]: Handlers[Key]['getMessage'];
};
type EntryMessageHandler = [string, MessageHandler][];
type MessageHandler = Message.MessageHandlerConfig['handler'];

declare namespace ShortLinkAPI {
  type SearchFilters = {
    tag?: string;
  };
  type Response<T extends ShortLinkEntry | Array<ShortLinkEntry> | undefined = undefined> = {
    success: boolean;
  } & (T extends undefined ? { error?: string } : { data: T });
}
interface ShortLinkAPI<> {
  resolve: (shortLink: string) => Promise<ShortLinkAPI.Response<ShortLinkEntry>>;
  search: (
    shortLink: string,
    filters?: ShortLinkAPI.SearchFilters
  ) => Promise<ShortLinkAPI.Response<ShortLinkEntry[]>>;
  add: (linkData: ShortLinkEntry) => Promise<ShortLinkAPI.Response>;
  update: (linkData: ShortLinkEntry) => Promise<ShortLinkAPI.Response>;
  remove: (shortLink: string) => Promise<ShortLinkAPI.Response>;
}

type BrowserAPIs = {
  storage: StorageWrapper;
  webNavigation: WebNavigationWrapper;
  runtime: RuntimeWrapper;
  tabs: TabsWrapper;
  omnibox: OmniboxWrapper;
};

type BrowserAPIUnregisterFn = () => void;

declare namespace WebNavigationWrapper {
  type CallbackDetails = {
    frameId: number;
    tabId: number;
    url: string;
  };
}
interface WebNavigationWrapper<Filters = any> {
  onBeforeNavigate: (
    callback: (details: WebNavigationWrapper.CallbackDetails) => void | Promise<void>,
    filters: Filters
  ) => BrowserAPIUnregisterFn;
}

declare namespace StorageWrapper {
  type Changes = Record<string, any>;
}
interface StorageWrapper {
  onChanged: (
    keys: string[],
    callback: (changes: StorageWrapper.Changes) => void
  ) => BrowserAPIUnregisterFn;
  set: (values: StorageWrapper.Changes) => Promise<void>;
  get: (values: string[]) => Promise<StorageWrapper.Changes>;
}

interface RuntimeWrapper {
  onMessage: (callback: (message: any, sendResponse: (response?: any) => void) => void) => void;
  sendMessage: <Message = any, Response = any>(message: Message) => Promise<Response>;
  getURL: (path: string) => string;
}

declare namespace TabsWrapper {
  type UpdateProperties = {
    url: string;
  };
}
interface TabsWrapper {
  update: (tabId: number, options: TabsWrapper.UpdateProperties) => void;
  updateCurrent: (options: TabsWrapper.UpdateProperties) => void;
}

declare namespace OmniboxWrapper {
  type OnInputEnteredCallback = (input: string) => void;
  type OnInputChangedCallback<SuggestResult = any> = (
    input: string,
    suggest: (suggestResults: SuggestResult[]) => void
  ) => void;
  type OmniboxEvent = 'inputChanged' | 'inputEntered';
  type OmniboxHandler<Event extends OmniboxEvent> = Event extends 'inputChanged'
    ? OnInputChangedCallback
    : Event extends 'inputEntered'
    ? OnInputEnteredCallback
    : never;
}
interface OmniboxWrapper<SuggestResult = any> {
  onInputEntered: (callback: OmniboxWrapper.OnInputEnteredCallback) => void;
  onInputChanged: (callback: OmniboxWrapper.OnInputChangedCallback<SuggestResult>) => void;
}
