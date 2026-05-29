import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('allows routes marked as public without requiring a JWT', () => {
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(false);
    const handler = jest.fn();
    const controller = class TestController {};
    const context = {
      getHandler: jest.fn().mockReturnValue(handler),
      getClass: jest.fn().mockReturnValue(controller),
    } as unknown as ExecutionContext;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const guard = new (JwtAuthGuard as any)(reflector) as JwtAuthGuard;

    expect(guard.canActivate(context)).toBe(true);
    expect(superCanActivate).not.toHaveBeenCalled();
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      handler,
      controller,
    ]);
    superCanActivate.mockRestore();
  });
});
