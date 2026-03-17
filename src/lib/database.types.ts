export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      career_goals: {
        Row: {
          user_id: string;
          target_role: string | null;
          target_company: string | null;
          salary_goal: number | null;
          experience_level: "entry" | "junior" | "mid" | "senior" | "lead";
          desired_locations: string[];
          is_onboarded: boolean;
        };
      };
      candidate_profiles: {
        Row: {
          user_id: string;
          current_title: string | null;
          years_experience: number | null;
          skills: string[];
          tools: string[];
          proof_of_work_urls: string[];
        };
      };
      jobs: {
        Row: {
          id: string;
          company: string;
          role_title: string;
          location: string | null;
          salary_range: string | null;
          required_skills: string[];
          work_mode: "remote" | "hybrid" | "onsite" | "unknown";
          is_active: boolean;
        };
      };
      user_job_matches: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          match_score: number;
          readiness_score: number;
          skill_overlap: string[];
          missing_skills: string[];
        };
      };
      prep_tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          day_number: number;
          task_type: string;
          skill_tags: string[];
          duration_minutes: number | null;
          status: "todo" | "in_progress" | "done" | "skipped";
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          ats_score: number | null;
        };
      };
      applications: {
        Row: {
          id: string;
          company: string;
          role: string;
          status: "saved" | "applied" | "screening" | "interview" | "offer" | "rejected" | "archived";
          next_action_date: string | null;
          notes: string | null;
        };
      };
      readiness_snapshots: {
        Row: {
          id: string;
          user_id: string;
          overall_score: number;
          skill_coverage_score: number | null;
          proof_of_work_score: number | null;
          resume_fit_score: number | null;
          prep_consistency_score: number | null;
          role_clarity_score: number | null;
          application_hygiene_score: number | null;
          top_gaps: string[];
          next_best_action: Json;
          created_at: string;
        };
      };
    };
  };
}
