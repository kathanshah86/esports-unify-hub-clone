
-- Attach the Refer & Earn reward triggers to tournament_registrations so the
-- ₹10 credit reliably reaches the battle code referrer's main account.

DROP TRIGGER IF EXISTS trg_reward_battle_code_referrer_on_insert ON public.tournament_registrations;
DROP TRIGGER IF EXISTS trg_reward_battle_code_referrer_on_approval ON public.tournament_registrations;

CREATE TRIGGER trg_reward_battle_code_referrer_on_insert
AFTER INSERT ON public.tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION public.reward_battle_code_referrer_on_insert();

CREATE TRIGGER trg_reward_battle_code_referrer_on_approval
AFTER UPDATE OF payment_status ON public.tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION public.reward_battle_code_referrer_on_approval();
