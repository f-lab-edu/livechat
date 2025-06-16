import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './jwt-strategy';
import { Socket } from 'socket.io';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request: Request = context.switchToHttp().getRequest();
  return request.user;
});

export const CurrentSocketUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const client = context.switchToWs().getClient<Socket>();
  const token = (client.handshake as { auth: { token?: string } }).auth?.token;
  if (!token) throw new UnauthorizedException('No token provided');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return payload;
  } catch (e) {
    throw new UnauthorizedException('Invalid or expired socket token');
  }
});

export const OptionalSocketUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const client = context.switchToWs().getClient<Socket>();
  const token = (client.handshake as { auth: { token?: string } }).auth?.token;
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return payload;
  } catch (e) {
    return undefined;
  }
});
