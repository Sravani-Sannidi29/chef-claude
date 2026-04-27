import AuthButton from './AuthButton.jsx'

export default function Header() {
    return (
        <header>
            <div className="header-brand">
                <img src="src/assets/food-serving.png" alt="Chef Icon" />
                <h1>Chef Claude</h1>
            </div>
            <AuthButton />
        </header>
    )
}
