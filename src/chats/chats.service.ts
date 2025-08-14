import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ChatsRepository } from './chatRepository/chats.repository';
import { YoutubeStreamsService } from '../youtube-streams/youtube-streams.service';
import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/jwt-strategy';
import { createKoProfanityFilter } from './filter';

type RoomId = number;
type UserId = number;

interface PresenceEntry {
  sockets: Set<string>; // 이 유저가 이 방에서 사용 중인 소켓들(탭/기기)
  lastSeen: number; // 마지막 활동 시각 (ms epoch)
}

@Injectable()
export class ChatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatsService.name);
  private readonly profanity = createKoProfanityFilter({ placeholder: '*' });

  // 방 -> (유저 -> 프레즌스)
  private readonly presence = new Map<RoomId, Map<UserId, PresenceEntry>>();
  // 소켓 -> 유저
  private readonly socketUser = new Map<string, UserId>();
  // 소켓 -> 참여 중인 방 집합
  private readonly socketRooms = new Map<string, Set<RoomId>>();

  // 하트비트가 없더라도 허용할 유효 윈도우 / 스윕 주기
  private readonly heartbeatWindowMs = 45_000; // 45초
  private readonly sweepEveryMs = 15_000; // 15초
  private sweepTimer?: NodeJS.Timeout;

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly youtubeStreamsService: YoutubeStreamsService,
  ) {}

  onModuleInit() {
    this.sweepTimer = setInterval(() => this.sweepStale(), this.sweepEveryMs);
  }

  onModuleDestroy() {
    if (this.sweepTimer) clearInterval(this.sweepTimer);
  }

  // 유틸
  private now() {
    return Date.now();
  }
  private roomKey(streamId: number): RoomId {
    return streamId;
  }
  private ensureRoom(roomId: RoomId): Map<UserId, PresenceEntry> {
    let room = this.presence.get(roomId);
    if (!room) {
      room = new Map<UserId, PresenceEntry>();
      this.presence.set(roomId, room);
    }
    return room;
  }

  // --- 프레즌스 핵심 로직 -----------------------------

  private addSocketToRoom(socketId: string, roomId: RoomId, userId: UserId) {
    // socket 인덱스
    this.socketUser.set(socketId, userId);
    const rooms = this.socketRooms.get(socketId) ?? new Set<RoomId>();
    rooms.add(roomId);
    this.socketRooms.set(socketId, rooms);

    // room 프레즌스
    const room = this.ensureRoom(roomId);
    const entry = room.get(userId) ?? { sockets: new Set<string>(), lastSeen: 0 };
    entry.sockets.add(socketId);
    entry.lastSeen = this.now();
    room.set(userId, entry);
  }

  private removeSocketFromRoom(socketId: string, roomId: RoomId) {
    const userId = this.socketUser.get(socketId);
    if (userId == null) return;

    // 소켓-방 매핑에서 제거
    const rooms = this.socketRooms.get(socketId);
    if (rooms) {
      rooms.delete(roomId);
      if (rooms.size === 0) this.socketRooms.delete(socketId);
      else this.socketRooms.set(socketId, rooms);
    }

    // 방 프레즌스에서 제거/정리
    const room = this.presence.get(roomId);
    if (!room) return;
    const entry = room.get(userId);
    if (!entry) return;

    entry.sockets.delete(socketId);
    entry.lastSeen = this.now();
    if (entry.sockets.size === 0) {
      room.delete(userId);
    } else {
      room.set(userId, entry);
    }
    if (room.size === 0) this.presence.delete(roomId);
  }

  private detachSocketEverywhere(socketId: string) {
    const rooms = this.socketRooms.get(socketId);
    if (rooms) {
      for (const roomId of rooms) {
        this.removeSocketFromRoom(socketId, roomId);
      }
    }
    this.socketUser.delete(socketId);
    this.socketRooms.delete(socketId);
  }

  private sweepStale() {
    const cutoff = this.now() - this.heartbeatWindowMs;
    for (const [roomId, room] of this.presence) {
      for (const [userId, entry] of room) {
        if (entry.lastSeen < cutoff || entry.sockets.size === 0) {
          room.delete(userId);
        }
      }
      if (room.size === 0) this.presence.delete(roomId);
    }
  }

  // --- 외부에서 쓰는 API --------------------------------

  getRoomUserCount(youtubeStreamId: number): number {
    const room = this.presence.get(this.roomKey(youtubeStreamId));
    return room?.size ?? 0; // 사용자 기준(탭/기기 중복 제거)
  }

  getRoomUsers(youtubeStreamId: number): number[] {
    const room = this.presence.get(this.roomKey(youtubeStreamId));
    return room ? Array.from(room.keys()) : [];
  }

  heartbeat(client: Socket, youtubeStreamId: number, user?: JwtPayload) {
    const userId = user?.userId;
    if (!userId) return;
    const roomId = this.roomKey(youtubeStreamId);

    // 이미 방에 참여한 상태면 lastSeen만 갱신
    const room = this.presence.get(roomId);
    const entry = room?.get(userId);
    if (entry) {
      entry.lastSeen = this.now();
      room!.set(userId, entry);
    }
  }

  onSocketDisconnect(client: Socket) {
    // Gateway의 handleDisconnect에서 호출해 주세요.
    this.detachSocketEverywhere(client.id);
  }

  // --- 기존 기능 + 프레즌스 연동 -----------------------

  async createChat(youtubeStreamId: number, message: string, userId: number): Promise<void> {
    this.logger.log(`채팅 메시지 저장: ${message} (Stream ID: ${youtubeStreamId}, userId ID: ${userId})`);
    const { found, cleaned, matches } = this.profanity.filter(message);
    if (found) {
      this.logger.warn(`욕설 필터 적용: ${matches.join(', ')} :: "${message}" -> "${cleaned}"`);
    }
    await this.chatsRepository.createChat(youtubeStreamId, cleaned, userId);

    // 메시지 전송도 활동으로 간주 → lastSeen 갱신
    const room = this.presence.get(this.roomKey(youtubeStreamId));
    const entry = room?.get(userId);
    if (entry) {
      entry.lastSeen = this.now();
      room!.set(userId, entry);
    }
  }

  async joinRoom(client: Socket, youtubeStreamId: number, user?: JwtPayload): Promise<void> {
    this.logger.log(`유저 ${user?.userId ?? null}가 채팅방에 입장: Stream ID ${youtubeStreamId}`);
    await client.join(`room-${youtubeStreamId}`);
    if (user?.userId != null) {
      this.addSocketToRoom(client.id, this.roomKey(youtubeStreamId), user.userId);
      client.to(`room-${youtubeStreamId}`).emit('chat', `${user.userId}가 채팅방에 입장했습니다.`);
    }
  }

  async leaveRoom(client: Socket, youtubeStreamId: number, user?: JwtPayload): Promise<void> {
    this.logger.log(`유저가 채팅방에서 나감: Stream ID ${youtubeStreamId}`);
    client.to(`room-${youtubeStreamId}`).emit('chat', `${user?.userId ?? null}가 채팅방에서 나갔습니다.`);
    await client.leave(`room-${youtubeStreamId}`);

    this.removeSocketFromRoom(client.id, this.roomKey(youtubeStreamId));
  }
}
