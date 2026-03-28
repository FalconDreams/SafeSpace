import { useState, useCallback } from 'react';
import { PropertySearch } from '../components/features/PropertyLookup/PropertySearch';
import { PropertyDetails } from '../components/features/PropertyLookup/PropertyDetails';
import { CommunityComments } from '../components/features/PropertyLookup/CommunityComments';
import { RebuttalForm } from '../components/features/PropertyLookup/RebuttalForm';
import { supabase } from '../lib/supabase';
import type { Report, Comment as DbComment, Rebuttal, Property } from '../types/database';

export function PropertyLookupPage() {
  const [searchedAddress, setSearchedAddress] = useState('');
  const [property, setProperty] = useState<Property | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [comments, setComments] = useState<DbComment[]>([]);
  const [rebuttals, setRebuttals] = useState<Rebuttal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchPropertyData = useCallback(async (addressHash: string) => {
    const { data: prop } = await supabase
      .from('properties')
      .select('*')
      .eq('address_hash', addressHash)
      .single();

    if (prop) {
      setProperty(prop);

      const [reportsRes, commentsRes, rebuttalsRes] = await Promise.all([
        supabase.from('reports').select('*').eq('property_id', prop.id).order('created_at', { ascending: false }),
        supabase.from('comments').select('*').eq('property_id', prop.id).order('created_at', { ascending: false }),
        supabase.from('rebuttals').select('*').eq('property_id', prop.id),
      ]);

      setReports(reportsRes.data || []);
      setComments(commentsRes.data || []);
      setRebuttals(rebuttalsRes.data || []);
    } else {
      setProperty(null);
      setReports([]);
      setComments([]);
      setRebuttals([]);
    }
  }, []);

  const handleSearch = async (address: string) => {
    setSearchedAddress(address);
    setLoading(true);
    setSearched(true);

    // Create a simple hash from the address for lookup
    const normalized = address.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const addressHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    await fetchPropertyData(addressHash);
    setLoading(false);
  };

  const handleRefresh = () => {
    if (property) {
      fetchPropertyData(property.address_hash);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Property Health Lookup</h1>
        <p className="mt-2 text-lg text-text-muted">
          Research rental property health history and read community experiences
        </p>
      </div>

      <PropertySearch onSearch={handleSearch} loading={loading} />

      {searched && !loading && property && (
        <>
          <PropertyDetails
            address={property.address_normalized}
            reports={reports}
            comments={comments}
            rebuttals={rebuttals}
          />

          <div className="border-t border-border pt-8">
            <CommunityComments
              propertyId={property.id}
              comments={comments}
              onCommentAdded={handleRefresh}
            />
          </div>

          {reports.length > 0 && (
            <div className="border-t border-border pt-8">
              <h3 className="mb-4 text-lg font-semibold text-text">Property Owner?</h3>
              <RebuttalForm reportId={reports[0].id} propertyId={property.id} />
            </div>
          )}
        </>
      )}

      {searched && !loading && !property && (
        <div className="py-12 text-center">
          <p className="text-text-muted">No records found for "{searchedAddress}"</p>
          <p className="mt-2 text-sm text-text-muted">
            This property has no reports yet. You can be the first to report an issue.
          </p>
        </div>
      )}

      {searched && (
        <div className="rounded-xl bg-surface-muted p-6">
          <p className="text-sm text-text-muted">
            <strong>Note:</strong> This information is compiled from community reports. Always conduct your own inspection and due diligence before renting.
          </p>
        </div>
      )}
    </div>
  );
}
