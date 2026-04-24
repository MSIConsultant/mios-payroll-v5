'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'
import { Shield, Check, X, AlertCircle, ExternalLink } from 'lucide-react'

function ConsentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // OAuth parameters from the URL
  const clientId = searchParams.get('client_id')
  const responseType = searchParams.get('response_type')
  const redirectUri = searchParams.get('redirect_uri')
  const scope = searchParams.get('scope')
  const state = searchParams.get('state')
  const codeChallenge = searchParams.get('code_challenge')
  const codeChallengeMethod = searchParams.get('code_challenge_method')

  useEffect(() => {
    async function checkUser() {
      if (!clientId) {
        setError('Missing OAuth parameters (client_id is required).')
        setLoading(false)
        return
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        // Redirect to login if not authenticated, preserving the OAuth params
        const currentUrl = window.location.href
        router.push(`/login?next=${encodeURIComponent(currentUrl)}`)
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [clientId, supabase, router])

  const handleAuthorize = async (approved: boolean) => {
    setLoading(true)
    
    try {
      // The Supabase OAuth Server requires a redirect back to the authorize endpoint
      // with either approved=true or approved=false.
      // The endpoint is: https://<project-id>.supabase.co/auth/v1/oauth/authorize
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) throw new Error('Supabase URL not configured')

      const authUrl = new URL(`${supabaseUrl}/auth/v1/oauth/authorize`)
      
      // Add all original parameters back
      if (clientId) authUrl.searchParams.set('client_id', clientId)
      if (responseType) authUrl.searchParams.set('response_type', responseType)
      if (redirectUri) authUrl.searchParams.set('redirect_uri', redirectUri)
      if (scope) authUrl.searchParams.set('scope', scope)
      if (state) authUrl.searchParams.set('state', state)
      if (codeChallenge) authUrl.searchParams.set('code_challenge', codeChallenge)
      if (codeChallengeMethod) authUrl.searchParams.set('code_challenge_method', codeChallengeMethod)
      
      // Add the approval status
      authUrl.searchParams.set('approved', approved.toString())

      // Redirect back to Supabase to complete the flow
      const targetUrl = authUrl.toString()
      window.location.assign(targetUrl)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
        />
        <p className="text-gray-500 font-medium">Verifying authorization request...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div>
          <h2 className="text-xl font-bold text-red-900">OAuth Error</h2>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div className="p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Authorize Application
        </h1>
        <p className="text-center text-gray-500 mb-8">
          An external application is requesting access to your <span className="font-semibold text-gray-700">MIOS Payroll</span> account.
        </p>

        <div className="bg-gray-50 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-4 last:mb-0">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client ID</p>
              <p className="text-sm font-medium text-gray-700 break-all">{clientId}</p>
            </div>
          </div>
          
          <div className="h-px bg-gray-200 my-4" />
          
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Requested Scopes</p>
            <div className="flex flex-wrap gap-2">
              {(scope || 'openid').split(' ').map((s) => (
                <span key={s} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleAuthorize(true)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Allow Access
          </button>
          
          <button
            onClick={() => handleAuthorize(false)}
            className="w-full py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 active:transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Deny Access
          </button>
        </div>
      </div>

      <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 italic text-xs text-center text-gray-400">
        Signed in as <span className="text-gray-500 font-medium">{user?.email}</span>
      </div>
    </motion.div>
  )
}

export default function OAuthConsentPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ConsentContent />
      </Suspense>
    </div>
  )
}
