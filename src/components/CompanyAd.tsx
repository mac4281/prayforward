'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface Company {
  id: string;
  name?: string;
  img?: string;
  url?: string;
  views?: number;
  linkedClicked?: number;
  active?: boolean;
}

export default function CompanyAd() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompany() {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        // Query for active companies, ordered by lastShown (oldest first)
        const companiesRef = collection(db, 'companies');
        const q = query(
          companiesRef,
          orderBy('lastShown', 'asc'),
          limit(10) // Get more to filter for active ones
        );

        const querySnapshot = await getDocs(q);

        // Find the first active company
        for (const companyDoc of querySnapshot.docs) {
          const companyData = companyDoc.data();
          
          // Check if company is active (default to true if not specified)
          if (companyData?.active !== false) {
            const companyInfo: Company = {
              id: companyDoc.id,
              name: companyData?.name,
              img: companyData?.img || companyData?.imageUrl,
              url: companyData?.url,
              views: companyData?.views || 0,
              linkedClicked: companyData?.linkedClicked || 0,
              active: companyData?.active,
            };

            setCompany(companyInfo);

            // Increment views and update lastShown
            const companyRef = doc(db, 'companies', companyDoc.id);
            await updateDoc(companyRef, {
              views: increment(1),
              lastShown: serverTimestamp(),
            });
            
            break; // Found one, stop looking
          }
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, []);

  const handleClick = async () => {
    if (!company || !db) return;

    try {
      const companyRef = doc(db, 'companies', company.id);
      await updateDoc(companyRef, {
        linkedClicked: increment(1),
      });
    } catch (error) {
      console.error('Error incrementing click count:', error);
    }
  };

  if (loading || !company || !company.img) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="bg-white rounded-xl shadow-md border border-[#3D2817]/10 overflow-hidden">
        <Link
          href={company.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block"
        >
          <div className="relative w-full h-32 md:h-40">
            <Image
              src={company.img}
              alt={company.name || 'Community Partner'}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </Link>
      </div>
      <p className="text-center text-[#3D2817] text-sm mt-2">Community Partner</p>
    </div>
  );
}

