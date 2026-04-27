import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function AuthButton() {
    const { user, loading, signIn, signUp, signOut } = useAuth()
    const [showModal, setShowModal] = useState(false)
    const [mode, setMode] = useState('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [successMsg, setSuccessMsg] = useState(null)

    if (loading) return null

    if (user) {
        return (
            <div className="auth-user">
                <span className="auth-email">{user.email}</span>
                <button className="auth-btn auth-btn--signout" onClick={signOut}>
                    Sign out
                </button>
            </div>
        )
    }

    function openModal() {
        setShowModal(true)
        setError(null)
        setSuccessMsg(null)
        setEmail('')
        setPassword('')
        setMode('signin')
    }

    function closeModal() {
        setShowModal(false)
        setError(null)
        setSuccessMsg(null)
    }

    function switchMode() {
        setMode(m => m === 'signin' ? 'signup' : 'signin')
        setError(null)
        setSuccessMsg(null)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            if (mode === 'signin') {
                await signIn(email, password)
                closeModal()
            } else {
                await signUp(email, password)
                setSuccessMsg('Account created! Check your email to confirm, then sign in.')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <button className="auth-btn auth-btn--signin" onClick={openModal}>
                Sign in
            </button>

            {showModal && (
                <div className="auth-modal-overlay" onClick={closeModal}>
                    <div className="auth-modal" onClick={e => e.stopPropagation()}>
                        <button className="auth-modal-close" onClick={closeModal} aria-label="Close">×</button>
                        <h3>{mode === 'signin' ? 'Sign in' : 'Create account'}</h3>

                        {successMsg ? (
                            <p className="auth-success">{successMsg}</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="auth-form">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <input
                                    type="password"
                                    placeholder="Password (min 6 characters)"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                {error && <p className="auth-error">{error}</p>}
                                <button type="submit" className="auth-submit-btn" disabled={submitting}>
                                    {submitting ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
                                </button>
                            </form>
                        )}

                        <p className="auth-switch">
                            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={switchMode} className="auth-switch-btn">
                                {mode === 'signin' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
