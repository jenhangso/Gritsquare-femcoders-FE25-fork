import { db, msgRef } from "./firebaseconfig.js";
import { push, ref, query, orderByChild, onValue, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { censorBadWords } from "./censor.js";
import { searchGifs, displayGifResults, getSelectedGif, clearSelectedGif } from "./gifapi.js";

const messageContainer = document.querySelector('#messages-display');
const renderedNotes = new Set();

// function som räknar tiden mellan inlägget som gjordes & nutiden
function formatTime(timestamp) {
    if (!timestamp) return "Just now";

    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return "Earlier";
}

//funktion som hämtar datan från firebase live
export function liveUpdate() {
    const sortedMessages = query(msgRef, orderByChild('createdAt'));

    onValue(sortedMessages, (snapshot) => {
        messageContainer.innerHTML = ''

        const messages = snapshot.val();
        if (messages) {
            const messageList = Object.entries(messages);
            messageList.reverse().forEach((entry) => {
                const id = entry[0];
                const message = entry[1]
                render(message.text, id, message.createdAt, message.likes || 0, message.gifUrl);
            });
        }
        else {
            messageContainer.innerHTML = '<p class="no-messages">Low on good vibes, be the first to send some!</p>'
        }
    });
}

liveUpdate();

//funktion som lägger till data i firebase
export async function addMsg(text, gifUrl) {
    const resultData = {
            text: text,
            createdAt: serverTimestamp(),
            likes: 0,
            gifUrl: gifUrl,
        };

        const result = await push(msgRef, resultData);
        return result.key;
    }

//function som lägger till DOM-element
function render(text, id, createdAt, likes, gifUrl) {
    const noteCard = document.createElement('article');
    noteCard.classList.add('post-it')
    
    const newPost = createdAt && (Date.now() - createdAt) < 5000;
    if (newPost && !renderedNotes.has(id)) {
        noteCard.classList.add('new-post');

        void noteCard.offsetWidth;
        renderedNotes.add(id);
    }

    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    likeBtn.innerHTML = `❤️ <span>${likes}</span>`;

    likeBtn.addEventListener('click', () => {
        const postRef = ref(db, `messages/${id}/likes`);

        runTransaction(postRef, (currentLikes) => {
            return (currentLikes || 0) + 1;
        })
    })
    noteCard.appendChild(likeBtn);

    if (gifUrl) {
        const gifImg = document.createElement('img');
        gifImg.src = gifUrl;
        gifImg.style.maxWidth = '100%';
        gifImg.style.borderRadius = '8px';
        gifImg.style.marginBottom = '10px';
        noteCard.appendChild(gifImg);
    }

    const p = document.createElement('p');
    p.innerText = text;

    if (createdAt) {
        const timeLabel = document.createElement('span');
        timeLabel.classList.add('time-stamp');
        timeLabel.innerText = formatTime(createdAt);
        noteCard.appendChild(timeLabel);
    }

    noteCard.appendChild(p);
    messageContainer.appendChild(noteCard);
}

//öppnar och stänger message formulär + guidelines
const openBtn = document.querySelector('#openCard');
const card = document.querySelector('#card');
const guidelinesCard = document.querySelector('#guidelines');
const closeBtn = document.querySelector('#closeBtn')

let guidelinesManuallyClosed = false; //flagga för om guidelines har stängts av manuellt

openBtn.addEventListener('click', () => {
    const cardWasHidden = card.classList.contains('hidden') //kollar om formuläret är stängt

    card.classList.toggle('hidden');  

    if(cardWasHidden) {
        //om formuläret öppnades vid 'click'-> visa guidelines
        if (!guidelinesManuallyClosed){
            guidelinesCard.classList.remove('hidden');
        }
    } else {
        // om formuläret stängdes vid 'click'-> flagga nollställs och guidelines stängs
        guidelinesManuallyClosed = false;
        guidelinesCard.classList.add('hidden') 
    }
});

// Stäng guidelines kortet manuellt
closeBtn.addEventListener('click', () => {
    guidelinesCard.classList.add('hidden');
    guidelinesManuallyClosed = true;
});


// message card här (Elin)
const form = document.querySelector('#msgForm');
const input = document.querySelector('#messageInput');
const gifSearchInput = document.querySelector('#gifSearchInput');
const searchGifBtn = document.querySelector('#searchGifBtn');
const gifResults = document.querySelector('#gifResults');

searchGifBtn.addEventListener('click', async () => {
    clearSelectedGif();
    const search = gifSearchInput.value.trim();
    const gifs = await searchGifs(search);
    displayGifResults(gifs, '#gifResults')
})

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  const gifUrl = getSelectedGif();
  if (!text) return;

  const censoredText = censorBadWords(text);

  await addMsg(censoredText, gifUrl);

  form.reset();
  card.classList.add("hidden");
  gifSearchInput.value = '';
  gifResults.innerHTML = '';
  clearSelectedGif();
  guidelinesCard.classList.add('hidden') //guidelines stängs
  guidelinesManuallyClosed = false; // flagga nollställs
});