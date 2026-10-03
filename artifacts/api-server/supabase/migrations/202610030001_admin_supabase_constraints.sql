-- Slugs are the stable identifier used by the admin URL and signup site.
create unique index if not exists collections_slug_unique on public.collections (slug);

-- Serialize activation and switch the live collection in one transaction.
create or replace function public.activate_collection(target_collection_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('nynth-live-collection'));
  update public.collections set status = 'locked' where status = 'live' and id <> target_collection_id;
  update public.collections set status = 'live' where id = target_collection_id;
  if not found then
    raise exception 'Collection not found';
  end if;
end;
$$;

revoke all on function public.activate_collection(uuid) from public, anon, authenticated;
grant execute on function public.activate_collection(uuid) to service_role;
