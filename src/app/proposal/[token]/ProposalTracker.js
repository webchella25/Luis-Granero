'use client';
import { useEffect } from 'react';

export default function ProposalTracker({ token }) {
  useEffect(() => {
    const key = `proposal_tracked_${token}`;
    if (sessionStorage.getItem(key)) return;
    fetch(`/api/proposal/${token}/track`, { method: 'POST' })
      .then(() => sessionStorage.setItem(key, '1'))
      .catch(() => {});
  }, [token]);
  return null;
}
