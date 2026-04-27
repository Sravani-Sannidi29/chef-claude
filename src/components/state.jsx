import React from 'react'
import starEmpty from "../assets/empty-star1.svg"
import starFilled from "../assets/filled-star1.svg"
import CountFun from "./count.jsx"
import padsData from "./pads"
import PadComponent from './pad.jsx'

// export default function StatePractice() {
//     let [count, setCount] = React.useState(0)

//     function add() {
//         setCount(prevCount => prevCount+1)

//     }
//     function minus() {
//         setCount(prevCount => prevCount-1)
//     }
//     let [isGoingOut, setIsGoingOut] = React.useState(true)
//     function flip(){
//         setIsGoingOut(prevIsGoingOut => !prevIsGoingOut)
//     }
//     return (
//         <main className="container">
//             <h1 className='title'>Add or Minus</h1>
//             <div className="counter">
//                 <button onClick={minus} className="minus" aria-label="Decrease count">-</button>
//                 <CountFun countNum = {count} />
//                 <button onClick={add} className="plus" aria-label="Increase count">+</button>
//             </div>
//             <button onClick = {flip} className='value'>{isGoingOut ? 'Yes':'No'}</button>
//         </main>
//     )
// }

// export default function ComplexState() {
//     const [myFavoriteThings, setmyFavoriteThings] = React.useState([])
//     const allFavoriteThings = ["🍔", "🍕", "🍜", "🌮", "🍣"]
//     const thingsElements = myFavoriteThings.map(thing => <p key={thing}>{thing}</p>)
//     function addFavoriteThings() {
//         setmyFavoriteThings(prevFavThings => [...prevFavThings, allFavoriteThings[prevFavThings.length]])
//     }
//     return (
//         <main>
//             <button onClick={addFavoriteThings}>Add Item</button>
//             <section aria-live="polite">
//                 {thingsElements}
//             </section>
//         </main>
//     )
// }





// export default function ComplexStateObjects() {
//     const [contact, setContact] = React.useState({
//         firstName: "John",
//         lastName: "Doe",
//         phone: "+1 (212) 555-1212",
//         email: "itsmyrealname@example.com",
//         isFavorite: false
//     })

//     let starIcon = contact.isFavorite ? starFilled : starEmpty

//     function toggleFavorite() {
//         setContact(prevContact => {
//             return {
//                 ...prevContact, isFavorite: !prevContact.isFavorite
//             }
//         })

//     }

//     return (
//         <main>
//             <article className="card">

//                 <div className="info">
//                     <button
//                         onClick={toggleFavorite}
//                         aria-pressed={contact.isFavorite}
//                         aria-label={contact.isFavorite ? "Remove from favourites" : "Add to favorites"}
//                         className="favorite-button"
//                     >
//                         <img
//                             src={starIcon}
//                             aria-pressed={false}
//                             className='favorite'
//                             alt={contact.isFavorite ? "filled star icon" : "empty star icon"}
//                         />

//                     </button>

//                     <h2 className="name">

//                         {contact.firstName} {contact.lastName}
//                     </h2>
//                     <p className="contact">{contact.phone}</p>
//                     <p className="contact">{contact.email}</p>
//                 </div>

//             </article>
//         </main>
//     )
// }


// export default function Joke(props) {
//     let [isShown, setIsShown] = React.useState(false)


//     function toggleIsShown() {
//         setIsShown(prevIsShown => !prevIsShown)
//     }
//     console.log(isShown)
//     return (
//         <div>
//             {props.setup ? <h3>{props.setup}</h3> : null}
//             {isShown ? <p>{props.punchLine}</p> : null}
//             <hr />
//             <button onClick={toggleIsShown}>{isShown ? "Hide punchline": "Show punchline"}</button>

//         </div>
//     )
// }

export default function Sounds(props) {
    const darkMode = props.darkModeValue
    const [pads, setPads] = React.useState(padsData)
    const styles = {
        backgroundColor: darkMode ? "#222222" : "#cccccc"
    }
    function toggle(id){

        setPads(prevPads => prevPads.map(item => {
            return item.id === id? {...item,on: !item.on} : item
        }))
    }
    const buttonElements = pads.map(pad => (
        <PadComponent
            toggle={toggle}
            id={pad.id}
            key={pad.id}
            color={pad.color}
            on={pad.on}
        />
    ))
    return (
        <main>
            <div className='pad-container'>
                {buttonElements}


            </div>
        </main>
    )
}