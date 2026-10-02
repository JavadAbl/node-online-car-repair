import { SetMetadata } from '@nestjs/common';
import { PUBLIC_KEY } from './decorator-keys';

/**
 * Marks a handler/route as public: the authorization guard skips it entirely.
 * Everything else is guarded by default (secure by default) — the permission
 * is derived automatically from the controller and handler names.
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
