import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './repository/users.repository';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { User } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  let mockUsersRepository: {
    findByLoginId: jest.Mock<Promise<User | null>, [string]>;
    create: jest.Mock<Promise<void>, [CreateUserDto]>;
  };

  beforeEach(async () => {
    mockUsersRepository = {
      findByLoginId: jest.fn<Promise<User | null>, [string]>(),
      create: jest.fn<Promise<void>, [CreateUserDto]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    jest.clearAllMocks();
    service = module.get<UsersService>(UsersService);
  });

  it('유저 서비스가 정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('회원가입', () => {
    it('이미 존재하는 아이디일 경우 ConflictException을 발생시킴', async () => {
      mockUsersRepository.findByLoginId.mockResolvedValue({
        id: 1,
        loginId: 'test',
        loginPassword: 'encrypted',
        nickname: 'nick',
      } as User);
      const dto: CreateUserDto = {
        loginId: 'test',
        loginPassword: 'pass',
        nickname: 'nick',
      };
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockUsersRepository.findByLoginId).toHaveBeenCalledWith(
        dto.loginId,
      );
    });

    it('정상적으로 회원가입되는 경우', async () => {
      mockUsersRepository.findByLoginId.mockResolvedValue(null);
      const hashSpy = jest.spyOn(bcrypt, 'hash') as unknown as jest.SpyInstance<
        Promise<string>,
        [string, number]
      >;
      hashSpy.mockResolvedValue('hashedPassword');
      const dto: CreateUserDto = {
        loginId: 'test',
        loginPassword: 'pass',
        nickname: 'nick',
      };
      await service.create(dto);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.loginPassword, 10);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        loginId: dto.loginId,
        loginPassword: 'hashedPassword',
        nickname: dto.nickname,
      });
    });
  });
});
