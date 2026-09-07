-- ============================================================
-- MindBloom — Sprint 5 SQL Migration
-- File: supabase/sprint5_garden.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── garden_plants ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.garden_plants (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_id       UUID        REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  plant_type     TEXT        NOT NULL DEFAULT 'fern',
  stage          TEXT        NOT NULL DEFAULT 'sprout'
                             CHECK (stage IN ('seed','sprout','growing','bloom','full')),
  mood_score     SMALLINT,
  mood_category  TEXT,
  position_x     NUMERIC(5,2) NOT NULL DEFAULT 50,
  position_y     NUMERIC(5,2) NOT NULL DEFAULT 20,
  is_rare        BOOLEAN     NOT NULL DEFAULT FALSE,
  planted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bloomed_at     TIMESTAMPTZ,
  entry_date     DATE,
  note           TEXT,

  CONSTRAINT garden_plants_entry_unique UNIQUE (entry_id)
);

CREATE INDEX IF NOT EXISTS idx_garden_plants_user
  ON public.garden_plants (user_id, planted_at);

ALTER TABLE public.garden_plants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own garden plants" ON public.garden_plants;
CREATE POLICY "Users can manage own garden plants"
  ON public.garden_plants
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Function: auto-grow plant on journal finalize ─────────────
CREATE OR REPLACE FUNCTION public.grow_plant_from_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_streak       INTEGER;
  v_total        INTEGER;
  v_plant_type   TEXT;
  v_is_rare      BOOLEAN := FALSE;
  v_stage        TEXT;
  v_pos_x        NUMERIC;
  v_pos_y        NUMERIC;
  v_mood_map     JSONB := '{
    "happy":"sunflower","excited":"sunflower","calm":"lotus",
    "anxious":"fern","stressed":"cactus","tired":"willow","emotional":"lavender"
  }'::JSONB;
BEGIN
  -- Only run when finalizing draft → final
  IF NEW.is_draft = FALSE AND (OLD IS NULL OR OLD.is_draft = TRUE) THEN

    -- Skip if plant already exists for this entry
    IF EXISTS (SELECT 1 FROM public.garden_plants WHERE entry_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    -- Get streak
    SELECT current_streak INTO v_streak
    FROM public.streaks WHERE user_id = NEW.user_id;
    v_streak := COALESCE(v_streak, 0);

    -- Get total entries
    SELECT COUNT(*) INTO v_total
    FROM public.journal_entries
    WHERE user_id = NEW.user_id AND is_draft = FALSE AND is_deleted = FALSE;

    -- Determine plant type
    IF v_streak > 0 AND v_streak % 7 = 0 THEN
      v_plant_type := 'bamboo';
    ELSIF COALESCE(NEW.completion_pct, 0) >= 95 THEN
      v_plant_type := 'lavender';
      IF random() < 0.15 THEN
        v_plant_type := 'bonsai';
        v_is_rare := TRUE;
      END IF;
    ELSIF NEW.mood_category IS NOT NULL AND v_mood_map ? NEW.mood_category THEN
      v_plant_type := v_mood_map ->> NEW.mood_category;
    ELSE
      v_plant_type := 'fern';
    END IF;

    -- Rare sakura on every 10th entry (40% chance)
    IF v_total > 0 AND v_total % 10 = 0 AND random() < 0.4 THEN
      v_plant_type := 'sakura';
      v_is_rare := TRUE;
    END IF;

    -- Determine stage from mood score
    v_stage := CASE
      WHEN NEW.mood_score IS NULL THEN 'sprout'
      WHEN NEW.mood_score >= 8 THEN 'full'
      WHEN NEW.mood_score >= 6 THEN 'bloom'
      WHEN NEW.mood_score >= 4 THEN 'growing'
      ELSE 'sprout'
    END;

    -- Random position
    v_pos_x := 10 + random() * 80;
    v_pos_y := 5  + random() * 35;

    INSERT INTO public.garden_plants (
      user_id, entry_id, plant_type, stage,
      mood_score, mood_category, position_x, position_y,
      is_rare, planted_at, bloomed_at, entry_date
    ) VALUES (
      NEW.user_id, NEW.id, v_plant_type, v_stage,
      NEW.mood_score, NEW.mood_category, v_pos_x, v_pos_y,
      v_is_rare, NOW(),
      CASE WHEN v_stage IN ('bloom','full') THEN NOW() ELSE NULL END,
      NEW.entry_date
    )
    ON CONFLICT (entry_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_grow_plant ON public.journal_entries;
CREATE TRIGGER trg_grow_plant
  AFTER INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.grow_plant_from_journal();

-- ── Verify ────────────────────────────────────────────────────
SELECT
  schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'garden_plants';
