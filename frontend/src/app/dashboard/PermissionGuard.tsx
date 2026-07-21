'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Permission } from '../../lib/permissions';
import { Activity } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
}

export default function PermissionGuard({ children, permission }: PermissionGuardProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hms_user');
    if (!savedUser) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(savedUser);
      if (user.permissions && user.permissions.includes(permission)) {
        setHasAccess(true);
      } else {
        router.push('/unauthorized');
      }
    } catch (e) {
      router.push('/login');
    } finally {
      setChecking(false);
    }
  }, [permission, router]);

  if (checking) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Activity className="h-6 w-6 animate-pulse text-teal-600" />
      </div>
    );
  }

  return hasAccess ? <>{children}</> : null;
}
