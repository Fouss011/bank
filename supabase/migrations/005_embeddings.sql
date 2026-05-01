create extension if not exists vector;

alter table public.document_chunks
add column if not exists embedding vector(1536);

create index if not exists document_chunks_embedding_idx
on public.document_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  match_bank_id uuid,
  match_scope document_scope,
  allowed_levels access_level[],
  match_count int default 6
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index int,
  content text,
  similarity float,
  document_title text,
  document_category text,
  min_access_level access_level
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    d.title as document_title,
    d.category as document_category,
    d.min_access_level
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id
  where dc.bank_id = match_bank_id
    and d.scope = match_scope
    and d.status = 'published'
    and d.min_access_level = any(allowed_levels)
    and dc.embedding is not null
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;