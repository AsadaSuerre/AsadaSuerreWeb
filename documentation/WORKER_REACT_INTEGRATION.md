# React Integration Guide

This guide shows how to connect your React frontend to the Cloudflare Worker API.

## Environment Setup

### 1. Add Environment Variable to React

In your React project's `.env` file:

```bash
VITE_API_URL=http://localhost:8787
```

For production:

```bash
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

### 2. Create API Service

Create `src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ==================== CARDS ====================

export interface Card {
  id: number;
  title: string;
  description: string;
  date?: string;
  image?: string;
  subtitle?: string;
  tag?: string;
  badge?: string;
  icon?: string;
  url?: string;
  google_maps_url?: string;
  variant: string;
  authors: Array<{
    id: number;
    name: string;
    avatar?: string;
  }>;
  items: Array<{
    id: number;
    item: string;
  }>;
}

export async function getCards(variant?: string): Promise<Card[]> {
  const query = variant ? `?variant=${variant}` : '';
  return apiFetch<Card[]>(`/cards${query}`);
}

export async function getCard(id: number): Promise<Card> {
  return apiFetch<Card>(`/cards?id=${id}`);
}

export async function createCard(card: Partial<Card>): Promise<Card> {
  return apiFetch<Card>('/cards', {
    method: 'POST',
    body: JSON.stringify(card),
  });
}

export async function updateCard(id: number, card: Partial<Card>): Promise<Card> {
  return apiFetch<Card>(`/cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(card),
  });
}

export async function deleteCard(id: number): Promise<void> {
  return apiFetch<void>(`/cards/${id}`, {
    method: 'DELETE',
  });
}

// ==================== CONTACTS ====================

export interface Contacts {
  id: number;
  whatsapp_phone_info?: string;
  whatsapp_phone_support?: string;
  facebook_url?: string;
}

export async function getContacts(): Promise<Contacts> {
  return apiFetch<Contacts>('/contacts');
}

export async function updateContacts(contacts: Partial<Contacts>): Promise<Contacts> {
  return apiFetch<Contacts>('/contacts', {
    method: 'PUT',
    body: JSON.stringify(contacts),
  });
}

// ==================== HOME SLIDES ====================

export interface HomeSlide {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  description: string;
  sort_order: number;
}

export async function getHomeSlides(): Promise<HomeSlide[]> {
  return apiFetch<HomeSlide[]>('/home-slides');
}

export async function createHomeSlide(slide: Partial<HomeSlide>): Promise<HomeSlide> {
  return apiFetch<HomeSlide>('/home-slides', {
    method: 'POST',
    body: JSON.stringify(slide),
  });
}

export async function updateHomeSlide(id: number, slide: Partial<HomeSlide>): Promise<HomeSlide> {
  return apiFetch<HomeSlide>(`/home-slides/${id}`, {
    method: 'PUT',
    body: JSON.stringify(slide),
  });
}

export async function deleteHomeSlide(id: number): Promise<void> {
  return apiFetch<void>(`/home-slides/${id}`, {
    method: 'DELETE',
  });
}

// ==================== TIMELINE ====================

export interface TimelineItem {
  id: number;
  year: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  sort_order: number;
}

export async function getTimeline(): Promise<TimelineItem[]> {
  return apiFetch<TimelineItem[]>('/timeline');
}

export async function createTimelineItem(item: Partial<TimelineItem>): Promise<TimelineItem> {
  return apiFetch<TimelineItem>('/timeline', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function updateTimelineItem(id: number, item: Partial<TimelineItem>): Promise<TimelineItem> {
  return apiFetch<TimelineItem>(`/timeline/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}

export async function deleteTimelineItem(id: number): Promise<void> {
  return apiFetch<void>(`/timeline/${id}`, {
    method: 'DELETE',
  });
}

// ==================== STATS ====================

export interface Stat {
  id: number;
  number: string;
  label: string;
  sort_order: number;
}

export async function getStats(): Promise<Stat[]> {
  return apiFetch<Stat[]>('/stats');
}

export async function updateStats(stats: Stat[]): Promise<Stat[]> {
  return apiFetch<Stat[]>('/stats', {
    method: 'PUT',
    body: JSON.stringify(stats),
  });
}

// ==================== ABOUT CONTENT ====================

export interface AboutContent {
  id: number;
  content_type: string;
  title: string;
  content: string;
}

export async function getAboutContent(): Promise<AboutContent[]> {
  return apiFetch<AboutContent[]>('/about');
}

export async function getAboutContentByType(type: string): Promise<AboutContent> {
  return apiFetch<AboutContent>(`/about/${type}`);
}

export async function upsertAboutContent(type: string, content: Partial<AboutContent>): Promise<AboutContent> {
  return apiFetch<AboutContent>(`/about/${type}`, {
    method: 'PUT',
    body: JSON.stringify(content),
  });
}
```

## React Component Examples

### Example 1: Fetching Cards by Variant

```typescript
import { useEffect, useState } from 'react';
import { getCards, Card } from '../services/api';

function NewsList() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCards() {
      try {
        const data = await getCards('news');
        setCards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cards');
      } finally {
        setLoading(false);
      }
    }

    loadCards();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {cards.map((card) => (
        <div key={card.id}>
          <h2>{card.title}</h2>
          <p>{card.description}</p>
          {card.date && <small>{card.date}</small>}
          {card.tag && <span>{card.tag}</span>}
        </div>
      ))}
    </div>
  );
}

export default NewsList;
```

### Example 2: Creating a Card

```typescript
import { useState } from 'react';
import { createCard, Card } from '../services/api';

function CreateCardForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [variant, setVariant] = useState('news');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newCard: Partial<Card> = {
        title,
        description,
        variant,
        date: new Date().toLocaleDateString('es-ES'),
      };
      
      await createCard(newCard);
      setTitle('');
      setDescription('');
      alert('Card created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Variant:</label>
        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        >
          <option value="news">News</option>
          <option value="service">Service</option>
          <option value="governance">Governance</option>
          <option value="contact">Contact</option>
        </select>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Card'}
      </button>
    </form>
  );
}

export default CreateCardForm;
```

### Example 3: Fetching Stats

```typescript
import { useEffect, useState } from 'react';
import { getStats, Stat } from '../services/api';

function StatsDisplay() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div className="stat-number">{stat.number}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsDisplay;
```

### Example 4: Fetching About Content

```typescript
import { useEffect, useState } from 'react';
import { getAboutContentByType, AboutContent } from '../services/api';

function MissionSection() {
  const [mission, setMission] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMission() {
      try {
        const data = await getAboutContentByType('mission');
        setMission(data);
      } catch (err) {
        console.error('Failed to load mission:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMission();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!mission) return <div>No mission found</div>;

  return (
    <section className="mission-section">
      <h2>{mission.title}</h2>
      <p>{mission.content}</p>
    </section>
  );
}

export default MissionSection;
```

## Using React Query (TanStack Query)

For more advanced data fetching, you can use React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCards, createCard, Card } from '../services/api';

// Custom hook for fetching cards
export function useCards(variant?: string) {
  return useQuery({
    queryKey: ['cards', variant],
    queryFn: () => getCards(variant),
  });
}

// Custom hook for creating a card
export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

// Usage in component
function CardList() {
  const { data: cards, isLoading, error } = useCards('news');
  const createMutation = useCreateCard();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading cards</div>;

  return (
    <div>
      {cards?.map((card) => (
        <div key={card.id}>{card.title}</div>
      ))}
    </div>
  );
}
```

## Error Handling

All API functions throw errors on failure. Wrap your calls in try-catch:

```typescript
import { getCards } from '../services/api';

async function handleFetch() {
  try {
    const cards = await getCards('news');
    // Success
  } catch (error) {
    if (error instanceof Error) {
      console.error('API Error:', error.message);
      // Show error to user
    }
  }
}
```

## Production Deployment

When deploying to production:

1. Update `.env.production`:
   ```bash
   VITE_API_URL=https://your-worker.your-subdomain.workers.dev
   ```

2. Deploy your React app as usual (Vercel, Netlify, etc.)

3. The API URL will automatically switch based on the environment

## Notes

- The API includes CORS headers, so cross-origin requests work
- All responses are JSON
- Cards with authors and items are automatically nested in the response
- Use the `variant` parameter to filter cards by type (news, service, governance, contact)
