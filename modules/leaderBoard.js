import { query, orderByChild, limitToLast, onValue, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { msgRef } from "./firebaseconfig.js";

const leaderBoardQuery = query(
    msgRef,
    orderByChild("likes"),
    limitToLast(10)
)

onValue(leaderBoardQuery, (snapshot) => {
    const data = snapshot.val()
    if (!data) return;

    const leaderboard = Object.entries(data)
        .map(([id, msg]) => ({
            id,
            text: msg.text,
            likes: msg.likes

        }))
        .sort((a, b) => b.likes - a.likes)
    console.log(leaderboard)

    const listEl = document.querySelector('#leaderBoardList')
    listEl.innerHTML = ''
    leaderboard.forEach((item, index) => {
        const li = document.createElement('li')
        li.textContent = `${ index + 1 }. ${ item.text } - ❤️ ${ item.likes }`
        listEl.appendChild(li)
    })
})








