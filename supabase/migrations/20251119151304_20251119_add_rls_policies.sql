/*
  # Add RLS Policies for InovaQueijo Tables

  1. Security
    - Add RLS policies for experiments, ingredients, treatments, production_data, sensory_evaluations, and ai_predictions
    - Allow authenticated users to view and manage their own experiment data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'experiments' AND policyname = 'Users can view own experiments'
  ) THEN
    CREATE POLICY "Users can view own experiments"
      ON experiments FOR SELECT
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'experiments' AND policyname = 'Users can create experiments'
  ) THEN
    CREATE POLICY "Users can create experiments"
      ON experiments FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'experiments' AND policyname = 'Users can update own experiments'
  ) THEN
    CREATE POLICY "Users can update own experiments"
      ON experiments FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by)
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'experiments' AND policyname = 'Users can delete own experiments'
  ) THEN
    CREATE POLICY "Users can delete own experiments"
      ON experiments FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ingredients' AND policyname = 'Allow all users to view ingredients'
  ) THEN
    CREATE POLICY "Allow all users to view ingredients"
      ON ingredients FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'treatments' AND policyname = 'Users can view treatments of own experiments'
  ) THEN
    CREATE POLICY "Users can view treatments of own experiments"
      ON treatments FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM experiments
          WHERE experiments.id = treatments.experiment_id
          AND experiments.created_by = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'treatments' AND policyname = 'Users can create treatments'
  ) THEN
    CREATE POLICY "Users can create treatments"
      ON treatments FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM experiments
          WHERE experiments.id = treatments.experiment_id
          AND experiments.created_by = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'production_data' AND policyname = 'Users can view production data'
  ) THEN
    CREATE POLICY "Users can view production data"
      ON production_data FOR SELECT
      TO authenticated
      USING (auth.uid() = recorded_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'production_data' AND policyname = 'Users can create production data'
  ) THEN
    CREATE POLICY "Users can create production data"
      ON production_data FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = recorded_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sensory_evaluations' AND policyname = 'Users can view sensory evaluations'
  ) THEN
    CREATE POLICY "Users can view sensory evaluations"
      ON sensory_evaluations FOR SELECT
      TO authenticated
      USING (auth.uid() = evaluator_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sensory_evaluations' AND policyname = 'Users can create sensory evaluations'
  ) THEN
    CREATE POLICY "Users can create sensory evaluations"
      ON sensory_evaluations FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = evaluator_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_predictions' AND policyname = 'Users can view ai predictions'
  ) THEN
    CREATE POLICY "Users can view ai predictions"
      ON ai_predictions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM experiments
          WHERE experiments.id = ai_predictions.experiment_id
          AND experiments.created_by = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_predictions' AND policyname = 'Users can create ai predictions'
  ) THEN
    CREATE POLICY "Users can create ai predictions"
      ON ai_predictions FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM experiments
          WHERE experiments.id = ai_predictions.experiment_id
          AND experiments.created_by = auth.uid()
        )
      );
  END IF;
END $$;
