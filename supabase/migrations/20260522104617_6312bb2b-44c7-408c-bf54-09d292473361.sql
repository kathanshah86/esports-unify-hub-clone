create or replace function public.sync_tournament_participant_count(_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _tournament_id is null then
    return;
  end if;

  update public.tournaments
  set
    current_participants = (
      select count(*)::integer
      from public.tournament_registrations tr
      where tr.tournament_id = _tournament_id
        and coalesce(tr.payment_status, 'completed') not in ('failed', 'rejected')
        and coalesce(tr.status, 'registered') <> 'disqualified'
    ),
    updated_at = now()
  where id = _tournament_id;
end;
$$;

create or replace function public.handle_tournament_registration_count_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.sync_tournament_participant_count(new.tournament_id);
    return new;
  elsif tg_op = 'UPDATE' then
    if new.tournament_id is distinct from old.tournament_id then
      perform public.sync_tournament_participant_count(old.tournament_id);
    end if;
    perform public.sync_tournament_participant_count(new.tournament_id);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.sync_tournament_participant_count(old.tournament_id);
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_tournament_registration_count_change on public.tournament_registrations;

create trigger trg_tournament_registration_count_change
after insert or update or delete on public.tournament_registrations
for each row
execute function public.handle_tournament_registration_count_change();

update public.tournaments t
set
  current_participants = counts.participant_count,
  updated_at = now()
from (
  select
    t.id,
    count(tr.id)::integer as participant_count
  from public.tournaments t
  left join public.tournament_registrations tr
    on tr.tournament_id = t.id
    and coalesce(tr.payment_status, 'completed') not in ('failed', 'rejected')
    and coalesce(tr.status, 'registered') <> 'disqualified'
  group by t.id
) counts
where t.id = counts.id;