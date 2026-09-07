-- ============================================================
-- MindBloom — Sprint 14 SQL Migration (FINAL SPRINT)
-- File: supabase/sprint14_payment.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── user_subscriptions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id             TEXT        NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free','premium','pro')),
  status              TEXT        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active','trialing','past_due','canceled','expired')),
  billing_cycle       TEXT        CHECK (billing_cycle IN ('monthly','yearly')),
  trial_ends_at       TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  canceled_at         TIMESTAMPTZ,
  midtrans_subscription_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
  ON public.user_subscriptions (user_id, status);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role (webhook) needs full access — handled via service_role key bypass of RLS

-- ── payment_transactions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id            TEXT        NOT NULL CHECK (plan_id IN ('free','premium','pro')),
  billing_cycle      TEXT        NOT NULL CHECK (billing_cycle IN ('monthly','yearly')),
  amount             INTEGER     NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','settlement','expire','cancel','deny','failure')),
  midtrans_order_id  TEXT        NOT NULL UNIQUE,
  midtrans_token     TEXT,
  payment_type       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user
  ON public.payment_transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order
  ON public.payment_transactions (midtrans_order_id);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.payment_transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Add plan column to profiles (if not exists from Sprint 1) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free','premium','pro'));

-- ── Auto-downgrade expired subscriptions (run daily via cron) ──
CREATE OR REPLACE FUNCTION public.downgrade_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Downgrade subscriptions past their period end
  UPDATE public.user_subscriptions
  SET
    status  = 'expired',
    plan_id = 'free',
    updated_at = NOW()
  WHERE
    status IN ('active', 'canceled')
    AND current_period_end IS NOT NULL
    AND current_period_end < NOW();

  -- Sync profiles.plan for expired subscriptions
  UPDATE public.profiles p
  SET plan = 'free', updated_at = NOW()
  FROM public.user_subscriptions s
  WHERE
    p.id = s.user_id
    AND s.status = 'expired'
    AND p.plan != 'free';

  -- Downgrade expired trials that never converted to paid
  UPDATE public.user_subscriptions
  SET
    status  = 'expired',
    plan_id = 'free',
    updated_at = NOW()
  WHERE
    status = 'trialing'
    AND trial_ends_at < NOW();

  UPDATE public.profiles p
  SET plan = 'free', updated_at = NOW()
  FROM public.user_subscriptions s
  WHERE
    p.id = s.user_id
    AND s.status = 'expired'
    AND s.plan_id = 'free'
    AND p.plan != 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule via pg_cron (if extension available):
-- SELECT cron.schedule('downgrade-expired-subs', '0 1 * * *', 'SELECT public.downgrade_expired_subscriptions()');

-- ── Trigger: keep profiles.plan in sync on subscription changes ─
CREATE OR REPLACE FUNCTION public.sync_profile_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('active', 'trialing') THEN
    UPDATE public.profiles SET plan = NEW.plan_id, updated_at = NOW() WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('expired', 'canceled') AND
        (NEW.current_period_end IS NULL OR NEW.current_period_end < NOW()) THEN
    UPDATE public.profiles SET plan = 'free', updated_at = NOW() WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_plan ON public.user_subscriptions;
CREATE TRIGGER trg_sync_profile_plan
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_plan();

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_subscriptions','payment_transactions');

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'plan';
