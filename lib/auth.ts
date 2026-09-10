import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { User } from './types';

const SESSION_COOKIE = 'lala_session';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie?.value) {
    return null;
  }

  const userId = sessionCookie.value;
  const db = getDb();
  const user = db.prepare('SELECT id, full_name, email, role, avatar_color, created_at FROM users WHERE id = ?').get(userId) as User | undefined;

  return user || null;
}

export async function loginUser(email: string, passwordPlain: string): Promise<User | null> {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as (User & { password_hash: string }) | undefined;

  if (!user) {
    return null;
  }

  const matches = bcrypt.compareSync(passwordPlain, user.password_hash);
  if (!matches) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  const { password_hash, ...safeUser } = user;
  return safeUser as User;
}

export async function setDemoSession(userId: string): Promise<User | null> {
  const db = getDb();
  const user = db.prepare('SELECT id, full_name, email, role, avatar_color, created_at FROM users WHERE id = ?').get(userId) as User | undefined;
  if (!user) return null;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return user;
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
