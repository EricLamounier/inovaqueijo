/*
  # InovaQueijo Database Schema

  ## Overview
  This migration creates the complete database structure for the InovaQueijo cheese innovation platform.

  ## New Tables

  ### 1. `ingredients`
  Stores all available ingredients with pricing and supplier information
  - `id` (uuid, primary key)
  - `name` (text) - Ingredient name
  - `category` (text) - Type: ferment, rennet, salt, additive, stabilizer
  - `supplier` (text) - Supplier name
  - `cost_per_kg` (numeric) - Cost in currency per kilogram
  - `description` (text) - Detailed description
  - `created_at` (timestamptz)

  ### 2. `experiments`
  Main experiments table tracking all cheese innovation tests
  - `id` (uuid, primary key)
  - `name` (text) - Experiment name
  - `objective` (text) - Innovation goal
  - `base_formula` (jsonb) - Original formula
  - `status` (text) - planning, in_progress, completed, validated
  - `created_by` (uuid) - User who created it
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 3. `treatments`
  Different treatment variations within an experiment
  - `id` (uuid, primary key)
  - `experiment_id` (uuid, foreign key)
  - `name` (text) - Treatment identifier (A, B, C)
  - `formula` (jsonb) - Complete formula with ingredients and quantities
  - `predicted_score` (numeric) - AI prediction score
  - `total_cost` (numeric) - Total cost of formula
  - `created_at` (timestamptz)

  ### 4. `production_data`
  Records from actual cheese production process
  - `id` (uuid, primary key)
  - `treatment_id` (uuid, foreign key)
  - `batch_number` (text)
  - `mixing_time` (integer) - Minutes
  - `cooking_temp` (numeric) - Celsius
  - `final_ph` (numeric)
  - `yield_percentage` (numeric)
  - `notes` (text)
  - `recorded_by` (uuid)
  - `recorded_at` (timestamptz)

  ### 5. `sensory_evaluations`
  Sensory panel ratings for cheese samples
  - `id` (uuid, primary key)
  - `treatment_id` (uuid, foreign key)
  - `evaluator_id` (uuid) - User who evaluated
  - `flavor_score` (integer) - 1 to 5 scale
  - `texture_score` (integer) - 1 to 5 scale
  - `aroma_score` (integer) - 1 to 5 scale
  - `appearance_score` (integer) - 1 to 5 scale
  - `overall_score` (integer) - 1 to 5 scale
  - `comments` (text)
  - `evaluation_date` (timestamptz)
  - `created_at` (timestamptz)

  ### 6. `ai_predictions`
  Stores AI model predictions and recommendations
  - `id` (uuid, primary key)
  - `experiment_id` (uuid, foreign key)
  - `recommended_ingredients` (jsonb)
  - `predicted_scores` (jsonb)
  - `confidence_level` (numeric) - 0 to 100
  - `reasoning` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies restrict access to authenticated users only
  - Users can view all data but modifications are tracked by user_id
*/

CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  supplier text NOT NULL,
  cost_per_kg numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  objective text NOT NULL,
  base_formula jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'planning',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name text NOT NULL,
  formula jsonb DEFAULT '{}'::jsonb,
  predicted_score numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id uuid NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  batch_number text NOT NULL,
  mixing_time integer DEFAULT 0,
  cooking_temp numeric DEFAULT 0,
  final_ph numeric DEFAULT 0,
  yield_percentage numeric DEFAULT 0,
  notes text DEFAULT '',
  recorded_by uuid NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensory_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id uuid NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  evaluator_id uuid NOT NULL,
  flavor_score integer NOT NULL CHECK (flavor_score >= 1 AND flavor_score <= 5),
  texture_score integer NOT NULL CHECK (texture_score >= 1 AND texture_score <= 5),
  aroma_score integer NOT NULL CHECK (aroma_score >= 1 AND aroma_score <= 5),
  appearance_score integer NOT NULL CHECK (appearance_score >= 1 AND appearance_score <= 5),
  overall_score integer NOT NULL CHECK (overall_score >= 1 AND overall_score <= 5),
  comments text DEFAULT '',
  evaluation_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  recommended_ingredients jsonb DEFAULT '{}'::jsonb,
  predicted_scores jsonb DEFAULT '{}'::jsonb,
  confidence_level numeric DEFAULT 0,
  reasoning text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensory_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ingredients"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ingredients"
  ON ingredients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view experiments"
  ON experiments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert experiments"
  ON experiments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update experiments"
  ON experiments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view treatments"
  ON treatments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert treatments"
  ON treatments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view production data"
  ON production_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert production data"
  ON production_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view evaluations"
  ON sensory_evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert evaluations"
  ON sensory_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view predictions"
  ON ai_predictions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert predictions"
  ON ai_predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);