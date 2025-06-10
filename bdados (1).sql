SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE TYPE public.blood_clots_enum AS ENUM ('Present', 'Absent');
CREATE TYPE public.blood_color_enum AS ENUM ('Bright red', 'Dark Red', 'Brown', 'Pink', 'Black', 'Orange', 'Other');
CREATE TYPE public.contraceptive_status_enum AS ENUM ('Current user', 'Not current user', 'Never used');
CREATE TYPE public.contraceptive_type_enum AS ENUM (
  'Combination pill', 'Progestogen-only pill', 'Combination skin patch', 'Depot progestogen injection',
  'Hormone implant', 'Vaginal ring', 'IUD with hormone', 'IUD without hormone',
  'Female sterilisation', 'Male sterilisation', 'Diaphragm', 'Vaginal douching',
  'Female condom', 'Male condom', 'Withdrawal', 'Fertility awareness method', 'Abstinence'
);
CREATE TYPE public.flow_enum AS ENUM ('Flooding', 'Heavy flow', 'Medium flow', 'Light flow', 'Spotting', 'No bleeding');
CREATE TYPE public.menses_status_enum AS ENUM ('Bleeding', 'Not bleeding');
CREATE TYPE public.menstrual_cycle_desc_enum AS ENUM (
  'Mid-Cycle Bleeding', 'Irregular Periods', 'Amenorrhea/No Period', 'Menorrhagia/Heavy Periods', 'Other'
);
CREATE TYPE public.mood_swings_enum AS ENUM ('Less than usual', 'As usual', 'More than usual');
CREATE TYPE public.pain_level_enum AS ENUM ('No pain', 'Slight pain', 'Moderate pain', 'Intense pain');
CREATE TYPE public.sleep_quality_enum AS ENUM ('Very Bad', 'Fairly Bad', 'Neutral', 'Fairly Good', 'Very Good');
CREATE TYPE public.typical_pattern_enum AS ENUM ('Regular', 'Irregular');

CREATE SEQUENCE public.user_id_user_seq START 1;
CREATE SEQUENCE public.menstrual_diary_id_diario_seq START 1;

CREATE TABLE public."user" (
  email character varying(255) NOT NULL,
  password character varying(255) NOT NULL,
  id_user integer NOT NULL DEFAULT nextval('public.user_id_user_seq'::regclass)
);

CREATE TABLE public."User_data" (
  id_user integer NOT NULL,
  data_nascimento date NOT NULL,
  peso integer NOT NULL,
  altura integer NOT NULL,
  cycle_pattern_lenght integer NOT NULL,
  last_menstrual_period date NOT NULL,
  cycle_patern public.typical_pattern_enum NOT NULL,
  contraceptive_status public.contraceptive_status_enum NOT NULL,
  contraceptive_type public.contraceptive_type_enum
);

CREATE TABLE public.menstrual_diary (
  id_diario integer NOT NULL DEFAULT nextval('public.menstrual_diary_id_diario_seq'::regclass),
  id_user integer NOT NULL,
  color public.blood_color_enum NOT NULL,
  blood_clots public.blood_clots_enum NOT NULL,
  flow public.flow_enum NOT NULL,
  menstrual_cycle_desc public.menstrual_cycle_desc_enum,
  sleep_duration integer NOT NULL,
  sleep_quality public.sleep_quality_enum NOT NULL,
  menses_status public.menses_status_enum NOT NULL,
  mood_swings public.mood_swings_enum NOT NULL,
  pain_level public.pain_level_enum NOT NULL,
  data_entrada date NOT NULL
);

ALTER TABLE public."user" ADD CONSTRAINT user_pkey PRIMARY KEY (id_user);
ALTER TABLE public."User_data" ADD CONSTRAINT "User_data_pkey" PRIMARY KEY (id_user);
ALTER TABLE public.menstrual_diary ADD CONSTRAINT menstrual_diary_pkey PRIMARY KEY (id_diario);

ALTER TABLE public."User_data"
  ADD CONSTRAINT "User_data_id_user_fkey" FOREIGN KEY (id_user) REFERENCES public."user"(id_user);

ALTER TABLE public.menstrual_diary
  ADD CONSTRAINT menstrual_diary_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);
