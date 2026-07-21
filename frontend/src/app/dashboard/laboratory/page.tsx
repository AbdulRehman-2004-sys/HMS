'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LaboratoryVerificationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/lab');
  }, [router]);

  return null;
}
