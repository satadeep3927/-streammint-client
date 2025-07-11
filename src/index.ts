// Main client
export { StreamClient } from "./client/index";

// Individual services for advanced usage
export { AuthService } from "./services/auth.service";
export { ProjectService } from "./services/project.service";
export { MessageService } from "./services/message.service";
export { FileService } from "./services/file.service";
export { PulseService } from "./services/pulse.service";
export { default as UserService } from "./services/user.service";
export { default as ChannelService } from "./services/channel.service";
export { default as ParticipantService } from "./services/participant.service";
export { CryptoService } from "./services/crypto.service";
export { default as BaseService } from "./services/service";

// Types
export type * from "./types/main";
export type * from "./types/user.type";
export type * from "./types/message.type";
export type * from "./types/channel.type";
export type * from "./types/file.type";
export type * from "./types/pulse.type";
export type * from "./types/events.type";

// Utility functions
export { getWebSocketFromHttpUrl } from "./lib/utils";
