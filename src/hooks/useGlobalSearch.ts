import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'event' | 'meetup' | 'post' | 'community' | 'user' | 'item' | 'business';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  tags?: string[];
  matchedFields: string[];
}

export const useGlobalSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const searchAll = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setQuery(searchQuery);
    
    try {
      const searchTerm = `%${searchQuery.toLowerCase()}%`;
      const allResults: SearchResult[] = [];

      // Search events
      const { data: events } = await supabase
        .from('events')
        .select('*, event_type')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
        .limit(10);

      if (events) {
        events.forEach(event => {
          const matchedFields = [];
          if (event.title?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('title');
          if (event.description?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('description');
          if (event.location?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('location');

          allResults.push({
            id: event.id,
            type: event.event_type === 'meetup' ? 'meetup' : 'event',
            title: event.title,
            subtitle: event.location,
            description: event.description,
            imageUrl: event.image_url,
            location: event.location,
            matchedFields
          });
        });
      }

      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .or(`content.ilike.${searchTerm},location.ilike.${searchTerm}`)
        .limit(10);

      if (posts) {
        posts.forEach(post => {
          const matchedFields = [];
          if (post.content?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('content');
          if (post.location?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('location');

          allResults.push({
            id: post.id,
            type: 'post',
            title: 'User Post',
            subtitle: post.location,
            description: post.content,
            imageUrl: post.image_url,
            location: post.location,
            matchedFields
          });
        });
      }

      // Search communities
      const { data: communities } = await supabase
        .from('communities')
        .select('*')
        .or(`name.ilike.${searchTerm},tagline.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},subcategory.ilike.${searchTerm}`)
        .limit(10);

      if (communities) {
        communities.forEach(community => {
          const matchedFields = [];
          if (community.name?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('name');
          if (community.tagline?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('tagline');
          if (community.description?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('description');
          if (community.category?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('category');

          allResults.push({
            id: community.id,
            type: 'community',
            title: community.name,
            subtitle: community.tagline,
            description: community.description,
            imageUrl: community.logo_url,
            category: community.category,
            matchedFields
          });
        });
      }

      // Search users/profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.${searchTerm},bio.ilike.${searchTerm},location.ilike.${searchTerm}`)
        .limit(10);

      if (profiles) {
        profiles.forEach(profile => {
          const matchedFields = [];
          if (profile.name?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('name');
          if (profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('bio');
          if (profile.location?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('location');

          allResults.push({
            id: profile.id,
            type: 'user',
            title: profile.name || 'User',
            subtitle: profile.location,
            description: profile.bio,
            imageUrl: profile.profile_image_url,
            location: profile.location,
            matchedFields
          });
        });
      }

      // Search marketplace items
      const { data: items } = await supabase
        .from('items')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .limit(10);

      if (items) {
        items.forEach(item => {
          const matchedFields = [];
          if (item.title?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('title');
          if (item.description?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('description');
          if (item.category?.toLowerCase().includes(searchQuery.toLowerCase())) matchedFields.push('category');

          allResults.push({
            id: item.id,
            type: 'item',
            title: item.title,
            subtitle: `${item.price ? `$${item.price}` : ''} ${item.category || ''}`.trim(),
            description: item.description,
            imageUrl: item.image_url,
            category: item.category,
            matchedFields
          });
        });
      }

      // Sort results by relevance (title matches first, then by type priority)
      allResults.sort((a, b) => {
        const aHasTitle = a.matchedFields.includes('title') || a.matchedFields.includes('name');
        const bHasTitle = b.matchedFields.includes('title') || b.matchedFields.includes('name');
        
        if (aHasTitle && !bHasTitle) return -1;
        if (!aHasTitle && bHasTitle) return 1;
        
        // Priority order: events, meetups, communities, users, posts, items
        const typePriority = { event: 1, meetup: 2, community: 3, user: 4, post: 5, item: 6, business: 7 };
        return typePriority[a.type] - typePriority[b.type];
      });

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setQuery('');
  }, []);

  return {
    results,
    loading,
    query,
    searchAll,
    clearSearch
  };
};