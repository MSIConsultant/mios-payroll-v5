export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          company_id: string | null
          user_id: string
          nama: string
          nik: string
          divisi: string | null
          jenis_kelamin: string
          npwp: string | null
          punya_npwp: boolean
          status_ptkp: string
          pph_ditanggung: boolean
          gaji_pokok: number
          benefit: number
          kendaraan: number
          pulsa: number
          operasional: number
          tunj_lain: number
          tanggung_jht_k: boolean
          tanggung_jp_k: boolean
          tanggung_kes_k: boolean
          jkk_rate: number
          ikut_kes: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          user_id: string
          nama: string
          nik: string
          divisi?: string | null
          jenis_kelamin: string
          npwp?: string | null
          punya_npwp: boolean
          status_ptkp: string
          pph_ditanggung: boolean
          gaji_pokok: number
          benefit?: number
          kendaraan?: number
          pulsa?: number
          operasional?: number
          tunj_lain?: number
          tanggung_jht_k: boolean
          tanggung_jp_k: boolean
          tanggung_kes_k: boolean
          jkk_rate: number
          ikut_kes: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          user_id?: string
          nama?: string
          nik?: string
          divisi?: string | null
          jenis_kelamin?: string
          npwp?: string | null
          punya_npwp?: boolean
          status_ptkp?: string
          pph_ditanggung?: boolean
          gaji_pokok?: number
          benefit?: number
          kendaraan?: number
          pulsa?: number
          operasional?: number
          tunj_lain?: number
          tanggung_jht_k?: boolean
          tanggung_jp_k?: boolean
          tanggung_kes_k?: boolean
          jkk_rate?: number
          ikut_kes?: boolean
          created_at?: string
        }
      }
      payroll_runs: {
        Row: {
          id: string
          employee_id: string
          user_id: string
          month: number
          year: number
          gross_bruto: number
          pph21: number
          thp: number
          breakdown_json: Json
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          user_id: string
          month: number
          year: number
          gross_bruto: number
          pph21: number
          thp: number
          breakdown_json: Json
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          user_id?: string
          month?: number
          year?: number
          gross_bruto?: number
          pph21?: number
          thp?: number
          breakdown_json?: Json
          created_at?: string
        }
      }
    }
  }
}
