import AuthButton from './AuthButton.jsx'
import foodIcon from '../assets/food-serving.png'

export default function Header() {
    return (
        <header>
            <div className="header-brand">
                <img src={foodIcon} alt="Chef Icon" />
                <h1>Chef Claude</h1>
            </div>
            <AuthButton />
        </header>
    )
}
